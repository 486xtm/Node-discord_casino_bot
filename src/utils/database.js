const {MONGODB_URL} = require("./config");
const mongoose = require("mongoose");

module.exports = {
  connect: async () => {
    try {
      await mongoose.connect(MONGODB_URL);
      console.log("Connected to MongoDB");
    } catch (err) {
      console.log(err);
    }
  },
};
