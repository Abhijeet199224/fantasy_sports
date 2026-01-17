// backend/routes/teams.js
const express = require('express');
const router = express.Router();
const FantasyTeam = require('../models/FantasyTeam');
const Match = require('../models/Match');
const Contest = require('../models/Contest');
const { verifyAuth } = require('../middleware/auth');

// Get user's teams
router.get('/my-teams', verifyAuth, async (req, res) => {
  try {
    const teams = await FantasyTeam.find({ userId: req.dbUser._id })
      .populate('matchId', 'title startTime status')
      .populate('contestId', 'name')
      .sort({ createdAt: -1 });
    
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get team by ID
router.get('/:teamId', async (req, res) => {
  try {
    const team = await FantasyTeam.findById(req.params.teamId)
      .populate('matchId')
      .populate('contestId')
      .populate('userId', 'displayName email');
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create team
router.post('/', verifyAuth, async (req, res) => {
  try {
    const { matchId, contestId, teamName, players } = req.body;
    
    // Validate match exists
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    // Validate contest exists
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    
    // Validate 11 players
    if (players.length !== 11) {
      return res.status(400).json({ error: 'Team must have exactly 11 players' });
    }
    
    // Calculate total credits
    const totalCredits = players.reduce((sum, p) => sum + p.credits, 0);
    
    if (totalCredits > 100) {
      return res.status(400).json({ error: 'Total credits exceed 100' });
    }
    
    // Validate captain and vice-captain
    const captains = players.filter(p => p.isCaptain);
    const viceCaptains = players.filter(p => p.isViceCaptain);
    
    if (captains.length !== 1 || viceCaptains.length !== 1) {
      return res.status(400).json({ error: 'Must have exactly 1 captain and 1 vice-captain' });
    }
    
    // Calculate formation
    const formation = {
      batsmen: players.filter(p => p.role === 'BAT').length,
      bowlers: players.filter(p => p.role === 'BOWL').length,
      allRounders: players.filter(p => p.role === 'AR').length,
      wicketKeepers: players.filter(p => p.role === 'WK').length
    };
    
    const team = await FantasyTeam.create({
      userId: req.dbUser._id,
      matchId,
      contestId,
      teamName,
      players,
      totalCredits,
      formation,
      lockedAt: new Date()
    });
    
    // Add team to contest participants
    await Contest.findByIdAndUpdate(contestId, {
      $push: {
        participants: {
          userId: req.dbUser._id,
          teamId: team._id
        }
      }
    });
    
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update team (only before match starts)
router.put('/:teamId', verifyAuth, async (req, res) => {
  try {
    const team = await FantasyTeam.findById(req.params.teamId);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    if (team.userId.toString() !== req.dbUser._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const match = await Match.findById(team.matchId);
    if (new Date() > match.startTime) {
      return res.status(400).json({ error: 'Cannot edit team after match starts' });
    }
    
    Object.assign(team, req.body);
    await team.save();
    
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
