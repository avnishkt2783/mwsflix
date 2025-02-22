const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ 
      token, 
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/favorite", auth, async (req, res) => {
  try {
    const { movieId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.favorites.indexOf(movieId);
    if (index === -1) {
      user.favorites.push(movieId);
    } else {
      user.favorites.splice(index, 1);  
    }
    
    await user.save();
    res.json({ favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/watchlist", auth, async (req, res) => {
  try {
    const { movieId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.watchlist.indexOf(movieId);
    if (index === -1) {
      user.watchlist.push(movieId); 
    } else {
      user.watchlist.splice(index, 1);  
    }
    
    await user.save();
    res.json({ watchlist: user.watchlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/viewed", auth, async (req, res) => {
  try {
    const { movieId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.viewed.includes(movieId)) {
      user.viewed.push(movieId);  
      await user.save();
    }

    res.json({ viewed: user.viewed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/viewed/:movieId", auth, async (req, res) => {
  try {
    const { movieId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.viewed = user.viewed.filter(id => id !== movieId);
    await user.save();

    res.json({ message: "Movie removed from viewed history", viewed: user.viewed });
  } catch (err) {
    console.error("Error in DELETE /viewed route:", err);
    res.status(500).json({ error: err.message });
  }
});


router.get("/user", auth, async (req, res) => {
  try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
  } catch (error) {
      res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;