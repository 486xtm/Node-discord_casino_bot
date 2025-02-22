const { Client, GatewayIntentBits } = require("discord.js");
require('dotenv').config();
const { commandHandlers, deployCommands } = require('./utils/commands');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Deploy commands
deployCommands(process.env.BOT_TOKEN, process.env.CLIENT_ID);

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({
    activities: [{ name: '/help', type: 0 }],
    status: 'online',
  });
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandHandlers[commandName]) {
    await commandHandlers[commandName](interaction);
    return;
  }

  switch (commandName) {
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
            name: '/blackjack',
            value: 'Play a game of Blackjack against the dealer'
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

client.login(process.env.BOT_TOKEN);