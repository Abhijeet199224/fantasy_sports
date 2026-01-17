// backend/services/pointsCalculator.js
class PointsCalculator {
  // Dream11-style points system
  static calculatePlayerPoints(performance) {
    let points = 0;
    
    // Batting Points
    points += performance.runs * 1;
    if (performance.runs >= 50) points += 8; // Half-century bonus
    if (performance.runs >= 100) points += 16; // Century bonus
    
    // Strike rate bonus (in T20/ODI)
    if (performance.balls_faced > 0) {
      const strikeRate = (performance.runs / performance.balls_faced) * 100;
      if (strikeRate > 170 && performance.runs >= 20) points += 6;
      else if (strikeRate > 150 && performance.runs >= 20) points += 4;
      else if (strikeRate > 130 && performance.runs >= 20) points += 2;
    }
    
    // Bowling Points
    points += performance.wickets * 25;
    if (performance.wickets >= 4) points += 8; // 4-wicket haul
    if (performance.wickets >= 5) points += 16; // 5-wicket haul
    
    // Economy rate bonus (min 2 overs)
    if (performance.overs >= 2) {
      const economy = performance.runs_conceded / performance.overs;
      if (economy < 5) points += 6;
      else if (economy < 6) points += 4;
      else if (economy < 7) points += 2;
    }
    
    // Fielding Points
    points += performance.catches * 8;
    points += performance.run_outs * 6;
    points += performance.stumpings * 12;
    
    // Penalty for duck (batsman/all-rounder)
    if (performance.runs === 0 && performance.balls_faced > 0 && 
        ['BAT', 'AR'].includes(performance.role)) {
      points -= 2;
    }
    
    return Math.max(0, points); // Minimum 0 points
  }
  
  static async calculateTeamPoints(fantasyTeam, matchData) {
    let totalPoints = 0;
    
    for (const player of fantasyTeam.players) {
      const performance = matchData.squad.find(p => p.playerId === player.playerId);
      if (!performance) continue;
      
      let playerPoints = this.calculatePlayerPoints(performance);
      
      // Captain multiplier (2x)
      if (player.isCaptain) {
        playerPoints *= 2;
      }
      // Vice-captain multiplier (1.5x)
      else if (player.isViceCaptain) {
        playerPoints *= 1.5;
      }
      
      totalPoints += playerPoints;
    }
    
    return Math.round(totalPoints);
  }
}

module.exports = PointsCalculator;
