const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();
const { commandHandlers, deployCommands } = require("./utils/commands");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Deploy commands
deployCommands(process.env.BOT_TOKEN, process.env.CLIENT_ID);

const suits = { H: "H", D: "D", C: "C", S: "S" };
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

const cardImages = {};
for (const suit of Object.keys(suits)) {
  for (const rank of ranks) {
    const name = `${rank}_${suits[suit]}`.toLowerCase();
    const url = `https://deckofcardsapi.com/static/img/${
      rank == "10" ? "0" : rank
    }${suit}.png`;
    cardImages[name] = url;
  }
}

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({
    activities: [{ name: "/help", type: 0 }],
    status: "online",
  });
  // try {
  // const guild = await client.guilds.fetch(process.env.GUILD_ID);
  // const existingEmojis = await guild.emojis.fetch();
  // let data = {}
  // existingEmojis.forEach((val) => {
  //   data[val.name] = `<:${val.name}:${val.id}>`
  // })
  // console.log(data);
  //   const existingNames = new Set(existingEmojis.map((e) => e.name));

  //   for (const [name, url] of Object.entries(cardImages)) {
  //     const emojiName = name.replace(/_/g, ""); // Remove underscores for emoji names

  //     if (existingNames.has(emojiName)) {
  //       console.log(`⚠️ Skipping ${emojiName}, already uploaded.`);
  //       continue; // Skip this emoji if it already exists
  //     }

  //     try {
  //       console.log(`📤 Uploading: ${emojiName}...`);

  //       const response = await fetch(url);
  //       const buffer = await response.arrayBuffer();

  //       const emoji = await guild.emojis.create({
  //         attachment: Buffer.from(buffer),
  //         name: emojiName,
  //       });

  //       console.log(
  //         `✅ Uploaded: ${emoji.name} - <:${emoji.name}:${emoji.id}>`
  //       );
  //     } catch (error) {
  //       console.error(`❌ Failed to upload ${emojiName}:`, error);
  //     }
  //   }

  //   console.log("🎴 All card emojis processed successfully!");
  // } catch (error) {
  //   console.error("❌ Failed to fetch guild:", error);
  // }
  // client.destroy();
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
  } catch {
    console.log("unknown error")
  }
});

client.login(process.env.BOT_TOKEN);
