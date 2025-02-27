const {
  getInfoByUserName,
  updateCasinoGold,
} = require("../../controllers/users.controller");
const {
  beforeStart,
  insufficientBalance,
  flowerPokerHelp,
} = require("../../utils/embeds");

// Define the flowers and their probabilities
const flowers = [
  { name: "Yellow", emoji: "<:Yellow:1344407494419808286>", special: false },
  { name: "Orange", emoji: "<:Orange:1344407482868568084>", special: false },
  { name: "Red", emoji: "<:Red:1344407489940033547>", special: false },
  { name: "Blue", emoji: "<:Blue:1344407480259575838>", special: false },
  { name: "Purple", emoji: "<:Purple:1344407484919582720>", special: false },
  { name: "Assorted", emoji: "<:Assorted:1344407475025088574>", special: false },
  { name: "Rainbow", emoji: "<:Rainbow:1344407488057049158>", special: false },
  { name: "White", emoji: "<:White:1344407492217802773>", special: true, autoWin: true },
  { name: "Black", emoji: "<:Black:1344407478133063781>", special: true, autoLose: true },
];

// Function to get a random flower based on probabilities
function getRandomFlower() {
  const rand = Math.random() * 100;

  // White and Black: 5% each
  if (rand < 5) return flowers[7]; // White
  if (rand < 10) return flowers[8]; // Black

  // Rainbow: 10%
  if (rand < 20) return flowers[6]; // Rainbow

  // Other flowers: ~13.33% each (remaining 80% divided by 6)
  const regularIndex = Math.floor(Math.random() * 6);
  return flowers[regularIndex];
}

// Function to plant 5 flowers
function plantFlowers() {
  const hand = [];
  for (let i = 0; i < 5; i++) {
    const flower = getRandomFlower();
    hand.push(flower);
    if (flower.special === true) break;
  }
  return hand;
}

// Function to determine hand rank
function getHandRank(hand) {
  // Count occurrences of each flower
  const counts = {};
  let rainbowCount = 0;

  // First count all non-rainbow flowers
  hand.forEach((flower) => {
    if (flower.name === "Rainbow") {
      rainbowCount++;
    } else {
      counts[flower.name] = (counts[flower.name] || 0) + 1;
    }
  });

  // If there are no rainbows, use the original logic
  if (rainbowCount === 0) {
    const values = Object.values(counts);
    const uniqueFlowers = values.length;

    // Check for 5 of a Kind
    if (uniqueFlowers === 1) {
      return { rank: 6, name: "5 of a Kind" };
    }

    // Check for 4 of a Kind
    if (uniqueFlowers === 2 && values.includes(4)) {
      return { rank: 5, name: "4 of a Kind" };
    }

    // Check for Full House
    if (uniqueFlowers === 2 && values.includes(3) && values.includes(2)) {
      return { rank: 4, name: "Full House" };
    }

    // Check for 3 of a Kind
    if (values.includes(3) && uniqueFlowers === 3) {
      return { rank: 3, name: "3 of a Kind" };
    }

    // Check for 2 Pair
    if (values.filter((v) => v === 2).length === 2) {
      return { rank: 2, name: "2 Pair" };
    }

    // Check for 1 Pair
    if (values.includes(2) && uniqueFlowers === 4) {
      return { rank: 1, name: "1 Pair" };
    }

    // No Pair
    return { rank: 0, name: "No Pair - No matching flowers" };
  }

  // If we have rainbows, we need to determine the best possible hand

  // If all 5 are rainbows, it's a 5 of a kind
  if (rainbowCount === 5) {
    return { rank: 6, name: "5 of a Kind (Rainbow) - 	All five flowers are the same color" };
  }

  // Get the counts of each flower type
  const flowerCounts = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  // Case: We can make a 5 of a kind if we have at least one flower and enough rainbows
  if (flowerCounts.length > 0 && flowerCounts[0][1] + rainbowCount >= 5) {
    return { rank: 6, name: "5 of a Kind - 	All five flowers are the same color" };
  }

  // Case: We can make a 4 of a kind if we have enough of one flower + rainbows
  if (flowerCounts.length > 0 && flowerCounts[0][1] + rainbowCount >= 4) {
    return { rank: 5, name: "4 of a Kind - Four flowers of the same color" };
  }

  // Case: We can make a full house if we have enough flowers + rainbows
  // Need at least 2 different flower types
  if (flowerCounts.length >= 2) {
    // We need 3 of one type and 2 of another
    // First, try to make 3 of the most common flower
    let remainingRainbows = rainbowCount;
    let firstGroupSize = Math.min(3, flowerCounts[0][1] + remainingRainbows);
    remainingRainbows -= firstGroupSize - flowerCounts[0][1];

    // Then try to make 2 of the second most common flower
    let secondGroupSize = Math.min(2, flowerCounts[1][1] + remainingRainbows);

    if (firstGroupSize >= 3 && secondGroupSize >= 2) {
      return { rank: 4, name: "Full House - Three of one color + Two of another" };
    }
  }

  // Case: We can make a 3 of a kind if we have enough of one flower + rainbows
  if (flowerCounts.length > 0 && flowerCounts[0][1] + rainbowCount >= 3) {
    return { rank: 3, name: "3 of a Kind - Three flowers of the same color" };
  }

  // Case: We can make a 2 pair if we have enough different flowers + rainbows
  if (flowerCounts.length >= 2) {
    let remainingRainbows = rainbowCount;

    // Try to make first pair
    let firstPairNeeded = Math.max(0, 2 - flowerCounts[0][1]);
    if (firstPairNeeded <= remainingRainbows) {
      remainingRainbows -= firstPairNeeded;

      // Try to make second pair
      let secondPairNeeded = Math.max(0, 2 - flowerCounts[1][1]);
      if (secondPairNeeded <= remainingRainbows) {
        return { rank: 2, name: "2 Pair - Two sets of matching flowers" };
      }
    }
  }

  // Case: We can make a pair if we have at least one flower + rainbow
  if (flowerCounts.length > 0 && flowerCounts[0][1] + rainbowCount >= 2) {
    return { rank: 1, name: "1 Pair - Two flowers of the same color" };
  }

  // If we get here, we couldn't make anything better than no pair
  return { rank: 0, name: "No Pair - No matching flowers" };
}

const flowerPokerCommand = {
  name: "flowerpoker",
  description: "Play a game of Flower Poker",
  options: [
    {
      name: "play",
      description: "Play a game of Flower Poker",
      type: 1, // Subcommand
      options: [
        {
          name: "amount",
          description: "Amount to bet (100-500000000)",
          type: 4, // INTEGER type
          required: true,
          min_value: 100,
          max_value: 500000000,
        },
      ],
    },
    {
      name: "help",
      description: "Show detailed rules and information about Flower Poker",
      type: 1, // Subcommand
    },
  ],
};

async function showFlowerPokerHelp(interaction) {
  const help = flowerPokerHelp;

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
            name: "🌺 Flower Types",
            value: help.flowerTypes.join("\n"),
            inline: false,
          },
          {
            name: "🎮 Hand Rankings (Highest to Lowest)",
            value: help.handRankings.join("\n"),
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
          text: "Use /flowerpoker play amount:[bet amount] to start playing!",
        },
      },
    ],
    ephemeral: true,
  });
}
//Function to check if hand contains special flowers
function hasSpecialFlowers(hand) {
  return hand.some((flower) => flower.special);
}

// Function to format hand for display
function formatHand(hand) {
  return hand.map((flower) => `${flower.emoji}`).join("");
}

async function handleFlowerPoker(interaction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "help") {
    return await showFlowerPokerHelp(interaction);
  }

  const betAmount = interaction.options.getInteger("amount");
  const userInfo = await getInfoByUserName(interaction.user.username);

  if (!userInfo) {
    return await interaction.reply(beforeStart);
  }
  if (userInfo.gold < betAmount) {
    return await interaction.reply(insufficientBalance(userInfo, betAmount, "Golds"));
  }

  await interaction.deferReply();

  let playerHand, dealerHand;
  let replantCount = 0;
  let specialFlowerFound = true;

  while (specialFlowerFound && replantCount < 4) {
    playerHand = plantFlowers();
    dealerHand = plantFlowers();
    specialFlowerFound =
      hasSpecialFlowers(playerHand) || hasSpecialFlowers(dealerHand);
    if (specialFlowerFound) replantCount++;
  }

  // Player plants first
  let resultMessage = "";
  let isWin = false;
  let istie = false;
  
  if (replantCount == 4) {
    replantCount++;
    playerHand = plantFlowers();
    dealerHand = null;
    let playerRank, dealerRank;

    // Check if player got a special flower
    let playerAutoWin = playerHand.some((flower) => flower.name === "White");
    let playerAutoLose = playerHand.some((flower) => flower.name === "Black");

    // Determine winner based on player's hand first

    let gameEnded = false;

    if (playerAutoWin) {
      isWin = true;
      resultMessage = "You planted a White flower! 🎉 **Automatic Win!**\n\n";
      gameEnded = true;
    } else if (playerAutoLose) {
      isWin = false;
      resultMessage = "You planted a Black flower! 😔 **Automatic Loss!**\n\n";
      gameEnded = true;
    }

    // Only if player didn't get a special flower, dealer plants
    if (!gameEnded) {
      dealerHand = plantFlowers();

      // Check if dealer got a special flower
      let dealerAutoWin = dealerHand.some((flower) => flower.name === "White");
      let dealerAutoLose = dealerHand.some((flower) => flower.name === "Black");

      if (dealerAutoWin) {
        isWin = false;
        resultMessage =
          "Dealer planted a White flower! 😔 **Automatic Loss!**\n\n";
      } else if (dealerAutoLose) {
        isWin = true;
        resultMessage =
          "Dealer planted a Black flower! 🎉 **Automatic Win!**\n\n";
      } else {
        // Compare hand ranks
        playerRank = getHandRank(playerHand);
        dealerRank = getHandRank(dealerHand);

        if (playerRank.rank > dealerRank.rank) {
          isWin = true;
          resultMessage = `Your hand: **${playerRank.name}**\nDealer's hand: **${dealerRank.name}**\n\n`;
          resultMessage +=
            "🎉 **Congratulations!** Your hand beats the dealer's!\n";
        } else if (playerRank.rank < dealerRank.rank) {
          isWin = false;
          resultMessage = `Your hand: **${playerRank.name}**\nDealer's hand: **${dealerRank.name}**\n\n`;
          resultMessage += "😔 **Too bad!** The dealer's hand beats yours.\n";
        } else {
          // It's a tie
          isWin = false; // No win on tie (or you could set to true for push)
          istie = true;
          resultMessage = `Your hand: **${playerRank.name}**\nDealer's hand: **${dealerRank.name}**\n\n`;
          resultMessage +=
            "🤝 **It's a tie!** Both hands have the same rank.\n";
        }
      }
    }

    // Update user's balance - don't deduct on tie
    const winAmount =
      !gameEnded &&
      playerRank &&
      dealerRank &&
      playerRank.rank === dealerRank.rank
        ? 0 // Tie - no win/loss
        : isWin
        ? betAmount
        : -betAmount;

    const updatedUser = await updateCasinoGold(
      winAmount,
      interaction.user.username
    );

    // Add hand details
    resultMessage += `\n**Your Flowers:** ${formatHand(playerHand)}\n`;
    if (dealerHand) {
      resultMessage += `**Dealer's Flowers:** ${formatHand(dealerHand)}\n`;
    } else {
      resultMessage +=
        "**Dealer didn't plant** (game ended with your special flower)\n";
    }
    resultMessage += "\n";

    // Add balance information
    if (
      !gameEnded &&
      playerRank &&
      dealerRank &&
      playerRank.rank === dealerRank.rank
    ) {
      resultMessage += "It's a tie! Your bet is returned.\n";
    } else {
      resultMessage += isWin
        ? `You won **${betAmount}** Golds!\n`
        : `You lost **${betAmount}** Golds.\n`;
    }
    resultMessage += `**Your Current Balance:** ${updatedUser.gold} Golds`;
  } else {
    playerRank = getHandRank(playerHand);
    dealerRank = getHandRank(dealerHand);

    if (playerRank.rank > dealerRank.rank) {
      isWin = true;
      resultMessage = `Your hand: **${playerRank.name}**\nDealer's hand: **${dealerRank.name}**\n\n`;
      resultMessage +=
        "🎉 **Congratulations!** Your hand beats the dealer's!\n";
    } else if (playerRank.rank < dealerRank.rank) {
      isWin = false;
      resultMessage = `Your hand: **${playerRank.name}**\nDealer's hand: **${dealerRank.name}**\n\n`;
      resultMessage += "😔 **Too bad!** The dealer's hand beats yours.\n";
    } else {
      // It's a tie
      isWin = false; // No win on tie (or you could set to true for push)
      istie = true;
      resultMessage = `Your hand: **${playerRank.name}**\nDealer's hand: **${dealerRank.name}**\n\n`;
      resultMessage += "🤝 **It's a tie!** Both hands have the same rank.\n";
    }

    const winAmount =
      playerRank && dealerRank && playerRank.rank === dealerRank.rank
        ? 0 // Tie - no win/loss
        : isWin
        ? betAmount
        : -betAmount;

    const updatedUser = await updateCasinoGold(
      winAmount,
      interaction.user.username
    );

    // Add hand details
    resultMessage += `\n**Your Flowers:** ${formatHand(
      playerHand
    )}\n**Dealer's Flowers:** ${formatHand(dealerHand)}\n\n`;

    // Add balance information
    if (playerRank && dealerRank && playerRank.rank === dealerRank.rank) {
      resultMessage += "It's a tie! Your bet is returned.\n";
    } else {
      resultMessage += isWin
        ? `You won **${betAmount}** Golds!\n`
        : `You lost **${betAmount}** Golds.\n`;
    }
    resultMessage += `**Your Current Balance:** ${updatedUser.gold} Golds`;
  }

  if (replantCount > 0) {
    resultMessage = `Had to replant ${replantCount} times due to special flowers.\n\n` + resultMessage;
  }

  // Send the result
  await interaction.editReply({
    embeds: [
      {
        author: {
          name: interaction.user.username,
          icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
        },
        title: "🌸 Flower Poker",
        description: resultMessage,
        color: istie ? 0xffa500 : isWin ? 0x00ff00 : 0xff0000,
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
  command: flowerPokerCommand,
  handler: handleFlowerPoker,
};









