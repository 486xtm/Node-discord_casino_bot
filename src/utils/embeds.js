const beforeStart = {
  embeds: [
    {
      title: "⚠️ Account Required",
      description:
        "To play Casino Royale, you need to have a War Grounds account linked to your Discord username.",
      fields: [
        {
          name: "How to Start Playing",
          value:
            "1️⃣ Visit [War Grounds](https://war-grounds.com)\n2️⃣ Create an account or sign in\n3️⃣ Add your Discord username in your profile\n4️⃣ Return here to play!",
        },
      ],
      color: 0xffa500, // Orange color
      footer: {
        text: "🎮 Join War Grounds to add your info!",
      },
    },
  ],
  ephemeral: true,
};
const insufficientBalance = (userInfo, betAmount, type = "Turns") => {
  return {
      embeds: [
        {
          title: `❌ Insufficient ${type}`,
          description: `You don't have enough ${type} to place this bet!`,
          fields: [
            {
              name: `Your Current ${type}`,
              value: `${type == "Turns" ? userInfo.casinoTurn : userInfo.gold} ${type} available`,
              inline: false,
            },
            {
              name: "Bet Amount",
              value: `${betAmount} ${type} required`,
              inline: false,
            },
          ],
          color: 0xff0000, // Red color for error
          footer: {
            text: `💡 Try placing a smaller bet or get more ${type}!`,
          },
        },
      ],
      ephemeral: true,
    };
}
const balanceCheck = (msg) => {
  return {
    embeds: [{
      description: msg,
      color: 0xfadc5d,
    }],
    ephemeral: true
  };
};
const helpEmbed = {
  embeds: [{
    color: 0x0099ff,
    title: "🎮 Casino Royale - Commands Guide",
    description: "Welcome to Casino Royale! Here are all the available games and commands:",
    fields: [
      {
        name: "💰 Balance Management",
        value: 
          "`/balance check` - View your current turns balance\n" +
          "`/balance withdraw amount:[value]` - Withdraw turns from casino\n" +
          "`/balance deposit amount:[value]` - Deposit turns to casino",
        inline: false,
      },
      {
        name: "🎲 Casino Games",
        value: 
          "`/blackjack play amount:[value]`\n" +
          "Classic card game - get closer to 21 than the dealer without going over!\n\n" +
          "`/roulette play bet:[number/color] amount:[value]`\n" +
          "Bet on numbers (0-36) or colors (red/black) and spin the wheel!\n\n" +
          "`/baccarat play bet:[player/banker/tie] amount:[value]`\n" +
          "Bet on Player, Banker, or Tie in this elegant casino classic!\n\n" +
          "`/hotcold play bet:[hot/cold] amount:[value]`\n" +
          "Bet on whether a flower will be hot or cold in this simple game of chance!\n\n" +
          "`/flowerpoker play amount:[value]`\n" +
          "Plant 5 flowers and try to get the best poker hand in this unique flower-based game!",
        inline: false,
      },
      {
        name: "ℹ️ Game Help Commands",
        value:
          "`/blackjack help`\n" +
          "`/roulette help`\n" +
          "`/baccarat help`\n" +
          "`/hotcold help`\n" +
          "`/flowerpoker help`\n" +
          "Get detailed rules and strategies for each game!",
        inline: false,
      },
      {
        name: "🛠️ Utility Commands",
        value:
          "`/ping` - Check bot latency\n" +
          "`/help` - Show this help message",
        inline: false,
      }
    ],
    footer: {
      text: "💡 Tip: Use the help command for each game (e.g., /blackjack help) to see detailed rules and strategies!",
    },
    timestamp: new Date(),
  }],
  ephemeral: true,
};
const baccaratHelp = {
  name: 'Baccarat',
  description: 'A classic casino card game where you bet on Player, Banker, or Tie.',
  rules: [
    '1. Place your bet on Player, Banker, or Tie',
    '2. Two cards are dealt to both Player and Banker',
    '3. Cards 2-9 are worth face value',
    '4. 10, J, Q, K are worth 0',
    '5. A is worth 1',
    '6. Only the last digit of the total is used (e.g., 15 becomes 5)'
  ],
  payouts: [
    'Player: 1:1',
    'Banker: 0.95:1 (5% commission)',
    'Tie: 8:1'
  ],
  tips: [
    '💡 Banker bet has the lowest house edge',
    '💡 Tie bet has the highest payout but also highest house edge',
    '💡 All face cards and tens count as zero'
  ]
};
const blackjackHelp = {
  name: "Blackjack",
  description:
    "A classic casino card game where you compete against the dealer to get closest to 21 without going over.",
  rules: [
    "1. Place your bet (100-100000 chips)",
    "2. You and the dealer each receive 2 cards",
    "3. Your cards are both face-up, dealer has one face-up and one face-down",
    "4. Cards 2-10 are worth face value",
    "5. J, Q, K are worth 10",
    "6. Ace is worth 11 or 1 (automatically adjusted to help you)",
    "7. You can Hit (take another card) or Stand (keep current hand)",
    "8. Dealer must hit on 16 and below, stand on 17 and above",
  ],
  payouts: [
    "Win: 1:1 (double your bet)",
    "Blackjack (21 with first two cards): 3:2",
    "Lose: Lose your bet",
    "Tie: Bet is returned",
  ],
  tips: [
    "💡 Always hit on 11 or below",
    "💡 Stand on 17 and above",
    "💡 Consider the dealer's face-up card when deciding",
    "💡 Remember: dealer must hit on 16 and below",
  ],
}
const rouletteHelp = {
  name: 'Roulette',
  description: 'A classic casino game where you bet on where the ball will land on the roulette wheel.',
  rules: [
    '1. Place your bet on either:',
    '   • A specific number (0-36)',
    '   • A color (red/black)',
    '2. The wheel is spun and a ball is dropped',
    '3. If the ball lands on your chosen number or color, you win!'
  ],
  payouts: [
    'Single Number: 35:1',
    'Color (Red/Black): 1:1'
  ],
  tips: [
    '💡 Betting on colors gives you nearly 50% chance to win',
    '💡 Single number bets have higher payouts but lower odds',
    '💡 The number 0 is neither red nor black',
    '💡 Red numbers: 1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36',
    '💡 Black numbers: 2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35'
  ]
};
const threeCardPokerHelp = {
  name: "Three Card Poker",
  description:
    "A casino poker variant played against the dealer with three cards.",
  rules: [
    "1. Place your bet (100-100000 chips)",
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
const hotColdHelp = {
  name: "Hot or Cold",
  description: "A simple game of chance where you bet on whether a flower will be hot or cold.",
  rules: [
    "1. Choose to bet on either 'hot' or 'cold'.",
    "2. A flower will be randomly selected.",
    "3. Hot flowers: Yellow, Orange, Red.",
    "4. Cold flowers: Blue, Purple, Assorted.",
    "5. If your prediction matches the flower's category, you win your bet amount.",
    "6. If your prediction is wrong, you lose your bet amount."
  ],
  payouts: [
    "• Correct prediction: 1:1 (double your bet)"
  ],
  tips: [
    "• Both hot and cold have an equal 50% chance of winning.",
    "• This game is purely luck-based with no strategy involved."
  ]
};
const flowerPokerHelp = {
  name: "Flower Poker",
  description: "A poker-style game played with colored flowers instead of cards.",
  rules: [
    "1. You plant 5 flowers and compete against the dealer.",
    "2. The goal is to get the best hand possible.",
    "3. If either you or the dealer plants a White or Black flower, the hand is replanted.",
    "4. White flower is an automatic win, Black flower is an automatic loss.",
    "5. White and Black flowers have a 5% chance each, Rainbow has a 10% chance, and other flowers have equal chances."
  ],
  handRankings: [
    "🏆 5 of a Kind - All 5 flowers are the same",
    "👑 4 of a Kind - 4 flowers are the same and one is different",
    "🌟 Full House - 3 flowers are the same and another 2 flowers are the same",
    "📈 3 of a Kind - 3 flowers are the same and other 2 flowers are different",
    "👥 2 Pair - 2 flowers are the same and another 2 flowers are the same",
    "👤 1 Pair - 2 flowers are the same and other 3 flowers are different",
    "🃏 No Pair - All 5 flowers are different"
  ],
  flowerTypes: [
    "🌻 Yellow",
    "🌸 Orange",
    "🌹 Red",
    "🌷 Blue",
    "🌺 Purple",
    "💐 Assorted",
    "🌈 Rainbow (any color)",
    "⚪ White (Auto Win)",
    "⚫ Black (Auto Loss)"
  ],
  payouts: [
    "Win: 1:1 (double your bet)",
    "Lose: Lose your bet"
  ],
  tips: [
    "💡 White flowers give you an automatic win!",
    "💡 Avoid black flowers as they result in an automatic loss.",
    "💡 The game continues until both you and the dealer have hands without special flowers."
  ]
};
module.exports = {
  helpEmbed,
  beforeStart,
  insufficientBalance,
  balanceCheck,
  baccaratHelp,
  blackjackHelp,
  rouletteHelp,
  threeCardPokerHelp,
  hotColdHelp,
  flowerPokerHelp,
};
