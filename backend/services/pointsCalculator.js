// backend/services/pointsCalculator.js
class PointsCalculator {
  // Dream11-style points system
  static calculatePlayerPoints(performance, role) {
    let points = 0;
    const breakdown = {
      runsPoints: 0,
      wicketsPoints: 0,
      bonusPoints: 0,
      penaltyPoints: 0
    };
    
    // Batting Points
    const runsPoints = performance.runs * 1;
    points += runsPoints;
    breakdown.runsPoints = runsPoints;
    
    if (performance.runs >= 50) {
      points += 8; // Half-century bonus
      breakdown.bonusPoints += 8;
    }
    if (performance.runs >= 100) {
      points += 16; // Century bonus (additional)
      breakdown.bonusPoints += 16;
    }
    
    // Strike rate bonus (in T20/ODI, minimum 10 balls)
    if (performance.balls_faced >= 10) {
      const strikeRate = (performance.runs / performance.balls_faced) * 100;
      if (strikeRate > 170 && performance.runs >= 20) {
        points += 6;
        breakdown.bonusPoints += 6;
      } else if (strikeRate > 150 && performance.runs >= 20) {
        points += 4;
        breakdown.bonusPoints += 4;
      } else if (strikeRate > 130 && performance.runs >= 20) {
        points += 2;
        breakdown.bonusPoints += 2;
      }
    }
    
    // Boundary bonus
    points += (performance.fours || 0) * 1;
    points += (performance.sixes || 0) * 2;
    breakdown.bonusPoints += (performance.fours || 0) * 1 + (performance.sixes || 0) * 2;
    
    // Bowling Points
    const wicketsPoints = (performance.wickets || 0) * 25;
    points += wicketsPoints;
    breakdown.wicketsPoints = wicketsPoints;
    
    if (performance.wickets >= 4) {
      points += 8; // 4-wicket haul
      breakdown.bonusPoints += 8;
    }
    if (performance.wickets >= 5) {
      points += 16; // 5-wicket haul (additional)
      breakdown.bonusPoints += 16;
    }
    
    // Maiden overs (in T20/ODI)
    points += (performance.maidens || 0) * 12;
    breakdown.bonusPoints += (performance.maidens || 0) * 12;
    
    // Economy rate bonus (minimum 2 overs)
    if (performance.overs >= 2) {
      const economy = performance.runs_conceded / performance.overs;
      if (economy < 5) {
        points += 6;
        breakdown.bonusPoints += 6;
      } else if (economy < 6) {
        points += 4;
        breakdown.bonusPoints += 4;
      } else if (economy < 7) {
        points += 2;
        breakdown.bonusPoints += 2;
      } else if (economy > 10) {
        points -= 2;
        breakdown.penaltyPoints += 2;
      }
    }
    
    // Fielding Points
    points += (performance.catches || 0) * 8;
    points += (performance.run_outs || 0) * 6;
    points += (performance.stumpings || 0) * 12;
    breakdown.bonusPoints += (performance.catches || 0) * 8 + 
                             (performance.run_outs || 0) * 6 + 
                             (performance.stumpings || 0) * 12;
    
    // Penalty for duck (batsman/all-rounder only)
    if (performance.runs === 0 && performance.balls_faced > 0 && 
        ['BAT', 'AR'].includes(role)) {
      points -= 2;
      breakdown.penaltyPoints += 2;
    }
    
    breakdown.totalPoints = Math.max(0, points);
    
    return {
      points: Math.max(0, points),
      breakdown
    };
  }
  
  static async calculateTeamPoints(fantasyTeam, match) {
    let totalPoints = 0;
    const playerPointsDetails = [];
    
    for (const player of fantasyTeam.players) {
      const matchPlayer = match.squad.find(p => p.playerId === player.playerId);
      
      if (!matchPlayer) {
        console.warn(`Player ${player.playerId} not found in match squad`);
        continue;
      }
      
      const result = this.calculatePlayerPoints(matchPlayer.performance, matchPlayer.role);
      let playerPoints = result.points;
      
      // Captain multiplier (2x)
      if (player.isCaptain) {
        playerPoints *= 2;
      }
      // Vice-captain multiplier (1.5x)
      else if (player.isViceCaptain) {
        playerPoints *= 1.5;
      }
      
      totalPoints += playerPoints;
      
      playerPointsDetails.push({
        playerId: player.playerId,
        name: player.name,
        basePoints: result.points,
        multiplier: player.isCaptain ? 2 : player.isViceCaptain ? 1.5 : 1,
        finalPoints: playerPoints,
        breakdown: result.breakdown
      });
    }
    
    return {
      totalPoints: Math.round(totalPoints),
      playerDetails: playerPointsDetails
    };
  }
}

module.exports = PointsCalculator;