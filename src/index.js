const { Client, GatewayIntentBits } = require("discord.js");
const {BOT_TOKEN, CLIENT_ID, GUILD_ID} = require("./utils/config");
const { connect } = require("./utils/database");
const { commandHandlers, deployCommands } = require("./utils/commands");
const { getInfo } = require("./controllers/users.controller");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Deploy commands
deployCommands(BOT_TOKEN, CLIENT_ID);

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
        const helpEmbed = {
          color: 0x0099ff,
          title: "🎮 Casino Royale - Game Commands",
          description:
            "Welcome to Casino Royale! Here are all the available games and commands:",
          fields: [
            {
              name: "🎲 Roulette",
              value:
                "`/roulette play bet:[number/color] amount:[optional]`\n`/roulette help`\nBet on numbers (0-36) or colors (red/black). Win up to 35x your bet!",
              inline: false,
            },
            {
              name: "🃏 Blackjack",
              value:
                "`/blackjack play bet:[amount]`\n`/blackjack help`\nPlay against the dealer - get closer to 21 than them without going over!",
              inline: false,
            },
            {
              name: "🎴 Three Card Poker",
              value:
                "`/threecardpoker play bet:[amount]`\n`/threecardpoker help`\nPlay poker with three cards - compete against the dealer for the best hand!",
              inline: false,
            },
            {
              name: "🎯 Baccarat",
              value:
                "`/baccarat play bet:[player/banker/tie] amount:[optional]`\n`/baccarat help`\nBet on Player, Banker, or Tie in this elegant casino classic!",
              inline: false,
            },
            {
              name: "🛠️ Utility Commands",
              value:
                "`/ping` - Check bot latency\n`/help` - Show this help message",
              inline: false,
            },
          ],
          footer: {
            text: "💡 Tip: Use the help command for each game (e.g., /blackjack help) to see detailed rules and strategies!",
          },
          timestamp: new Date(),
        };

        await interaction.reply({
          embeds: [helpEmbed],
          ephemeral: true,
        });
        break;
    }
  } catch(err) {
    console.log("unknown error", err)
  }
});
connect();
client.login(BOT_TOKEN);
