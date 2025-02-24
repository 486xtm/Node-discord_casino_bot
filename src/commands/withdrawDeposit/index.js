const { getInfoByUserName, withDrawTurns, depositTurns } = require('../../controllers/users.controller');
const { beforeStart } = require('../../utils/embeds');

const withdrawDepositCommand = {
  name: 'balance',
  description: 'Manage your balance',
  options: [
    {
      name: 'withdraw',
      description: 'Withdraw turns from your balance',
      type: 1, // Subcommand
      options: [
        {
          name: 'amount',
          description: 'Amount of turns to withdraw',
          type: 4, // INTEGER type
          required: true,
          min_value: 1
        }
      ]
    },
    {
      name: 'deposit',
      description: 'Deposit turns to your balance',
      type: 1, // Subcommand
      options: [
        {
          name: 'amount',
          description: 'Amount of turns to deposit',
          type: 4, // INTEGER type
          required: true,
          min_value: 1
        }
      ]
    },
    {
      name: 'check',
      description: 'Check your current balance and turns',
      type: 1 // Subcommand
    }
  ]
};

async function handleWithdrawDeposit(interaction) {
  const subcommand = interaction.options.getSubcommand();
  
  try {
    const userInfo = await getInfoByUserName(interaction.user.username);
    
    if (!userInfo) {
      return await interaction.reply(beforeStart);
    }

    switch (subcommand) {
      case 'withdraw':
        return await handleWithdraw(interaction, userInfo);
      case 'deposit':
        return await handleDeposit(interaction, userInfo);
      case 'check':
        return await handleCheck(interaction, userInfo);
    }

  } catch (error) {
    console.error('Error in balance command:', error);
    return await interaction.reply({
      embeds: [{
        title: "❌ Error",
        description: "An error occurred while processing your request. Please try again later.",
        color: 0xFF0000
      }],
      ephemeral: true
    });
  }
}

async function handleWithdraw(interaction, userInfo) {
  const amount = interaction.options.getInteger('amount');
  
  if (amount > userInfo.casinoTurn) {
    return await interaction.reply({
      embeds: [{
        title: "❌ Insufficient Turns",
        description: "You don't have enough turns to withdraw this amount!",
        fields: [
          {
            name: "Your Current Casino Turns",
            value: `${userInfo.casinoTurn} turns`,
            inline: true
          },
          {
            name: "Requested Amount",
            value: `${amount} turns`,
            inline: true
          }
        ],
        color: 0xFF0000
      }],
      ephemeral: true
    });
  }

  // const newBalance = userInfo.casinoTurn - amount;
  const updatedUser = await withDrawTurns(amount, interaction.user.username);

  return await interaction.reply({
    embeds: [{
      author: {
        name: interaction.user.username,
        icon_url: interaction.user.displayAvatarURL({ dynamic: true })
      },
      title: "✅ Withdrawal Successful",
      description: `Successfully withdrew ${amount} turns from your balance.`,
      fields: [
        {
          name: "Previous Balance",
          value: `${userInfo.casinoTurn} turns`,
          inline: true
        },
        {
          name: "New Balance",
          value: `${updatedUser.casinoTurn} turns`,
          inline: true
        }
      ],
      color: 0x00FF00,
      footer: {
        text: "Thank you for playing!"
      }
    }],
    ephemeral: true
  });
}

async function handleDeposit(interaction, userInfo) {
  const amount = interaction.options.getInteger('amount');
  // const newBalance = userInfo.casinoTurn + amount;
  if(userInfo.bankedTurn < amount) {
    return await interaction.reply({
      embeds: [{
        title: "❌ Insufficient Turns",
        description: "You don't have enough turns to deposit this amount!",
        fields: [
          {
            name: "Your Current Banked Turns",
            value: `${userInfo.bankedTurn} turns`,
            inline: true
          },
          {
            name: "Requested Amount",
            value: `${amount} turns`,
            inline: true
          }
          ],
        color: 0xFF0000
      }],
      ephemeral: true
    });
  }

  const updatedUser = await depositTurns(amount , interaction.user.username);

  return await interaction.reply({
    embeds: [{
      author: {
        name: interaction.user.username,
        icon_url: interaction.user.displayAvatarURL({ dynamic: true })
      },
      title: "✅ Deposit Successful",
      description: `Successfully deposited ${amount} turns to your balance.`,
      fields: [
        {
          name: "Previous Balance",
          value: `${userInfo.casinoTurn} turns`,
          inline: true
        },
        {
          name: "New Balance",
          value: `${updatedUser.casinoTurn} turns`,
          inline: true
        }
      ],
      color: 0x00FF00,
      footer: {
        text: "Enjoy playing!"
      }
    }],
    ephemeral: true
  });
}

async function handleCheck(interaction, userInfo) {
  return await interaction.reply({
    embeds: [{
      author: {
        name: interaction.user.username,
        icon_url: interaction.user.displayAvatarURL({ dynamic: true })
      },
      title: "💰 Balance Check",
      description: "Here's your current balance information:",
      fields: [
        {
          name: "Banked Turns",
          value: `${userInfo.bankedTurn} turns`,
          inline: true
        },
        {
          name: "Casino Turns",
          value: `${userInfo.casinoTurn} turns`,
          inline: true
        }
      ],
      color: 0x0099FF,
      footer: {
        text: "Use /balance withdraw or /balance deposit to manage your turns"
      }
    }],
    ephemeral: true
  });
}

module.exports = {
  command: withdrawDepositCommand,
  handler: handleWithdrawDeposit
};