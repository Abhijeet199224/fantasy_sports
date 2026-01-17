// backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  supabaseId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  avatar: String,
  isAdmin: {
    type: Boolean,
    default: false
  },
  stats: {
    totalPoints: {
      type: Number,
      default: 0
    },
    contestsWon: {
      type: Number,
      default: 0
    },
    contestsJoined: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
