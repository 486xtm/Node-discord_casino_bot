const { REST, Routes } = require('discord.js');
const roulette = require('../commands/roulette');
const blackjack = require('../commands/blackjack');

const commands = [
  roulette.command,
  blackjack.command,
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
  blackjack: blackjack.handler
};

async function deployCommands(token, clientId) {
  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('Started refreshing global commands...');
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