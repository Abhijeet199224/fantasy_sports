// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth');

// Temporarily load services with better error handling
let apiManager, PointsCalculator, LeaderboardService;

try {
  apiManager = require('../services/apiRateLimiter');
  PointsCalculator = require('../services/pointsCalculator');
  console.log('✅ Services loaded successfully');
} catch (error) {
  console.error('❌ Error loading services:', error.message);
  console.error('Current directory:', __dirname);
  console.error('Looking for services at:', require('path').resolve(__dirname, '../services'));
}

const Match = require('../models/Match');
const FantasyTeam = require('../models/FantasyTeam');
const Contest = require('../models/Contest');
const User = require('../models/User');
const PointsHistory = require('../models/PointsHistory');

// Get API usage stats
router.get('/api-stats', verifyAdmin, (req, res) => {
  if (!apiManager) {
    return res.status(500).json({ error: 'API Manager not loaded' });
  }
  res.json(apiManager.getCallLog());
});

// Manually refresh match data
router.post('/refresh-match/:matchId', verifyAdmin, async (req, res) => {
  try {
    if (!apiManager) {
      return res.status(500).json({ error: 'API Manager not loaded' });
    }
    
    const match = await Match.findById(req.params.matchId);
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    const matchData = await apiManager.fetchWithCache(
      `match_info/${match.cricketApiId}`,
      `match_${match.cricketApiId}`,
      300
    );
    
    match.liveData = matchData;
    match.lastUpdated = new Date();
    
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

// Clear API cache
router.post('/clear-cache', verifyAdmin, (req, res) => {
  if (!apiManager) {
    return res.status(500).json({ error: 'API Manager not loaded' });
  }
  apiManager.clearCache();
  res.json({ success: true, message: 'Cache cleared' });
});

module.exports = router;
