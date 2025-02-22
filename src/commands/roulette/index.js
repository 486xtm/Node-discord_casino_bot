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
  description: 'Play a game of roulette. Bet on a number (0-36) or color (red/black)',
  options: [
    {
      name: 'bet',
      description: 'Your bet (number 0-36 or color red/black)',
      type: 3,
      required: true,
    }
  ]
};

async function handleRoulette(interaction) {
  await interaction.reply('🎲 Welcome to Roulette!');
  
  const bet = interaction.options.getString('bet').toLowerCase().trim();
  let betColor = null;
  let betNumber = null;

  if (bet === "red" || bet === "black") {
    betColor = bet;
  } else {
    const num = parseInt(bet);
    if (!isNaN(num) && num >= 0 && num <= 36) {
      betNumber = num;
    } else {
      await interaction.editReply(
        "❌ Invalid bet! Please bet on a number (0-36) or a color (red/black)."
      );
      return;
    }
  }

  const resultNumber = Math.floor(Math.random() * 37);
  const resultColor = rouletteWheel[resultNumber];

  let resultMessage = `🎲 The ball landed on ${resultNumber} (${resultColor})!\n\n`;

  if (betNumber !== null) {
    resultMessage += betNumber === resultNumber
      ? `🎉 Congratulations! You win! The number ${resultNumber} was selected.`
      : `😔 Sorry, you lose! The number was ${resultNumber}.`;
  } else {
    resultMessage += betColor === resultColor
      ? `🎉 Congratulations! You win! The ball landed on a ${resultColor} number.`
      : `😔 Sorry, you lose! The ball landed on a ${resultColor} number.`;
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
  handler: handleRoulette
};
