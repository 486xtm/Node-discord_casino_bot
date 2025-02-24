const { formatHand } = require('../../utils/utils');
const suits = ['H', 'D', 'C', 'S']; // Hearts, Diamonds, Clubs, Spades
const cardValues = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11
};

const blackjackCommand = {
  name: 'blackjack',
  description: 'Play a game of Blackjack against the dealer',
  options: [
    {
      name: 'play',
      description: 'Play a game of Blackjack',
      type: 1, // Subcommand
      options: [
        {
          name: 'bet',
          description: 'Amount to bet (default: 100)',
          type: 4, // INTEGER type
          required: false,
          min_value: 10,
          max_value: 1000
        }
      ]
    },
    {
      name: 'help',
      description: 'Show detailed rules and information about Blackjack',
      type: 1 // Subcommand
    }
  ]
};

function getBlackjackHelp() {
  return {
    name: 'Blackjack',
    description: 'A classic casino card game where you compete against the dealer to get closest to 21 without going over.',
    rules: [
      '1. Place your bet (10-1000 chips)',
      '2. You and the dealer each receive 2 cards',
      '3. Your cards are both face-up, dealer has one face-up and one face-down',
      '4. Cards 2-10 are worth face value',
      '5. J, Q, K are worth 10',
      '6. Ace is worth 11 or 1 (automatically adjusted to help you)',
      '7. You can Hit (take another card) or Stand (keep current hand)',
      '8. Dealer must hit on 16 and below, stand on 17 and above'
    ],
    payouts: [
      'Win: 1:1 (double your bet)',
      'Blackjack (21 with first two cards): 3:2',
      'Lose: Lose your bet',
      'Tie: Bet is returned'
    ],
    tips: [
      '💡 Always hit on 11 or below',
      '💡 Stand on 17 and above',
      '💡 Consider the dealer\'s face-up card when deciding',
      '💡 Remember: dealer must hit on 16 and below'
    ]
  };
}

async function showBlackjackHelp(interaction) {
  const help = getBlackjackHelp();
  
  await interaction.reply({
    embeds: [{
      title: `🎲 ${help.name}`,
      description: help.description,
      color: 0x00FF00,
      fields: [
        {
          name: '📋 Rules',
          value: help.rules.join('\n'),
          inline: false
        },
        {
          name: '💰 Payouts',
          value: help.payouts.join('\n'),
          inline: false
        },
        {
          name: '💡 Tips',
          value: help.tips.join('\n'),
          inline: false
        }
      ],
      footer: {
        text: 'Use /blackjack play [bet] to start playing!'
      }
    }],
    ephemeral: true
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
    const cardValue = card.replace(/[^0-9JQKA]/g, '');
    value += cardValues[cardValue];
    if (cardValue === 'A') aceCount++;
  }
  
  while (value > 21 && aceCount) {
    value -= 10;
    aceCount--;
  }
  
  return value;
}

async function handleBlackjack(interaction) {
  const subcommand = interaction.options.getSubcommand();
  
  if (subcommand === 'help') {
    return await showBlackjackHelp(interaction);
  }

  const betAmount = interaction.options.getInteger('bet') || 100;
  const deck = createDeck();
  const playerHand = [deck.pop(), deck.pop()];
  const dealerHand = [deck.pop(), deck.pop()];
  
  await interaction.reply({
    embeds: [{
      author: {
        name: interaction.user.username,
        icon_url: interaction.user.displayAvatarURL({ dynamic: true })
      },
      title: '🎲 Blackjack',
      description: `Your hand: ${formatHand(playerHand)} (Total: ${calculateHand(playerHand)})\nDealer's hand: ${formatHand(dealerHand, true)}`,
      color: 0x00FF00,
      timestamp: new Date(),
      footer: {
        text: '🎲 Casino Royale',
        icon_url: interaction.client.user.displayAvatarURL()
      }
    }],
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: 'hit',
            label: 'Hit',
            emoji: '🎯',
            style: 3, // SUCCESS (Green)
          },
          {
            type: 2,
            custom_id: 'stand',
            label: 'Stand',
            emoji: '🛑',
            style: 1, // PRIMARY (Blue)
          }
        ]
      }
    ]
  });

  const filter = i => {
    return i.user.id === interaction.user.id && ['hit', 'stand'].includes(i.customId);
  };

  const gameState = {
    deck,
    playerHand,
    dealerHand,
    gameEnded: false
  };

  const collector = interaction.channel.createMessageComponentCollector({ 
    filter, 
    time: 30000 
  });

  collector.on('collect', async i => {
    if (gameState.gameEnded) return;

    if (i.customId === 'hit') {
      gameState.playerHand.push(gameState.deck.pop());
      const playerTotal = calculateHand(gameState.playerHand);

      if (playerTotal > 21) {
        gameState.gameEnded = true;
        collector.stop();
        await i.update({
          embeds: [{
            author: {
              name: interaction.user.username,
              icon_url: interaction.user.displayAvatarURL({ dynamic: true })
            },
            title: '🎲 Blackjack - Bust!',
            description: `**Your Hand:** ${formatHand(gameState.playerHand)} (Total: ${playerTotal})\n` +
                         `**Dealer's Hand:** ${formatHand(gameState.dealerHand)} (Total: ${calculateHand(gameState.dealerHand)})\n\n` +
                         `Bust! You lose! 😔`,
            color: 0xFF0000,
            timestamp: new Date(),
            footer: {
              text: '🎲 Casino Royale',
              icon_url: interaction.client.user.displayAvatarURL()
            }
          }],
          components: []
        });
        return;
      }

      await i.update({
        embeds: [{
          author: {
            name: interaction.user.username,
            icon_url: interaction.user.displayAvatarURL({ dynamic: true })
          },
          title: '🎲 Blackjack',
          description: `Your hand: ${formatHand(gameState.playerHand)} (Total: ${playerTotal})\nDealer's hand: ${formatHand(gameState.dealerHand, true)}`,
          color: 0x00FF00,
          timestamp: new Date(),
          footer: {
            text: '🎲 Casino Royale',
            icon_url: interaction.client.user.displayAvatarURL()
          }
        }]
      });
    }

    if (i.customId === 'stand') {
      gameState.gameEnded = true;
      collector.stop();
      
      let dealerTotal = calculateHand(gameState.dealerHand);
      let message = `**Your Hand:** ${formatHand(gameState.playerHand)} (Total: ${calculateHand(gameState.playerHand)})\n` +
                    `**Dealer's Initial Hand:** ${formatHand(gameState.dealerHand)} (Total: ${dealerTotal})\n\n`;

      while (dealerTotal < 17) {
        gameState.dealerHand.push(gameState.deck.pop());
        dealerTotal = calculateHand(gameState.dealerHand);
        message += `Dealer draws: ${formatHand([gameState.dealerHand[gameState.dealerHand.length - 1]])}\n` +
                   `**Dealer's New Hand:** ${formatHand(gameState.dealerHand)} (Total: ${dealerTotal})\n\n`;
      }

      const playerTotal = calculateHand(gameState.playerHand);
      let resultMessage = '';
      let color = 0xFFFF00; // Yellow for tie

      if (dealerTotal > 21) {
        resultMessage = `Dealer busts! You win! 🎉`;
        color = 0x00FF00; // Green for win
      } else if (playerTotal > dealerTotal) {
        resultMessage = `You win! 🎉`;
        color = 0x00FF00;
      } else if (playerTotal < dealerTotal) {
        resultMessage = `Dealer wins! 😔`;
        color = 0xFF0000; // Red for loss
      } else {
        resultMessage = `It's a tie! 🤝`;
      }

      // Final summary box
      const finalSummary = `📊 **Final Results:**\n` +
                          `👤 Your Hand: ${formatHand(gameState.playerHand)} (Total: ${playerTotal})\n` +
                          `🎰 Dealer's Hand: ${formatHand(gameState.dealerHand)} (Total: ${dealerTotal})\n\n` +
                          `${resultMessage}`;

      await i.update({
        embeds: [{
          author: {
            name: interaction.user.username,
            icon_url: interaction.user.displayAvatarURL({ dynamic: true })
          },
          title: '🎲 Blackjack - Game Over',
          description: finalSummary,
          color: color,
          timestamp: new Date(),
          footer: {
            text: '🎲 Casino Royale',
            icon_url: interaction.client.user.displayAvatarURL()
          }
        }],
        components: []
      });
    }
  });

  collector.on('end', async (collected, reason) => {
    if (reason === 'time' && !gameState.gameEnded) {
      await interaction.editReply({
        embeds: [{
          author: {
            name: interaction.user.username,
            icon_url: interaction.user.displayAvatarURL({ dynamic: true })
          },
          title: '🎲 Blackjack - Timeout',
          description: 'Game timed out! Please start a new game.',
          color: 0xFF0000,
          timestamp: new Date(),
          footer: {
            text: '🎲 Casino Royale',
            icon_url: interaction.client.user.displayAvatarURL()
          }
        }],
        components: []
      });
    }
  });
}

module.exports = {
  command: blackjackCommand,
  handler: handleBlackjack
};
