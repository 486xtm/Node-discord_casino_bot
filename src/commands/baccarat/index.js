const { formatHand } = require('../../utils/utils');
const suits = ['H', 'D', 'C', 'S']; // Hearts, Diamonds, Clubs, Spades
const cardValues = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  '10': 0, 'J': 0, 'Q': 0, 'K': 0, 'A': 1
};

const baccaratCommand = {
  name: 'baccarat',
  description: 'Play a game of Baccarat against the banker',
  options: [
    {
      name: 'play',
      description: 'Play a game of Baccarat',
      type: 1, // Subcommand
      options: [
        {
          name: 'bet',
          description: 'Place your bet (Player, Banker, or Tie)',
          type: 3, // STRING type
          required: true,
          choices: [
            { name: 'Player', value: 'player' },
            { name: 'Banker', value: 'banker' },
            { name: 'Tie', value: 'tie' }
          ]
        },
        {
          name: 'amount',
          description: 'Amount to bet (default: 100)',
          type: 4, // INTEGER type
          required: false,
          min_value: 10,
          max_value: 1000
        }
      ]
    },
    {
      name: 'help',
      description: 'Show detailed rules and information about Baccarat',
      type: 1 // Subcommand
    }
  ]
};

function createDeck() {
  const deck = [];
  // Use 6 decks of cards
  for (let i = 0; i < 6; i++) {
    for (const card of Object.keys(cardValues)) {
      deck.push(card);
    }
  }
  // Shuffle deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function calculateHand(hand) {
  const total = hand.reduce((sum, card) => sum + cardValues[card], 0) % 10;
  return total;
}

async function handleBaccarat(interaction) {
  const subcommand = interaction.options.getSubcommand();
  
  if (subcommand === 'help') {
    return await showBaccaratHelp(interaction);
  }

  const betType = interaction.options.getString('bet');
  const betAmount = interaction.options.getInteger('amount') || 100;

  await interaction.reply({
    embeds: [{
      title: '🎲 Baccarat',
      description: 'Dealing cards...',
      color: 0x00FF00
    }]
  });

  const deck = createDeck();
  const playerHand = [deck.pop(), deck.pop()];
  const bankerHand = [deck.pop(), deck.pop()];

  const playerTotal = calculateHand(playerHand);
  const bankerTotal = calculateHand(bankerHand);

  let result;
  let color;
  let winnings = 0;

  if (playerTotal > bankerTotal) {
    result = 'Player wins! 🎉';
    winnings = betType === 'player' ? betAmount : -betAmount;
    color = 0x00FF00;
  } else if (bankerTotal > playerTotal) {
    result = 'Banker wins! 💰';
    winnings = betType === 'banker' ? Math.floor(betAmount * 0.95) : -betAmount;
    color = 0xFF0000;
  } else {
    result = "It's a tie! 🤝";
    winnings = betType === 'tie' ? betAmount * 8 : -betAmount;
    color = 0xFFFF00;
  }

  await interaction.editReply({
    embeds: [{
      title: '🎲 Baccarat - Game Result',
      description: `Your bet: ${betAmount} on ${betType}\n\n` +
                   `Player's hand: ${playerHand.join(', ')} (Total: ${playerTotal})\n` +
                   `Banker's hand: ${bankerHand.join(', ')} (Total: ${bankerTotal})\n\n` +
                   `${result}\n` +
                   `${winnings >= 0 ? 'You won: ' + winnings : 'You lost: ' + Math.abs(winnings)}`,
      color: color,
      footer: {
        text: '🎲 Casino Royale'
      }
    }]
  });
}

function getBaccaratHelp() {
  return {
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
}

async function showBaccaratHelp(interaction) {
  const help = getBaccaratHelp();
  
  await interaction.reply({
    embeds: [{
      title: `🎲 ${help.name}`,
      description: help.description,
      color: 0x00FF00,
      fields: [
        {
          name: '📋 Rules',
          value: help.rules.join('\n'),
          inline: false
        },
        {
          name: '💰 Payouts',
          value: help.payouts.join('\n'),
          inline: false
        },
        {
          name: '💡 Tips',
          value: help.tips.join('\n'),
          inline: false
        }
      ],
      footer: {
        text: 'Use /baccarat [bet] [amount] to start playing!'
      }
    }],
    ephemeral: true
  });
}

module.exports = {
  baccaratCommand,
  handleBaccarat,
  getBaccaratHelp
};
