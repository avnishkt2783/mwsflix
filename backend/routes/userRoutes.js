const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");
const router = express.Router();

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

router.get("/favorites", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

router.get("/watchlist", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ watchlist: user.watchlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/viewed/:movieId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    const movieIdToRemove = req.params.movieId;
    user.viewed = user.viewed.filter((id) => id !== movieIdToRemove);

    await user.save();
    res.json({ message: "Movie removed from viewed history", viewed: user.viewed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;