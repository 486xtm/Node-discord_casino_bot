const { REST, Routes } = require('discord.js');
const roulette = require('../commands/roulette');
const blackjack = require('../commands/blackjack');
const threeCardPoker = require('../commands/threeCardPoker');
const baccarat = require('../commands/baccarat');
const balance = require('../commands/withdrawDeposit');
const hotCold = require("../commands/hotcold");
const flowerpoker = require("../commands/flowerPoker");


const commands = [
  roulette.command,
  blackjack.command,
  threeCardPoker.command,
  baccarat.command,
  balance.command,
  ////////////////////////
  hotCold.command,
  flowerpoker.command,
  {
    name: 'ping',
    description: 'Check bot latency'
  },
  {
    name: 'help',
    description: 'Show available commands'
  }
];

const commandHandlers = {
  roulette: roulette.handler,
  blackjack: blackjack.handler,
  threecardpoker: threeCardPoker.handler,
  baccarat: baccarat.handler,
  balance: balance.handler,
  //////////////////////
  hotcold: hotCold.handler,
  flowerpoker: flowerpoker.handler
};

async function deployCommands(token, clientId) {
  const rest = new REST({ version: '10' }).setToken(token);

  try {
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );
    console.log('Successfully reloaded global commands.');
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  commands,
  commandHandlers,
  deployCommands
};
