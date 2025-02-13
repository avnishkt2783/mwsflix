const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favorites: [{ type: String }],  // Stores movie IDs
  watchlist: [{ type: String }],  // Stores movie IDs
  viewed: [{ type: String }],     // Stores movie IDs
});

module.exports = mongoose.model("User", UserSchema);
