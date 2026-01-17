// backend/services/leaderboard.js
const FantasyTeam = require('../models/FantasyTeam');
const User = require('../models/User');

class LeaderboardService {
  static async getContestLeaderboard(contestId) {
    try {
      const teams = await FantasyTeam.find({ contestId })
        .populate('userId', 'displayName email avatar')
        .sort({ totalPoints: -1 })
        .lean();
      
      return teams.map((team, index) => ({
        rank: index + 1,
        teamId: team._id,
        teamName: team.teamName,
        userId: team.userId._id,
        userName: team.userId.displayName,
        userAvatar: team.userId.avatar,
        totalPoints: team.totalPoints,
        players: team.players.length
      }));
    } catch (error) {
      console.error('Leaderboard error:', error);
      throw error;
    }
  }
  
  static async getGlobalLeaderboard(limit = 10) {
    try {
      const users = await User.find()
        .sort({ 'stats.totalPoints': -1 })
        .limit(limit)
        .select('displayName email avatar stats')
        .lean();
      
      return users.map((user, index) => ({
        rank: index + 1,
        userId: user._id,
        userName: user.displayName,
        userAvatar: user.avatar,
        totalPoints: user.stats.totalPoints,
        contestsWon: user.stats.contestsWon,
        contestsJoined: user.stats.contestsJoined
      }));
    } catch (error) {
      console.error('Global leaderboard error:', error);
      throw error;
    }
  }
}

module.exports = LeaderboardService;
