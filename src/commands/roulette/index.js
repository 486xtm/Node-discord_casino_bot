const rouletteWheel = {
  0: "black", 1: "red", 2: "black", 3: "red", 4: "black",
  5: "red", 6: "black", 7: "red", 8: "black", 9: "red",
  10: "black", 11: "black", 12: "red", 13: "black", 14: "red",
  15: "black", 16: "red", 17: "black", 18: "red", 19: "black",
  20: "red", 21: "black", 22: "red", 23: "black", 24: "red",
  25: "black", 26: "red", 27: "black", 28: "red", 29: "black",
  30: "red", 31: "black", 32: "red", 33: "black", 34: "red",
  35: "black", 36: "red"
};

const rouletteCommand = {
  name: 'roulette',
  description: 'Play a game of roulette',
  options: [
    {
      name: 'play',
      description: 'Play a game of roulette',
      type: 1, // Subcommand
      options: [
        {
          name: 'bet',
          description: 'Your bet (number 0-36 or color red/black)',
          type: 3, // STRING type
          required: true
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
      description: 'Show detailed rules and information about Roulette',
      type: 1 // Subcommand
    }
  ]
};

function getRouletteHelp() {
  return {
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
}

async function showRouletteHelp(interaction) {
  const help = getRouletteHelp();
  
  await interaction.reply({
    embeds: [{
      title: `🎲 ${help.name}`,
      description: help.description,
      color: 0xFF0000,
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
        text: 'Use /roulette play bet:[number/color] amount:[optional] to start playing!'
      }
    }],
    ephemeral: true
  });
}

async function handleRoulette(interaction) {
  const subcommand = interaction.options.getSubcommand();
  
  if (subcommand === 'help') {
    return await showRouletteHelp(interaction);
  }

  const bet = interaction.options.getString('bet').toLowerCase().trim();
  const betAmount = interaction.options.getInteger('amount') || 100;
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
        content: "❌ Invalid bet! Please bet on a number (0-36) or a color (red/black).",
        ephemeral: true
      });
      return;
    }
  }

  await interaction.reply('🎲 Welcome to Roulette!');

  const resultNumber = Math.floor(Math.random() * 37);
  const resultColor = rouletteWheel[resultNumber];

  let resultMessage = `🎲 The ball landed on ${resultNumber} (${resultColor})!\n\n`;

  if (betNumber !== null) {
    resultMessage += betNumber === resultNumber
      ? `🎉 Congratulations! You win ${betAmount * 35} chips! The number ${resultNumber} was selected.`
      : `😔 Sorry, you lose ${betAmount} chips! The number was ${resultNumber}.`;
  } else {
    resultMessage += betColor === resultColor
      ? `🎉 Congratulations! You win ${betAmount} chips! The ball landed on a ${resultColor} number.`
      : `😔 Sorry, you lose ${betAmount} chips! The ball landed on a ${resultColor} number.`;
  }

  await interaction.editReply({
    embeds: [{
      author: {
        name: interaction.user.username,
        icon_url: interaction.user.displayAvatarURL({ dynamic: true })
      },
      title: 'Roulette',
      description: resultMessage,
      color: resultColor === 'red' ? 0xFF0000 : 0x000000,
      timestamp: new Date(),
      footer: {
        text: '🎲 Casino Royale',
        icon_url: interaction.client.user.displayAvatarURL()
      }
    }]
  });
}

module.exports = {
  command: rouletteCommand,
  handler: handleRoulette,
  getRouletteHelp
};
