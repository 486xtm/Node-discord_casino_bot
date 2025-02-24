const { formatHand } = require("../../utils/utils");
const suits = ["D", "H", "S", "C"];
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

const threeCardPokerCommand = {
  name: "threecardpoker",
  description: "Play a game of Three Card Poker against the dealer",
  options: [
    {
      name: "play",
      description: "Start a new game of Three Card Poker",
      type: 1, // Subcommand
      options: [
        {
          name: "bet",
          description: "Amount to bet (default: 100)",
          type: 4, // INTEGER type
          required: false,
          min_value: 10,
          max_value: 1000,
        },
      ],
    },
    {
      name: "help",
      description: "Show detailed rules and information about Three Card Poker",
      type: 1, // Subcommand
    },
  ],
};

function createDeck() {
  const deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push(`${rank}${suit}`);
    }
  }
  // Shuffle deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function handRank(hand) {
  const values = hand.map((card) => card.slice(0, -1));
  const suits = hand.map((card) => card.slice(-1));

  // Check for flush
  const isFlush = new Set(suits).size === 1;

  // Check for straight
  const valueIndices = values.map((value) => ranks.indexOf(value));
  valueIndices.sort((a, b) => a - b);
  const isSequential = valueIndices.every(
    (val, i) => i === 0 || val === valueIndices[i - 1] + 1
  );

  // Check for Three of a Kind
  if (new Set(values).size === 1) {
    return [3, ranks.indexOf(values[0])]; // Three of a kind
  }

  // Check for Straight Flush
  if (isFlush && isSequential) {
    return [2, Math.max(...valueIndices)]; // Straight Flush
  }

  // Check for Flush
  if (isFlush) {
    return [4, Math.max(...valueIndices)]; // Flush
  }

  // Check for Straight
  if (isSequential) {
    return [5, Math.max(...valueIndices)]; // Straight
  }

  // Check for Pair
  const valueCounts = {};
  values.forEach((value) => {
    valueCounts[value] = (valueCounts[value] || 0) + 1;
  });

  for (const [value, count] of Object.entries(valueCounts)) {
    if (count === 2) {
      return [6, ranks.indexOf(value)]; // Pair
    }
  }

  // High Card
  return [7, Math.max(...valueIndices)];
}

function determineWinner(playerHand, dealerHand) {
  const playerRank = handRank(playerHand);
  const dealerRank = handRank(dealerHand);

  if (playerRank[0] < dealerRank[0]) {
    return "You win! 🎉";
  } else if (playerRank[0] > dealerRank[0]) {
    return "Dealer wins! 😔";
  } else {
    if (playerRank[1] > dealerRank[1]) {
      return "You win! 🎉";
    } else if (playerRank[1] < dealerRank[1]) {
      return "Dealer wins! 😔";
    } else {
      return "It's a tie! 🤝";
    }
  }
}

async function showThreeCardPokerHelp(interaction) {
  const help = getThreeCardPokerHelp();

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
            name: "🏆 Hand Rankings",
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
          text: "Use /threecardpoker [bet] to start playing!",
        },
      },
    ],
    ephemeral: true,
  });
}

async function handleThreeCardPoker(interaction) {
  const subcommand = interaction.options.getSubcommand(false);

  if (subcommand === "help") {
    return showThreeCardPokerHelp(interaction);
  }

  await interaction.reply({
    embeds: [
      {
        title: "🎲 Three Card Poker",
        description: "Dealing cards...",
        color: 0x00ff00,
      },
    ],
  });

  const deck = createDeck();
  const playerHand = [deck.pop(), deck.pop(), deck.pop()];
  const dealerHand = [deck.pop(), deck.pop(), deck.pop()];

  const playerHandStr = formatHand(playerHand);
  const dealerHandStr = formatHand([dealerHand[0], "BACK", "BACK"]); // `${dealerHand[0]} ?? ??`;

  const row = {
    type: 1,
    components: [
      {
        type: 2,
        custom_id: "play",
        label: "Play",
        emoji: "✅", // Green checkmark
        style: 2, // PRIMARY (Blue)
      },
      {
        type: 2,
        custom_id: "fold",
        label: "Fold",
        emoji: "❌", // Red X
        style: 2, // DANGER (Red)
      },
    ],
  };

  await interaction.editReply({
    embeds: [
      {
        title: "🎲 Three Card Poker",
        description: `Your hand: ${playerHandStr}\nDealer's hand: ${dealerHandStr}\n\nWould you like to play or fold?`,
        color: 0x00ff00,
      },
    ],
    components: [row],
  });

  try {
    const filter = (i) => i.user.id === interaction.user.id;
    const response = await interaction.channel.awaitMessageComponent({
      filter,
      time: 30000,
    });

    if (response.customId === "fold") {
      await interaction.editReply({
        embeds: [
          {
            title: "🎲 Three Card Poker - Game Over",
            description: "You folded! Dealer wins by default.",
            color: 0xff0000,
          },
        ],
        components: [],
      });
      return;
    }

    const result = determineWinner(playerHand, dealerHand);
    await interaction.editReply({
      embeds: [
        {
          title: "🎲 Three Card Poker - Game Over",
          description: `Your hand: ${playerHandStr}\nDealer's hand: ${formatHand(
            dealerHand
          )}\n\n${result}`,
          color: result.includes("win") ? 0x00ff00 : 0xff0000,
        },
      ],
      components: [],
    });
  } catch (error) {
    await interaction.editReply({
      embeds: [
        {
          title: "🎲 Three Card Poker - Timeout",
          description:
            "Game cancelled - no response received within 30 seconds.",
          color: 0xff0000,
        },
      ],
      components: [],
    });
  }
}

function getThreeCardPokerHelp() {
  return {
    name: "Three Card Poker",
    description:
      "A casino poker variant played against the dealer with three cards.",
    rules: [
      "1. Place your bet (10-1000 chips)",
      "2. You and the dealer each receive 3 cards",
      "3. After seeing your cards, choose to Play or Fold",
      "4. If you fold, you lose your bet",
      "5. If you play, your hand is compared with the dealer's",
    ],
    handRankings: [
      "🏆 Straight Flush - Three sequential cards of the same suit (e.g., 7♠ 8♠ 9♠)",
      "👑 Three of a Kind - Three cards of the same rank (e.g., K♠ K♥ K♦)",
      "🌟 Flush - Three cards of the same suit (e.g., 3♥ 7♥ J♥)",
      "📈 Straight - Three sequential cards (e.g., 5♣ 6♦ 7♠)",
      "👥 Pair - Two cards of the same rank (e.g., 9♣ 9♥ 4♦)",
      "👤 High Card - Highest single card in hand",
    ],
    payouts: [
      "Win: 1:1 (double your bet)",
      "Lose: Lose your bet",
      "Tie: Bet is returned",
    ],
    tips: [
      "💡 Consider playing with any pair or better",
      "💡 Fold weak hands to minimize losses",
      "💡 A high card of Queen or better is often playable",
    ],
  };
}

module.exports = {
  threeCardPokerCommand,
  handleThreeCardPoker,
  getThreeCardPokerHelp,
};
