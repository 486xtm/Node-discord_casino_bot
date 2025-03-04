const { formatHand } = require("../../utils/utils");
const {
  beforeStart,
  insufficientBalance,
  threeCardPokerHelp,
  balanceCheck,
} = require("../../utils/embeds");
const {
  getInfoByUserName,
  updateCasinoTurn,
} = require("../../controllers/users.controller");
const suits = ["D", "H", "S", "C"];
const ranks = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

const threeCardPokerCommand = {
  name: "threecardpoker",
  description: "Play a game of Three Card Poker against the dealer",
  options: [
    {
      name: "play",
      description: "Start a new game of Three Card Poker",
      type: 1, // Subcommand
      options: [
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
      description: "Show detailed rules and information about Three Card Poker",
      type: 1, // Subcommand
    },
  ],
};

function createDeck() {
  const deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push(`${rank}${suit}`);
    }
  }
  // Shuffle deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function handRank(hand) {
  const values = hand.map((card) => card.slice(0, -1));
  const suits = hand.map((card) => card.slice(-1));

  // Check for flush
  const isFlush = new Set(suits).size === 1;

  // Check for straight
  const valueIndices = values.map((value) => ranks.indexOf(value));
  valueIndices.sort((a, b) => a - b);
  const isSequential = valueIndices.every(
    (val, i) => i === 0 || val === valueIndices[i - 1] + 1
  );

  // Check for Three of a Kind
  if (new Set(values).size === 1) {
    return [3, ranks.indexOf(values[0])]; // Three of a kind
  }

  // Check for Straight Flush
  if (isFlush && isSequential) {
    return [2, Math.max(...valueIndices)]; // Straight Flush
  }

  // Check for Flush
  if (isFlush) {
    return [4, Math.max(...valueIndices)]; // Flush
  }

  // Check for Straight
  if (isSequential) {
    return [5, Math.max(...valueIndices)]; // Straight
  }

  // Check for Pair
  const valueCounts = {};
  values.forEach((value) => {
    valueCounts[value] = (valueCounts[value] || 0) + 1;
  });

  for (const [value, count] of Object.entries(valueCounts)) {
    if (count === 2) {
      return [6, ranks.indexOf(value)]; // Pair
    }
  }

  // High Card
  return [7, Math.max(...valueIndices)];
}

function determineWinner(playerHand, dealerHand) {
  const playerRank = handRank(playerHand);
  const dealerRank = handRank(dealerHand);
  let message = "";
  let result = 2;
  if (playerRank[0] < dealerRank[0]) {
    message = "You win! 🎉";
    result = 1;
  } else if (playerRank[0] > dealerRank[0]) {
    message = "Dealer wins! 😔";
    result = 0;
  } else {
    if (playerRank[1] > dealerRank[1]) {
      message = "You win! 🎉";
      result = 1;
    } else if (playerRank[1] < dealerRank[1]) {
      message = "Dealer wins! 😔";
      result = 0;
    } else {
      message = "It's a tie! 🤝";
    }
  }
  return { message, result };
}

async function showThreeCardPokerHelp(interaction) {
  const help = threeCardPokerHelp;

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
            name: "🏆 Hand Rankings",
            value: help.handRankings.join("\n"),
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
          text: "Use /threecardpoker [bet] to start playing!",
        },
      },
    ],
    ephemeral: true,
  });
}

async function handleThreeCardPoker(interaction) {
  const subcommand = interaction.options.getSubcommand(false);

  if (subcommand === "help") {
    return showThreeCardPokerHelp(interaction);
  }

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
        title: "🎲 Three Card Poker",
        description: "Dealing cards...",
        color: 0x00ff00,
      },
    ],
  });

  const deck = createDeck();
  const playerHand = [deck.pop(), deck.pop(), deck.pop()];
  const dealerHand = [deck.pop(), deck.pop(), deck.pop()];

  const playerHandStr = formatHand(playerHand);
  const dealerHandStr = formatHand([dealerHand[0], "BACK", "BACK"]); // `${dealerHand[0]} ?? ??`;

  const row = {
    type: 1,
    components: [
      {
        type: 2,
        custom_id: "play",
        label: "Play",
        emoji: "✅", // Green checkmark
        style: 2, // PRIMARY (Blue)
      },
      {
        type: 2,
        custom_id: "fold",
        label: "Fold",
        emoji: "❌", // Red X
        style: 2, // DANGER (Red)
      },
    ],
  };

  await interaction.editReply({
    embeds: [
      {
        author: {
          name: interaction.user.username,
          icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
        },
        title: "🎲 Three Card Poker",
        description: `Your hand: ${playerHandStr}\nDealer's hand: ${dealerHandStr}\n\nWould you like to play or fold?`,
        color: 0x00ff00,
        timestamp: new Date(),
        footer: {
          text: "🎲 Casino Royale",
          icon_url: interaction.client.user.displayAvatarURL(),
        },
      },
    ],
    components: [row],
  });

  try {
    const filter = (i) => i.user.id === interaction.user.id;
    const response = await interaction.channel.awaitMessageComponent({
      filter,
      time: 120000,
    });

    if (response.customId === "fold") {
      const updatedUser = await updateCasinoTurn(
        -betAmount,
        interaction.user.username
      );
      await interaction.editReply({
        embeds: [
          {
            author: {
              name: interaction.user.username,
              icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
            },
            title: "🎲 Three Card Poker - Game Over",
            description: `You folded! 😔 Dealer wins by default.`,
            color: 0xff0000,
            timestamp: new Date(),
            footer: {
              text: "🎲 Casino Royale",
              icon_url: interaction.client.user.displayAvatarURL(),
            },
          },
        ],
        components: [],
      });
      await interaction.followUp(
        balanceCheck(
          `You folded! Lost ${betAmount} Turns.\n**Current Balance:** ${updatedUser.casinoTurn}`
        )
      );
      return;
    }

    const { message, result } = determineWinner(playerHand, dealerHand);
    const updatedUser = await updateCasinoTurn(
      result === 1 ? betAmount : result === 0 ? -betAmount : 0,
      interaction.user.username
    );
    await interaction.editReply({
      embeds: [
        {
          author: {
            name: interaction.user.username,
            icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
          },
          title: "🎲 Three Card Poker - Game Over",
          description: `Your hand: ${playerHandStr}\nDealer's hand: ${formatHand(
            dealerHand
          )}`,
          color: result === 1 ? 0x00ff00 : result === 0 ? 0xff0000 : orange,
          timestamp: new Date(),
          footer: {
            text: "🎲 Casino Royale",
            icon_url: interaction.client.user.displayAvatarURL(),
          },
        },
      ],
      components: [],
    });
    let balanceMessage =
      `${message}\n` + `**Current Balance:** ${updatedUser.casinoTurn}`;
    await interaction.followUp(balanceCheck(balanceMessage));
  } catch (error) {
    const updatedUser = await updateCasinoTurn(
      -Math.floor(betAmount / 2),
      interaction.user.username
    );
    await interaction.editReply({
      embeds: [
        {
          author: {
            name: interaction.user.username,
            icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
          },
          title: "🎲 Three Card Poker - Timeout",
          description:
            `Game cancelled - no response received within 120 seconds.\n You lost half of your bet.` +
            `\n**Current Balance:** ${updatedUser.casinoTurn}`,
          color: 0xff0000,
          timestamp: new Date(),
          footer: {
            text: "🎲 Casino Royale",
            icon_url: interaction.client.user.displayAvatarURL(),
          },
        },
      ],
      components: [],
      ephemeral: true,
    });
  }
}

module.exports = {
  command: threeCardPokerCommand,
  handler: handleThreeCardPoker,
};
