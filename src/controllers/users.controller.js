const User = require("../models/users.model");
const getUserByUsername = async (username) => {
  try {
    if (username) {
      const user = await User.findOne({ aimName: username });
      return user; // Returns the user object or null if not found
    }
    return null; // Return null if username is not provided
  } catch (err) {
    console.error("500 error:", err); // Log the error for debugging
    return null; // Return null in case of an error
  }
};
const updateCasinoTurn = async (amount, username) => {
  try {
    if (Number(amount) > 0)
      await User.findOneAndUpdate(
        { aimName: username },
        { $inc: { casinoTurn: Number(amount) } }
      );
    else
      await User.findOneAndUpdate(
        { aimName: username },
        { $dec: { casinoTurn: Number(amount) } }
      );
  } catch {
    console.log("500 error");
  }
}
module.exports = {
  getUserByUsername, updateCasinoTurn ,
};
