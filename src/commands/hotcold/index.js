const { getInfoByUserName, updateCasinoTurn } = require("../../controllers/users.controller");
const { beforeStart, insufficientBalance, hotColdHelp } = require("../../utils/embeds");

// Define the flowers and their categories
const flowers = [
  { name: "Yellow", category: "hot", emoji: "🌻" },
  { name: "Orange", category: "hot", emoji: "🌸" },
  { name: "Red", category: "hot", emoji: "🌹" },
  { name: "Blue", category: "cold", emoji: "🌷" },
  { name: "Purple", category: "cold", emoji: "🌺" },
  { name: "Assorted", category: "cold", emoji: "💐" }
];


const hotColdCommand = {
  name: "hotcold",
  description: "Play a game of Hot or Cold",
  options: [
    {
      name: "play",
      description: "Play a game of Hot or Cold",
      type: 1, // Subcommand
      options: [
        {
          name: "bet",
          description: "Your bet (hot or cold)",
          type: 3, // STRING type
          required: true,
          choices: [
            { name: "Hot", value: "hot" },
            { name: "Cold", value: "cold" }
          ]
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
      description: "Show detailed rules and information about Hot or Cold",
      type: 1, // Subcommand
    },
  ],
};

async function showHotColdHelp(interaction) {
  const help = hotColdHelp;

  await interaction.reply({
    embeds: [
      {
        title: `🌸 ${help.name}`,
        description: help.description,
        color: 0xf5a623,
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
          text: "Use /hotcold play bet:[hot/cold] amount:[bet amount] to start playing!",
        },
      },
    ],
    ephemeral: true,
  });
}

async function handleHotCold(interaction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "help") {
    return await showHotColdHelp(interaction);
  }

  const betAmount = interaction.options.getInteger("amount");
  const userInfo = await getInfoByUserName(interaction.user.username);

  if (!userInfo) {
    return await interaction.reply(beforeStart);
  }
  if (userInfo.casinoTurn < betAmount) {
    return await interaction.reply(insufficientBalance(userInfo, betAmount));
  }

  const userBet = interaction.options.getString("bet").toLowerCase();
  
  // Randomly select a flower
  const selectedFlower = flowers[Math.floor(Math.random() * flowers.length)];
  const isWin = userBet === selectedFlower.category;
  
  // Update user's balance
  const updatedUser = await updateCasinoTurn(
    isWin ? betAmount : -betAmount,
    interaction.user.username
  );

  // Prepare result message
  const resultMessage = `The flower is **${selectedFlower.name}** ${selectedFlower.emoji} (${selectedFlower.category.toUpperCase()})\n\n` +
    (isWin 
      ? `🎉 **Congratulations!** You won **${betAmount}** Turns!\n` +
        `You bet on **${userBet.toUpperCase()}** and won!\n`
      : `😔 **Too bad!** You lost **${betAmount}** Turns.\n` +
        `You bet on **${userBet.toUpperCase()}** but the flower was **${selectedFlower.category.toUpperCase()}**.\n`) +
    `**Your Current Balance:** ${updatedUser.casinoTurn}`;

  // Send the result
  await interaction.reply({
    embeds: [
      {
        author: {
          name: interaction.user.username,
          icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
        },
        title: "🌸 Hot or Cold",
        description: resultMessage,
        color: isWin ? 0x00ff00 : 0xff0000,
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
  command: hotColdCommand,
  handler: handleHotCold,
};