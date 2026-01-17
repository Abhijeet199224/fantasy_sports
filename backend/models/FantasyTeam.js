// backend/models/FantasyTeam.js
const mongoose = require('mongoose');

const FantasyTeamSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    required: true
  },
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  teamName: {
    type: String,
    required: true
  },
  players: [{
    playerId: String,
    name: String,
    role: String,
    credits: Number,
    isCaptain: {
      type: Boolean,
      default: false
    },
    isViceCaptain: {
      type: Boolean,
      default: false
    },
    points: {
      type: Number,
      default: 0
    }
  }],
  totalCredits: {
    type: Number,
    required: true,
    max: 100
  },
  formation: {
    batsmen: Number,
    bowlers: Number,
    allRounders: Number,
    wicketKeepers: Number
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  rank: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  lockedAt: Date
});

module.exports = mongoose.model('FantasyTeam', FantasyTeamSchema);
