const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const threeCardPokerCommand = {
  name: 'threecardpoker',
  description: 'Play a game of Three Card Poker against the dealer'
};

function createDeck() {
  const deck = [];
  for (const rank of ranks) {
    for (const suit of suits) {
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
  const values = hand.map(card => card.slice(0, -1));
  const suits = hand.map(card => card.slice(-1));

  // Check for flush
  const isFlush = new Set(suits).size === 1;

  // Check for straight
  const valueIndices = values.map(value => ranks.indexOf(value));
  valueIndices.sort((a, b) => a - b);
  const isSequential = valueIndices.every((val, i) => 
    i === 0 || val === valueIndices[i - 1] + 1
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
  values.forEach(value => {
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

async function handleThreeCardPoker(interaction) {
  await interaction.reply({
    embeds: [{
      title: '🎲 Three Card Poker',
      description: 'Dealing cards...',
      color: 0x00FF00
    }]
  });

  const deck = createDeck();
  const playerHand = [deck.pop(), deck.pop(), deck.pop()];
  const dealerHand = [deck.pop(), deck.pop(), deck.pop()];

  const playerHandStr = playerHand.join(' ');
  const dealerHandStr = `${dealerHand[0]} ?? ??`;

  const row = {
    type: 1,
    components: [
      {
        type: 2,
        custom_id: 'play',
        label: 'Play',
        style: 1
      },
      {
        type: 2,
        custom_id: 'fold',
        label: 'Fold',
        style: 4
      }
    ]
  };

  await interaction.editReply({
    embeds: [{
      title: '🎲 Three Card Poker',
      description: `Your hand: ${playerHandStr}\nDealer's hand: ${dealerHandStr}\n\nWould you like to play or fold?`,
      color: 0x00FF00
    }],
    components: [row]
  });

  try {
    const filter = i => i.user.id === interaction.user.id;
    const response = await interaction.channel.awaitMessageComponent({ filter, time: 30000 });

    if (response.customId === 'fold') {
      await interaction.editReply({
        embeds: [{
          title: '🎲 Three Card Poker - Game Over',
          description: 'You folded! Dealer wins by default.',
          color: 0xFF0000
        }],
        components: []
      });
      return;
    }

    const result = determineWinner(playerHand, dealerHand);
    await interaction.editReply({
      embeds: [{
        title: '🎲 Three Card Poker - Game Over',
        description: `Your hand: ${playerHandStr}\nDealer's hand: ${dealerHand.join(' ')}\n\n${result}`,
        color: result.includes('win') ? 0x00FF00 : 0xFF0000
      }],
      components: []
    });

  } catch (error) {
    await interaction.editReply({
      embeds: [{
        title: '🎲 Three Card Poker - Timeout',
        description: 'Game cancelled - no response received within 30 seconds.',
        color: 0xFF0000
      }],
      components: []
    });
  }
}

module.exports = {
  threeCardPokerCommand,
  handleThreeCardPoker
};