const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  poster: { type: String }, // Optional: Store image URL
});

module.exports = mongoose.model("Movie", MovieSchema);
