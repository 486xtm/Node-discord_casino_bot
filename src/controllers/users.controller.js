const User = require("../models/users.model");
const getInfoByUserName = async (username) => {
  try {
    if (username) {
      const user = await User.findOne({ aimName: username });
      return user; // Returns the user object or null if not found
    }
    return null; // Return null if username is not provided
  } catch {
    console.error("500 error"); // Log the error for debugging
  }
};
const depositTurns = async (amount, username) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { aimName: username },
      {
        $inc: {
          casinoTurn: Number(amount),
          bankedTurn: -Number(amount),
        },
      },
      { new: true }
    );
    return updatedUser;
  } catch {
    console.log("500 error");
  }
};
const withDrawTurns = async (amount, username) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { aimName: username },
      {
        $inc: {
          casinoTurn: -Number(amount),
          bankedTurn: Number(amount),
        },
      },
      { new: true }
    );
    return updatedUser;
  } catch {
    console.log("500 error");
  }
};
const updateCasinoTurn = async (amount, username) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { aimName: username },
      { $inc: { casinoTurn: Number(amount) } },
      { new: true }
    );
    return updatedUser;
  } catch {
    console.log("500 error");
  }
};
module.exports = {
  getInfoByUserName,
  updateCasinoTurn,
  depositTurns,
  withDrawTurns,
};
