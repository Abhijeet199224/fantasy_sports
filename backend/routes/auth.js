// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const { verifyAuth } = require('../middleware/auth');
const User = require('../models/User');

// Get current user profile
router.get('/profile', verifyAuth, async (req, res) => {
  try {
    res.json({
      user: req.dbUser,
      stats: req.dbUser.stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', verifyAuth, async (req, res) => {
  try {
    const { displayName, avatar } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.dbUser._id,
      { 
        $set: { displayName, avatar }
      },
      { new: true }
    );
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-supabaseId');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
