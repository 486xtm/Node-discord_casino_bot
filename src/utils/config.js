require("dotenv").config();

module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  CLIENT_ID: process.env.CLIENT_ID,
  GUILD_ID: process.env.GUILD_ID,
  MONGODB_URL: process.env.MONGODB_URL,
  BLACKJACK_CHANNEL_ID: process.env.BLACKJACK_CHANNEL_ID,
  ROULETTE_CHANNEL_ID: process.env.ROULETTE_CHANNEL_ID,
  THREECARDPOKER_CHANNEL_ID: process.env.THREECARDPOKER_CHANNEL_ID,
  BACCARAT_CHANNEL_ID: process.env.BACCARAT_CHANNEL_ID,
  HOTCOLD_CHANNEL_ID: process.env.HOTCOLD_CHANNEL_ID,
  FLOWERPOKER_CHANNEL_ID: process.env.FLOWERPOKER_CHANNEL_ID,
  SPECIAL_CHANNEL_ID: process.env.SPECIAL_CHANNEL_ID,
  // Add more configuration variables as needed
}
