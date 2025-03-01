const { getInfoByUserName, updateCasinoTurn } = require("../../controllers/users.controller");
const { beforeStart, insufficientBalance , rouletteHelp } = require("../../utils/embeds");
const rouletteWheel = {
  0: "green",
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

const rouletteCommand = {
  name: "roulette",
  description: "Play a game of roulette",
  options: [
    {
      name: "play",
      description: "Play a game of roulette",
      type: 1, // Subcommand
      options: [
        {
          name: "bet",
          description: "Your bet (number 0-36 or color red/black)",
          type: 3, // STRING type
          required: true,
        },
        {
          name: "amount",
          description: "Amount to bet (100-100000)",
          type: 4, // INTEGER type
          required: true,
          min_value: 100,
          max_value: 100000,
        },
      ],
    },
    {
      name: "help",
      description: "Show detailed rules and information about Roulette",
      type: 1, // Subcommand
    },
  ],
};

async function showRouletteHelp(interaction) {
  const help = rouletteHelp;

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
          text: "Use /roulette play bet:[number/color] amount:[optional] to start playing!",
        },
      },
    ],
    ephemeral: true,
  });
}

async function handleRoulette(interaction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "help") {
    return await showRouletteHelp(interaction);
  }

  const betAmount = interaction.options.getInteger("amount") || 100;
  const userInfo = await getInfoByUserName(interaction.user.username);

  if (!userInfo) {
    return await interaction.reply(beforeStart);
  }
  if (userInfo.casinoTurn < betAmount) {
    return await interaction.reply(insufficientBalance(userInfo, betAmount));
  }

  const bet = interaction.options.getString("bet").toLowerCase().trim();
  let betColor = null;
  let betNumber = null;

  if (bet === "red" || bet === "black") {
    betColor = bet;
  } else {
    const num = parseInt(bet);
    if (!isNaN(num) && num >= 0 && num <= 36) {
      betNumber = num;
    } else {
      await interaction.reply({
        embeds: [
          {
            title: "❌ Invalid Bet",
            description:
              "Your bet format is incorrect. Please place a valid bet.",
            fields: [
              {
                name: "Valid Number Bets",
                value:
                  "Any number from 0 to 36\nExample: `/roulette play bet:23`",
                inline: true,
              },
              {
                name: "Valid Color Bets",
                value: "red or black\nExample: `/roulette play bet:red`",
                inline: true,
              },
            ],
            color: 0xff0000,
            footer: {
              text: "💡 Type /roulette help for detailed game rules",
            },
          },
        ],
        ephemeral: true,
      });
      return;
    }
  }

  const resultNumber = Math.floor(Math.random() * 37);
  const resultColor = rouletteWheel[resultNumber];

  let resultMessage = `The ball landed on **${resultNumber}** ( ${
    resultColor === "red" ? "🔴" : resultColor === "black" ? "⚫" : "🟢"
  } ${resultColor} )\n\n`;

  if (betNumber !== null) {
    const updatedUser = await updateCasinoTurn(
      betNumber === resultNumber ? betAmount * 35 : -betAmount,
      interaction.user.username
    );
    resultMessage +=
      betNumber === resultNumber
        ? `🎉 **Congratulations!** You won **${betAmount * 35}** Turns!\n` +
          `You bet on number **${betNumber}** and won!\n` +
          `**Your Current Balance:** ${updatedUser.casinoTurn}`
        : `😔 **Too bad!** You lost **${betAmount}** Turns.\n` +
          `You bet on number **${betNumber}** but lost.\n` +
          `**Your Current Balance:** ${updatedUser.casinoTurn}`;
  } else {
    const updatedUser = await updateCasinoTurn(
      betColor === resultColor ? betAmount : -betAmount,
      interaction.user.username
    );
    resultMessage +=
      betColor === resultColor
        ? `🎉 **Congratulations!** You won **${betAmount}** Turns!\n` +
          `You bet on ${
            betColor === "red" ? "🔴" : "⚫"
          } **${betColor}** and won!\n` + 
          `**Your Current Balance:** ${updatedUser.casinoTurn}`
        : `😔 **Too bad!** You lost **${betAmount}** Turns.\n` +
          `You bet on ${
            betColor === "red" ? "🔴" : "⚫"
          } **${betColor}** but lost.\n` +
          `**Your Current Balance:** ${updatedUser.casinoTurn}`;
  }

  await interaction.reply({
    embeds: [
      {
        author: {
          name: interaction.user.username,
          icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
        },
        title: "🎲 Roulette",
        description: resultMessage,
        color: resultColor === "red" ? 0x00ff00 : 0xff0000,
        timestamp: new Date(),
        footer: {
          text: "🎲 Casino Royale",
          icon_url: interaction.client.user.displayAvatarURL(),
        },
      },
    ],
  });
}

module.exports = {
  command: rouletteCommand,
  handler: handleRoulette,
};
