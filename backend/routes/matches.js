// backend/routes/matches.js
const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const { verifyAuth } = require('../middleware/auth');

// Get all matches with filters
router.get('/', async (req, res) => {
  try {
    const { status, limit } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const matches = await Match.find(query)
      .sort({ startTime: status === 'completed' ? -1 : 1 })
      .limit(limit ? parseInt(limit) : 100);
    
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get match by ID
router.get('/:matchId', async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create match (admin only - for testing, you can add manually to DB)
router.post('/', verifyAuth, async (req, res) => {
  try {
    const match = await Match.create(req.body);
    res.status(201).json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update match
router.put('/:matchId', verifyAuth, async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(
      req.params.matchId,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
