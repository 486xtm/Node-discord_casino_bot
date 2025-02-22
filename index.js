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


client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase().startsWith(`${PREFIX}roulette`)) {
    await startGame(message);
  }
});

async function startGame(message) {
  await message.channel.send(
    "Welcome to Roulette! You can bet on a number (0-36), red, or black."
  );
  await message.channel.send(
    "Type your bet Color or Number(0-36). Example: `23` or `red` or  `black` "
  );

  const filter = (response) => response.author.id === message.author.id;
  const collected = await message.channel
    .awaitMessages({ filter, max: 1, time: 30000, errors: ["time"] })
    .catch(() => {
      message.channel.send("You did not respond in time!");
    });
    if (!collected) return;
    
    const bet = collected.first().content.toLowerCase().trim();
    let betColor = null;
    let betNumber = null;
    console.log("==========>", bet);
    
  if (bet === "red" || bet === "black") {
    betColor = bet;
  } else {
    const num = parseInt(bet);
    if (!isNaN(num) && num >= 0 && num <= 36) {
      betNumber = num;
    } else {
      await message.channel.send(
        "Invalid bet! Please bet on a number (0-36) or a color (red/black)."
      );
      return;
    }
  }

  // Spin the wheel
  const resultNumber = Math.floor(Math.random() * 37);
  const resultColor = rouletteWheel[resultNumber];

  await message.channel.send(
    `The ball landed on ${resultNumber} (${resultColor})!`
  );

  // Determine outcome
  if (betNumber !== null) {
    if (betNumber === resultNumber) {
      await message.channel.send(
        `Congratulations! You win! The number ${resultNumber} was selected.`
      );
    } else {
      await message.channel.send(
        `Sorry, you lose! The number was ${resultNumber}.`
      );
    }
  } else if (betColor !== null) {
    if (betColor === resultColor) {
      await message.channel.send(
        `Congratulations! You win! The ball landed on a ${resultColor} number.`
      );
    } else {
      await message.channel.send(
        `Sorry, you lose! The ball landed on a ${resultColor} number.`
      );
    }
  }
}

// Run the bot
client.login(
  process.env.BOT_TOKEN
); // Replace with your bot token
