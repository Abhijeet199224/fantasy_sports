// backend/models/Contest.js
const mongoose = require('mongoose');

const ContestSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  maxTeams: {
    type: Number,
    required: true,
    min: 2,
    max: 10
  },
  entryFee: {
    type: Number,
    default: 0
  },
  prizePool: {
    type: String,
    default: 'Bragging Rights'
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FantasyTeam'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['open', 'full', 'live', 'completed'],
    default: 'open'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contest', ContestSchema);
