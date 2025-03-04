const { formatHand } = require("../../utils/utils");
const {
  beforeStart,
  insufficientBalance,
  balanceCheck,
  baccaratHelp,
} = require("../../utils/embeds");
const {
  getInfoByUserName,
  updateCasinoTurn,
} = require("../../controllers/users.controller");

const suits = ["H", "D", "C", "S"]; // Hearts, Diamonds, Clubs, Spades
const cardValues = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 0,
  J: 0,
  Q: 0,
  K: 0,
  A: 1,
};
async function showBaccaratHelp(interaction) {
  const help = baccaratHelp;

  await interaction.reply({
    embeds: [
      {
        title: `🎲 ${help.name}`,
        description: help.description,
        color: 0x00ff00,
        fields: [
          {
            name: "📋 Rules",
            value: help.rules.join("\n"),
            inline: false,
          },
          {
            name: "💰 Payouts",
            value: help.payouts.join("\n"),
            inline: false,
          },
          {
            name: "💡 Tips",
            value: help.tips.join("\n"),
            inline: false,
          },
        ],
        footer: {
          text: "Use /baccarat [bet] [amount] to start playing!",
        },
      },
    ],
    ephemeral: true,
  });
}
const baccaratCommand = {
  name: "baccarat",
  description: "Play a game of Baccarat against the banker",
  options: [
    {
      name: "play",
      description: "Play a game of Baccarat",
      type: 1, // Subcommand
      options: [
        {
          name: "bet",
          description: "Place your bet (Player, Banker, or Tie)",
          type: 3, // STRING type
          required: true,
          choices: [
            { name: "Player", value: "player" },
            { name: "Banker", value: "banker" },
            { name: "Tie", value: "tie" },
          ],
        },
        {
          name: "amount",
          description: "Amount to bet (100-100000) (default: 100)",
          type: 4, // INTEGER type
          required: true,
          min_value: 100,
          max_value: 100000,
        },
      ],
    },
    {
      name: "help",
      description: "Show detailed rules and information about Baccarat",
      type: 1, // Subcommand
    },
  ],
};

function createDeck() {
  const deck = [];
  // Use 6 decks of cards with suits
  for (let i = 0; i < 6; i++) {
    for (const suit of suits) {
      for (const card of Object.keys(cardValues)) {
        deck.push(`${card}${suit}`); // Creates cards like "AS", "10H", "KD"
      }
    }
  }
  // Shuffle deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function calculateHand(hand) {
  const total =
    hand.reduce((sum, card) => {
      // Extract the value part of the card (removing suit)
      const value = card.slice(0, -1);
      return sum + cardValues[value];
    }, 0) % 10;
  return total;
}

async function handleBaccarat(interaction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "help") {
    return await showBaccaratHelp(interaction);
  }

  const betType = interaction.options.getString("bet");
  const betAmount = interaction.options.getInteger("amount") || 100;

  const userInfo = await getInfoByUserName(interaction.user.username);
  if (!userInfo) {
    return await interaction.reply(beforeStart);
  }
  if (userInfo.casinoTurn < betAmount) {
    return await interaction.reply(insufficientBalance(userInfo, betAmount));
  }

  await interaction.reply({
    embeds: [
      {
        title: "🎲 Baccarat",
        description: "Dealing cards...",
        color: 0x00ff00,
      },
    ],
  });

  const deck = createDeck();
  const playerHand = [deck.pop(), deck.pop()];
  const bankerHand = [deck.pop(), deck.pop()];

  const playerTotal = calculateHand(playerHand);
  const bankerTotal = calculateHand(bankerHand);

  let result;
  let color;
  let winnings = 0;

  if (playerTotal > bankerTotal) {
    result = "💻 Player wins! ";
    winnings = betType === "player" ? betAmount : -betAmount;
    color = 0x00ff00;
  } else if (bankerTotal > playerTotal) {
    result = "💰 Banker wins! ";
    winnings = betType === "banker" ? Math.floor(betAmount * 0.95) : -betAmount;
    color = 0xff0000;
  } else {
    result = "🤝 It's a tie! ";
    if (betType != "tie") {
      winnings = 0;
      color = 0xffff00;
      result += "Your bet is returned.";
    } else {
      winnings = betType === "tie" ? betAmount * 8 : -betAmount;
      color = 0xffff00;
    }
  }

  const updatedUser = await updateCasinoTurn(
    winnings,
    interaction.user.username
  );
  await interaction.editReply({
    embeds: [
      {
        author: {
          name: interaction.user.username,
          icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
        },
        title: "🎲 Baccarat - Game Result",
        description:
          `Your bet: ${betAmount} on ${betType}\n\n` +
          `Player's hand: ${formatHand(playerHand)} (Total: ${playerTotal})\n` +
          `Banker's hand: ${formatHand(
            bankerHand
          )} (Total: ${bankerTotal})\n\n` +
          `${result}\n`,
        color: color,
        timestamp: new Date(),
        footer: {
          text: "🎲 Casino Royale",
          icon_url: interaction.client.user.displayAvatarURL(),
        },
      },
    ],
  });

  let balanceMessage =
    winnings === 0
      ? "It's a tie! Your bet is returned.\n"
      : `You ${winnings >= 0 ? "won" : "lost"} ${Math.abs(winnings)} Turns.\n`;
  balanceMessage += `**Current Balance:** ${updatedUser.casinoTurn}`;
  await interaction.followUp(balanceCheck(balanceMessage));
}

module.exports = {
  command: baccaratCommand,
  handler: handleBaccarat,
};
