const { formatHand } = require("../../utils/utils");
const { beforeStart, blackjackHelp } = require("../../utils/embeds");
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
  10: 10,
  J: 10,
  Q: 10,
  K: 10,
  A: 11,
};

const blackjackCommand = {
  name: "blackjack",
  description: "Play a game of Blackjack against the dealer",
  options: [
    {
      name: "play",
      description: "Play a game of Blackjack",
      type: 1, // Subcommand
      options: [
        {
          name: "bet",
          description: "Amount to bet (100 - 10000) (default: 100)",
          type: 4, // INTEGER type
          required: true,
          min_value: 100,
          max_value: 10000,
        },
      ],
    },
    {
      name: "help",
      description: "Show detailed rules and information about Blackjack",
      type: 1, // Subcommand
    },
  ],
};

async function showBlackjackHelp(interaction) {
  const help = blackjackHelp;

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
          text: "Use /blackjack play [bet] to start playing!",
        },
      },
    ],
    ephemeral: true,
  });
}

function createDeck() {
  const deck = [];
  // Create full 52-card deck
  for (const suit of suits) {
    for (const card of Object.keys(cardValues)) {
      deck.push(`${card}${suit}`); // Example: '2H', 'AD', '10S'
    }
  }
  // Shuffle remains the same
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function calculateHand(hand) {
  let value = 0;
  let aceCount = 0;

  for (const card of hand) {
    // Extract card value without suit
    const cardValue = card.replace(/[^0-9JQKA]/g, "");
    value += cardValues[cardValue];
    if (cardValue === "A") aceCount++;
  }

  while (value > 21 && aceCount) {
    value -= 10;
    aceCount--;
  }

  return value;
}

async function handleBlackjack(interaction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "help") {
    return await showBlackjackHelp(interaction);
  }

  const betAmount = interaction.options.getInteger("bet") || 0;

  try {
    const userInfo = await getInfoByUserName(interaction.user.username);
    if (!userInfo) {
      return await interaction.reply(beforeStart);
    }

    if (userInfo.casinoTurn < betAmount) {
      return await interaction.reply({
        embeds: [{
          title: "❌ Insufficient Turns",
          description: "You don't have enough turns to place this bet!",
          fields: [
            {
              name: "Your Current Turns",
              value: `${userInfo.casinoTurn} turns available`,
              inline: false
            },
            {
              name: "Bet Amount",
              value: `${betAmount} turns required`,
              inline: false
            }
          ],
          color: 0xFF0000, // Red color for error
          footer: {
            text: "💡 Try placing a smaller bet or get more turns!"
          }
        }],
        ephemeral: true
      });
    }

    const deck = createDeck();
    const playerHand = [deck.pop(), deck.pop()];
    const dealerHand = [deck.pop(), deck.pop()];

    await interaction.reply({
      embeds: [
        {
          author: {
            name: interaction.user.username,
            icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
          },
          title: "🎲 Blackjack",
          description: `Your hand: ${formatHand(
            playerHand
          )} (Total: ${calculateHand(playerHand)})\nDealer's hand: ${formatHand(
            dealerHand,
            true
          )}`,
          color: 0x00ff00,
          timestamp: new Date(),
          footer: {
            text: "🎲 Casino Royale",
            icon_url: interaction.client.user.displayAvatarURL(),
          },
        },
      ],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              custom_id: "hit",
              label: "Hit",
              emoji: "🎯",
              style: 3, // SUCCESS (Green)
            },
            {
              type: 2,
              custom_id: "stand",
              label: "Stand",
              emoji: "🛑",
              style: 1, // PRIMARY (Blue)
            },
          ],
        },
      ],
    });

    const filter = (i) => {
      return (
        i.user.id === interaction.user.id &&
        ["hit", "stand"].includes(i.customId)
      );
    };

    const gameState = {
      deck,
      playerHand,
      dealerHand,
      gameEnded: false,
    };

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 30000,
    });

    collector.on("collect", async (i) => {
      if (gameState.gameEnded) return;

      if (i.customId === "hit") {
        gameState.playerHand.push(gameState.deck.pop());
        const playerTotal = calculateHand(gameState.playerHand);

        if (playerTotal > 21) {
          gameState.gameEnded = true;
          collector.stop();
          const updatedUser = await updateCasinoTurn(-betAmount, interaction.user.username);
          await i.update({
            embeds: [
              {
                author: {
                  name: interaction.user.username,
                  icon_url: interaction.user.displayAvatarURL({
                    dynamic: true,
                  }),
                },
                title: "🎲 Blackjack - Bust!",
                description:
                  `**Your Hand:** ${formatHand(
                    gameState.playerHand
                  )} (Total: ${playerTotal})\n` +
                  `**Dealer's Hand:** ${formatHand(
                    gameState.dealerHand
                  )} (Total: ${calculateHand(gameState.dealerHand)})\n\n` +
                  `Bust! You lost ${betAmount} Turns 😔\n**Current Balance:** ${updatedUser.casinoTurn}`,
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
          return;
        }

        await i.update({
          embeds: [
            {
              author: {
                name: interaction.user.username,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
              },
              title: "🎲 Blackjack",
              description: `Your hand: ${formatHand(
                gameState.playerHand
              )} (Total: ${playerTotal})\nDealer's hand: ${formatHand(
                gameState.dealerHand,
                true
              )}`,
              color: 0x00ff00,
              timestamp: new Date(),
              footer: {
                text: "🎲 Casino Royale",
                icon_url: interaction.client.user.displayAvatarURL(),
              },
            },
          ],
        });
      }

      if (i.customId === "stand") {
        gameState.gameEnded = true;
        collector.stop();

        let dealerTotal = calculateHand(gameState.dealerHand);
        let message =
          `**Your Hand:** ${formatHand(
            gameState.playerHand
          )} (Total: ${calculateHand(gameState.playerHand)})\n` +
          `**Dealer's Initial Hand:** ${formatHand(
            gameState.dealerHand
          )} (Total: ${dealerTotal})\n\n`;

        while (dealerTotal < 17) {
          gameState.dealerHand.push(gameState.deck.pop());
          dealerTotal = calculateHand(gameState.dealerHand);
          message +=
            `Dealer draws: ${formatHand([
              gameState.dealerHand[gameState.dealerHand.length - 1],
            ])}\n` +
            `**Dealer's New Hand:** ${formatHand(
              gameState.dealerHand
            )} (Total: ${dealerTotal})\n\n`;
        }

        const playerTotal = calculateHand(gameState.playerHand);
        let resultMessage = "";
        let color = 0xffff00; // Yellow for tie

        if (dealerTotal > 21) {
          const updatedUser = await updateCasinoTurn(betAmount, interaction.user.username);
          resultMessage = `Dealer busts! You got ${betAmount} Turns! 🎉\n**Current Balance:** ${updatedUser.casinoTurn}`;
          color = 0x00ff00; // Green for win
        } else if (playerTotal > dealerTotal) {
          const updatedUser = await updateCasinoTurn(betAmount, interaction.user.username);
          resultMessage = `You win! You got ${betAmount} Turns! 🎉\n**Current Balance:** ${updatedUser.casinoTurn}`;
          color = 0x00ff00;
        } else if (playerTotal < dealerTotal) {
          const updatedUser = await updateCasinoTurn(-betAmount, interaction.user.username);
          resultMessage = `Dealer wins! You lost ${betAmount} Turns! 😔\n**Current Balance:** ${updatedUser.casinoTurn}`;
          color = 0xff0000; // Red for loss
        } else {
          resultMessage = `It's a tie! 🤝`;
        }

        // Final summary box
        const finalSummary =
          `📊 **Final Results:**\n` +
          `👤 Your Hand: ${formatHand(
            gameState.playerHand
          )} (Total: ${playerTotal})\n` +
          `🎰 Dealer's Hand: ${formatHand(
            gameState.dealerHand
          )} (Total: ${dealerTotal})\n\n` +
          `${resultMessage}`;

        await i.update({
          embeds: [
            {
              author: {
                name: interaction.user.username,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
              },
              title: "🎲 Blackjack - Game Over",
              description: finalSummary,
              color: color,
              timestamp: new Date(),
              footer: {
                text: "🎲 Casino Royale",
                icon_url: interaction.client.user.displayAvatarURL(),
              },
            },
          ],
          components: [],
        });
      }
    });

    collector.on("end", async (collected, reason) => {
      if (reason === "time" && !gameState.gameEnded) {
        const updatedUser = await updateCasinoTurn(-(Math.floor(betAmount / 2)), interaction.user.username);
        await interaction.editReply({
          embeds: [
            {
              author: {
                name: interaction.user.username,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
              },
              title: "🎲 Blackjack - Timeout",
              description: `Game timed out! Please start a new game.\n\nYou lost half of your bet.\n**Current Balance:** ${updatedUser.casinoTurn}`,
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
      }
    });
  } catch (error) {
    console.error("Error handling blackjack command:", error);
    await interaction.reply({
      content:
        "An error occurred while processing your request. Please try again later.",
      ephemeral: true,
    });
  }
}

module.exports = {
  command: blackjackCommand,
  handler: handleBlackjack,
};
