// backend/routes/contests.js
const express = require('express');
const router = express.Router();
const Contest = require('../models/Contest');
const Match = require('../models/Match');
const { verifyAuth } = require('../middleware/auth');
const LeaderboardService = require('../services/leaderboard');

// Get all contests
router.get('/', async (req, res) => {
  try {
    const { status, matchId, limit } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (matchId) query.matchId = matchId;
    
    const contests = await Contest.find(query)
      .populate('matchId', 'title startTime status')
      .populate('createdBy', 'displayName')
      .sort({ createdAt: -1 })
      .limit(limit ? parseInt(limit) : 100);
    
    res.json(contests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get contest by ID
router.get('/:contestId', async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.contestId)
      .populate('matchId')
      .populate('createdBy', 'displayName email')
      .populate('participants.userId', 'displayName');
    
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    
    res.json(contest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create contest
router.post('/', verifyAuth, async (req, res) => {
  try {
    const { matchId, name, maxTeams, prizePool } = req.body;
    
    // Verify match exists
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    const contest = await Contest.create({
      matchId,
      name,
      maxTeams,
      prizePool,
      createdBy: req.dbUser._id
    });
    
    res.status(201).json(contest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join contest
router.post('/:contestId/join', verifyAuth, async (req, res) => {
  try {
    const { teamId } = req.body;
    const contest = await Contest.findById(req.params.contestId);
    
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    
    if (contest.participants.length >= contest.maxTeams) {
      return res.status(400).json({ error: 'Contest is full' });
    }
    
    // Check if user already joined
    const alreadyJoined = contest.participants.some(
      p => p.userId.toString() === req.dbUser._id.toString()
    );
    
    if (alreadyJoined) {
      return res.status(400).json({ error: 'Already joined this contest' });
    }
    
    contest.participants.push({
      userId: req.dbUser._id,
      teamId
    });
    
    if (contest.participants.length >= contest.maxTeams) {
      contest.status = 'full';
    }
    
    await contest.save();
    
    // Update user stats
    req.dbUser.stats.contestsJoined += 1;
    await req.dbUser.save();
    
    res.json(contest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get contest leaderboard
router.get('/:contestId/leaderboard', async (req, res) => {
  try {
    const leaderboard = await LeaderboardService.getContestLeaderboard(req.params.contestId);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
