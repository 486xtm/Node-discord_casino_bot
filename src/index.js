const { Client, GatewayIntentBits, DiscordAPIError } = require("discord.js");
const {BOT_TOKEN, CLIENT_ID, GUILD_ID} = require("./utils/config");
const { connect } = require("./utils/database");
const { commandHandlers, deployCommands } = require("./utils/commands");
const { helpEmbed } = require("./utils/embeds");

// Add global unhandled rejection handler to prevent crashes
process.on('unhandledRejection', (error) => {
  if (error instanceof DiscordAPIError && error.code === 40060) {
    console.log('Interaction already acknowledged error. Ignoring.');
  } else {
    console.error('Unhandled promise rejection:', error);
  }
  // Don't exit the process, just log the error
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Deploy commands


client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({
    activities: [{ name: "/help", type: 0 }],
    status: "online",
  }); 
  // const guild = await client.guilds.fetch(GUILD_ID);
  // const existingEmojis = await guild.emojis.fetch();
  // let data = {}
  // existingEmojis.forEach((val) => {
  //   data[val.name] = `<:${val.name}:${val.id}>`
  // })
  // console.log(data);
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandHandlers[commandName]) {
      await commandHandlers[commandName](interaction);
      return;
    }

    switch (commandName) {
      case "ping":
        await interaction.reply({
          content: `🏓 Pong!\nLatency: ${client.ws.ping}ms`,
          ephemeral: true,
        });
        break;

      case "help":
        await interaction.reply(helpEmbed);
        break;
    }
  } catch(err) {
    console.log("unknown error", err)
  }
});
connect();
deployCommands(BOT_TOKEN, CLIENT_ID);
client.login(BOT_TOKEN);
