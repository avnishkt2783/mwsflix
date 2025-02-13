const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// ✅ Add to Favorites
router.post("/favorites", auth, async (req, res) => {
  const { movieId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user.favorites.includes(movieId)) {
      user.favorites.push(movieId);
      await user.save();
    }
    res.json({ message: "Movie added to favorites", favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Remove from Favorites
router.delete("/favorites/:movieId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.favorites = user.favorites.filter((id) => id !== req.params.movieId);
    await user.save();
    res.json({ message: "Movie removed from favorites", favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Favorites List
router.get("/favorites", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add to Watchlist
router.post("/watchlist", auth, async (req, res) => {
  const { movieId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user.watchlist.includes(movieId)) {
      user.watchlist.push(movieId);
      await user.save();
    }
    res.json({ message: "Movie added to watchlist", watchlist: user.watchlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Remove from Watchlist
router.delete("/watchlist/:movieId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.watchlist = user.watchlist.filter((id) => id !== req.params.movieId);
    await user.save();
    res.json({ message: "Movie removed from watchlist", watchlist: user.watchlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Watchlist
router.get("/watchlist", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ watchlist: user.watchlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
