const User = require("../models/users.model");
const getInfoByUserName = async (username) => {
  try {
    if (username) {
      const user = await User.findOne({ aimName: username });
      return user; // Returns the user object or null if not found
    }
    return null; // Return null if username is not provided
  } catch (err) {
    console.error("500 error:", err); // Log the error for debugging
  }
};
const addCasinoTurn = async (amount, username) => {
  try {
    const user = await User.findOne({ aimName: username });
    if (user.bankedTurn < amount) return user;
    const updatedUser = await User.findOneAndUpdate(
      { aimName: username },
      { 
        $inc: { casinoTurn: Number(amount), },
        $dec: { backTurn: Number(amount), },
      }
    );
    return updatedUser;
  } catch {
    console.log("500 error");
  }
};
const updateCasinoTurn = async (amount, username) => {
  try {
    let updatedUser;
    if (Number(amount) > 0)
      updatedUser = await User.findOneAndUpdate(
        { aimName: username },
        { $inc: { casinoTurn: Number(amount) } }
      );
    else
      updatedUser = await User.findOneAndUpdate(
        { aimName: username },
        { $dec: { casinoTurn: Number(amount) } }
      );
    return updatedUser;
  } catch {
    console.log("500 error");
  }
};
module.exports = {
  getInfoByUserName,
  updateCasinoTurn,
  addCasinoTurn
};
