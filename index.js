const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
require('dotenv').config();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Define roulette wheel
const rouletteWheel = {
  0: "black",
  1: "red",
  2: "black",
  3: "red",
  4: "black",
  5: "red",
  6: "black",
  7: "red",
  8: "black",
  9: "red",
  10: "black",
  11: "black",
  12: "red",
  13: "black",
  14: "red",
  15: "black",
  16: "red",
  17: "black",
  18: "red",
  19: "black",
  20: "red",
  21: "black",
  22: "red",
  23: "black",
  24: "red",
  25: "black",
  26: "red",
  27: "black",
  28: "red",
  29: "black",
  30: "red",
  31: "black",
  32: "red",
  33: "black",
  34: "red",
  35: "black",
  36: "red",
};

// Define commands
const commands = [
  {
    name: 'roulette',
    description: 'Play a game of roulette. Bet on a number (0-36) or color (red/black)',
    options: [
      {
        name: 'bet',
        description: 'Your bet (number 0-36 or color red/black)',
        type: 3, // STRING type
        required: true,
      }
    ]
  },
  {
    name: 'ping',
    description: 'Check bot latency'
  },
  {
    name: 'help',
    description: 'Show available commands'
  },
  {
    name: 'blackjack',
    description: 'Play a game of Blackjack against the dealer'
  }
];

// Deploy commands
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log('Started refreshing global commands...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('Successfully reloaded global commands.');
  } catch (error) {
    console.error(error);
  }
})();

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({
    activities: [{ name: '/help', type: 0 }],
    status: 'online',
  });
});

// Handle slash commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  switch (interaction.commandName) {
    case 'roulette':
      await handleRoulette(interaction);
      break;
    
    case 'ping':
      await interaction.reply({
        content: `🏓 Pong!\nLatency: ${client.ws.ping}ms`,
        ephemeral: true
      });
      break;
    
    case 'help':
      const helpEmbed = {
        color: 0x0099FF,
        title: '🎮 Bot Commands',
        fields: [
          {
            name: '/roulette [bet]',
            value: 'Play roulette! Bet on a number (0-36) or color (red/black)'
          },
          {
            name: '/ping',
            value: 'Check bot latency'
          },
          {
            name: '/help',
            value: 'Show this help message'
          }
        ],
        footer: {
          text: 'Have fun playing!'
        }
      };
      
      await interaction.reply({
        embeds: [helpEmbed],
        ephemeral: true
      });
      break;
    case 'blackjack':
      await handleBlackjack(interaction);
      break;
  }
});

async function handleRoulette(interaction) {
  await interaction.reply('🎲 Welcome to Roulette! Processing your bet...');
  
  const bet = interaction.options.getString('bet').toLowerCase().trim();
  let betColor = null;
  let betNumber = null;

  if (bet === "red" || bet === "black") {
    betColor = bet;
  } else {
    const num = parseInt(bet);
    if (!isNaN(num) && num >= 0 && num <= 36) {
      betNumber = num;
    } else {
      await interaction.editReply(
        "❌ Invalid bet! Please bet on a number (0-36) or a color (red/black)."
      );
      return;
    }
  }

  const resultNumber = Math.floor(Math.random() * 37);
  const resultColor = rouletteWheel[resultNumber];

  let resultMessage = `🎲 The ball landed on ${resultNumber} (${resultColor})!\n\n`;

  if (betNumber !== null) {
    resultMessage += betNumber === resultNumber
      ? `🎉 Congratulations! You win! The number ${resultNumber} was selected.`
      : `😔 Sorry, you lose! The number was ${resultNumber}.`;
  } else {
    resultMessage += betColor === resultColor
      ? `🎉 Congratulations! You win! The ball landed on a ${resultColor} number.`
      : `😔 Sorry, you lose! The ball landed on a ${resultColor} number.`;
  }

  await interaction.editReply(resultMessage);
}


// Add these Blackjack helper functions
const cardValues = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11
};

function createDeck() {
  const deck = [];
  for (const card of Object.keys(cardValues)) {
    deck.push(card, card); // Two of each card
  }
  // Shuffle deck
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

// Add this new function to handle Blackjack games
async function handleBlackjack(interaction) {
  const deck = createDeck();
  const playerHand = [deck.pop(), deck.pop()];
  const dealerHand = [deck.pop(), deck.pop()];
  
  await interaction.reply({
    content: `🎲 Welcome to Blackjack!\nYour hand: ${playerHand.join(', ')} (Total: ${calculateHand(playerHand)})\nDealer's face-up card: ${dealerHand[0]}`,
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: 'hit',
            label: 'Hit',
            style: 1,
          },
          {
            type: 2,
            custom_id: 'stand',
            label: 'Stand',
            style: 1,
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

  // Create collector for button interactions
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
          content: `Your hand: ${gameState.playerHand.join(', ')} (Total: ${playerTotal})\nBust! You lose! 😔`,
          components: []
        });
        return;
      }

      await i.update({
        content: `Your hand: ${gameState.playerHand.join(', ')} (Total: ${playerTotal})\nDealer's face-up card: ${gameState.dealerHand[0]}`
      });
    }

    if (i.customId === 'stand') {
      gameState.gameEnded = true;
      collector.stop();
      
      // Dealer's turn
      let dealerTotal = calculateHand(gameState.dealerHand);
      let message = `Dealer's hand: ${gameState.dealerHand.join(', ')} (Total: ${dealerTotal})\n`;

      while (dealerTotal < 17) {
        gameState.dealerHand.push(gameState.deck.pop());
        dealerTotal = calculateHand(gameState.dealerHand);
        message += `Dealer draws: ${gameState.dealerHand.join(', ')} (Total: ${dealerTotal})\n`;
      }

      const playerTotal = calculateHand(gameState.playerHand);

      if (dealerTotal > 21) {
        message += `Dealer busts! You win! 🎉`;
      } else if (playerTotal > dealerTotal) {
        message += `You win! 🎉`;
      } else if (playerTotal < dealerTotal) {
        message += `Dealer wins! 😔`;
      } else {
        message += `It's a tie! 🤝`;
      }

      await i.update({
        content: message,
        components: []
      });
    }
  });

  collector.on('end', async (collected, reason) => {
    if (reason === 'time' && !gameState.gameEnded) {
      await interaction.editReply({
        content: 'Game timed out! Please start a new game.',
        components: []
      });
    }
  });
}

client.login(process.env.BOT_TOKEN); // Replace with your bot token
