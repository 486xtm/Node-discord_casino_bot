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

client.login(process.env.BOT_TOKEN); // Replace with your bot token
