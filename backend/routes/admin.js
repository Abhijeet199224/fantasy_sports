// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const apiManager = require('../services/apiRateLimiter');
const { verifyAdmin } = require('../middleware/auth');

// Admin manually triggers data refresh
router.post('/refresh-match/:matchId', verifyAdmin, async (req, res) => {
  const { matchId } = req.params;
  
  try {
    const matchData = await apiManager.fetchWithCache(
      `match_info/${matchId}`,
      `match_${matchId}`,
      300 // 5-minute cache
    );
    
    // Store in DB
    await Match.findOneAndUpdate(
      { cricketApiId: matchId },
      { $set: { liveData: matchData, lastUpdated: new Date() } },
      { upsert: true }
    );
    
    res.json({ 
      success: true, 
       matchData,
      apiStatus: apiManager.getCallLog()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get API usage stats
router.get('/api-stats', verifyAdmin, (req, res) => {
  res.json(apiManager.getCallLog());
});

module.exports = router;

// backend/routes/admin.js (continued)
router.post('/calculate-points/:matchId', verifyAdmin, async (req, res) => {
  const { matchId } = req.params;
  const Match = require('../models/Match');
  const FantasyTeam = require('../models/FantasyTeam');
  const PointsCalculator = require('../services/pointsCalculator');
  
  try {
    // Fetch final match data from API
    const match = await Match.findById(matchId);
    
    if (match.pointsCalculated) {
      return res.status(400).json({ error: 'Points already calculated' });
    }
    
    // Get all fantasy teams for this match
    const teams = await FantasyTeam.find({ matchId });
    
    for (const team of teams) {
      const points = await PointsCalculator.calculateTeamPoints(team, match);
      team.totalPoints = points;
      await team.save();
    }
    
    // Update match status
    match.pointsCalculated = true;
    match.status = 'completed';
    await match.save();
    
    // Calculate rankings for each contest
    const Contest = require('../models/Contest');
    const contests = await Contest.find({ matchId });
    
    for (const contest of contests) {
      const contestTeams = await FantasyTeam.find({ 
        contestId: contest._id 
      }).sort({ totalPoints: -1 });
      
      contestTeams.forEach((team, index) => {
        team.rank = index + 1;
        team.save();
      });
      
      contest.status = 'completed';
      await contest.save();
    }
    
    res.json({ success: true, teamsUpdated: teams.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
