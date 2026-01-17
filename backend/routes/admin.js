// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth');
const apiManager = require('../services/apiRateLimiter');
const PointsCalculator = require('../services/pointsCalculator');
const Match = require('../models/Match');
const FantasyTeam = require('../models/FantasyTeam');
const Contest = require('../models/Contest');
const User = require('../models/User');
const PointsHistory = require('../models/PointsHistory');

// Get API usage stats
router.get('/api-stats', verifyAdmin, (req, res) => {
  res.json(apiManager.getCallLog());
});

// Manually refresh match data
router.post('/refresh-match/:matchId', verifyAdmin, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    // Fetch live data from API
    const matchData = await apiManager.fetchWithCache(
      `match_info/${match.cricketApiId}`,
      `match_${match.cricketApiId}`,
      300 // 5-minute cache
    );
    
    // Update match with live data
    match.liveData = matchData;
    match.lastUpdated = new Date();
    
    // Update match status
    if (matchData.status === 'live') {
      match.status = 'live';
    } else if (matchData.status === 'completed') {
      match.status = 'completed';
    }
    
    await match.save();
    
    res.json({
      success: true,
      match,
      apiStatus: apiManager.getCallLog()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate points for a match
router.post('/calculate-points/:matchId', verifyAdmin, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    if (match.pointsCalculated) {
      return res.status(400).json({ error: 'Points already calculated for this match' });
    }
    
    if (match.status !== 'completed') {
      return res.status(400).json({ error: 'Match is not completed yet' });
    }
    
    // Calculate points for each player in the match
    for (const player of match.squad) {
      const result = PointsCalculator.calculatePlayerPoints(player.performance, player.role);
      player.points = result.points;
      
      // Save to points history
      await PointsHistory.create({
        matchId: match._id,
        playerId: player.playerId,
        playerName: player.name,
        performance: player.performance,
        pointsBreakdown: result.breakdown
      });
    }
    
    await match.save();
    
    // Calculate points for all fantasy teams in this match
    const teams = await FantasyTeam.find({ matchId: match._id });
    
    for (const team of teams) {
      const result = await PointsCalculator.calculateTeamPoints(team, match);
      team.totalPoints = result.totalPoints;
      
      // Update individual player points in team
      for (const detail of result.playerDetails) {
        const playerIndex = team.players.findIndex(p => p.playerId === detail.playerId);
        if (playerIndex !== -1) {
          team.players[playerIndex].points = detail.finalPoints;
        }
      }
      
      await team.save();
      
      // Update user stats
      await User.findByIdAndUpdate(team.userId, {
        $inc: { 'stats.totalPoints': result.totalPoints }
      });
    }
    
    // Update rankings in each contest
    const contests = await Contest.find({ matchId: match._id });
    
    for (const contest of contests) {
      const contestTeams = await FantasyTeam.find({ 
        contestId: contest._id 
      }).sort({ totalPoints: -1 });
      
      for (let i = 0; i < contestTeams.length; i++) {
        contestTeams[i].rank = i + 1;
        await contestTeams[i].save();
        
        // Award winner
        if (i === 0) {
          await User.findByIdAndUpdate(contestTeams[i].userId, {
            $inc: { 'stats.contestsWon': 1 }
          });
        }
      }
      
      contest.status = 'completed';
      await contest.save();
    }
    
    match.pointsCalculated = true;
    await match.save();
    
    res.json({
      success: true,
      teamsUpdated: teams.length,
      contestsUpdated: contests.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear API cache
router.post('/clear-cache', verifyAdmin, (req, res) => {
  apiManager.clearCache();
  res.json({ success: true, message: 'Cache cleared' });
});

// Make a user admin
router.post('/make-admin/:userId', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: { isAdmin: true } },
      { new: true }
    );
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
