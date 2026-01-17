// backend/models/Match.js
const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  cricketApiId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  matchType: {
    type: String,
    enum: ['ODI', 'T20', 'Test', 'T10'],
    required: true
  },
  venue: String,
  startTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed'],
    default: 'upcoming'
  },
  teams: {
    teamA: {
      name: String,
      shortName: String
    },
    teamB: {
      name: String,
      shortName: String
    }
  },
  squad: [{
    playerId: String,
    name: String,
    team: String,
    role: {
      type: String,
      enum: ['BAT', 'BOWL', 'AR', 'WK']
    },
    credits: {
      type: Number,
      min: 6,
      max: 12
    },
    points: {
      type: Number,
      default: 0
    },
    isPlaying11: {
      type: Boolean,
      default: false
    },
    performance: {
      runs: { type: Number, default: 0 },
      balls_faced: { type: Number, default: 0 },
      fours: { type: Number, default: 0 },
      sixes: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      overs: { type: Number, default: 0 },
      runs_conceded: { type: Number, default: 0 },
      maidens: { type: Number, default: 0 },
      catches: { type: Number, default: 0 },
      run_outs: { type: Number, default: 0 },
      stumpings: { type: Number, default: 0 }
    }
  }],
  liveData: mongoose.Schema.Types.Mixed,
  lastUpdated: Date,
  pointsCalculated: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Match', MatchSchema);
