// backend/models/PointsHistory.js
const mongoose = require('mongoose');

const PointsHistorySchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  playerId: {
    type: String,
    required: true
  },
  playerName: String,
  performance: {
    runs: Number,
    wickets: Number,
    catches: Number,
    runOuts: Number,
    stumpings: Number,
    economy: Number,
    strikeRate: Number
  },
  pointsBreakdown: {
    runsPoints: Number,
    wicketsPoints: Number,
    bonusPoints: Number,
    penaltyPoints: Number,
    totalPoints: Number
  },
  calculatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PointsHistory', PointsHistorySchema);
