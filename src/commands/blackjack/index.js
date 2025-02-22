const cardValues = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11
};

const blackjackCommand = {
  name: 'blackjack',
  description: 'Play a game of Blackjack against the dealer'
};

function createDeck() {
  const deck = [];
  for (const card of Object.keys(cardValues)) {
    deck.push(card, card);
  }
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
    value += cardValues[card];
    if (card === 'A') aceCount++;
  }
  
  while (value > 21 && aceCount) {
    value -= 10;
    aceCount--;
  }
  
  return value;
}

async function handleBlackjack(interaction) {
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
      description: `Your hand: ${playerHand.join(', ')} (Total: ${calculateHand(playerHand)})\nDealer's face-up card: ${dealerHand[0]}`,
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
            description: `**Your Hand:** ${gameState.playerHand.join(', ')} (Total: ${playerTotal})\n` +
                         `**Dealer's Hand:** ${gameState.dealerHand.join(', ')} (Total: ${calculateHand(gameState.dealerHand)})\n\n` +
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
          description: `Your hand: ${gameState.playerHand.join(', ')} (Total: ${playerTotal})\nDealer's face-up card: ${gameState.dealerHand[0]}`,
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
      let message = `**Your Hand:** ${gameState.playerHand.join(', ')} (Total: ${calculateHand(gameState.playerHand)})\n` +
                    `**Dealer's Initial Hand:** ${gameState.dealerHand.join(', ')} (Total: ${dealerTotal})\n\n`;

      while (dealerTotal < 17) {
        gameState.dealerHand.push(gameState.deck.pop());
        dealerTotal = calculateHand(gameState.dealerHand);
        message += `Dealer draws: ${gameState.dealerHand[gameState.dealerHand.length - 1]}\n` +
                   `**Dealer's New Hand:** ${gameState.dealerHand.join(', ')} (Total: ${dealerTotal})\n\n`;
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
                          `👤 Your Hand: ${gameState.playerHand.join(', ')} (Total: ${playerTotal})\n` +
                          `🎰 Dealer's Hand: ${gameState.dealerHand.join(', ')} (Total: ${dealerTotal})\n\n` +
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
