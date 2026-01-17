// frontend/app/my-teams/page.js
'use client';

import { useState, useEffect } from 'react';

export default function MyTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTeams();
  }, []);

  const fetchMyTeams = async () => {
    try {
      const token = localStorage.getItem('supabase_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teams/my-teams`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTeams(data);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading your teams...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Teams</h1>

      {teams.length === 0 ? (
        <p className="text-gray-600">You haven't created any teams yet</p>
      ) : (
        <div className="grid gap-6">
          {teams.map(team => (
            <div key={team._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{team.teamName}</h3>
                  <p className="text-gray-600">Credits Used: {team.totalCredits}/100</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{team.totalPoints || 0}</p>
                  <p className="text-sm text-gray-500">Points</p>
                  {team.rank && <p className="text-sm text-gray-500">Rank: #{team.rank}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {team.players.map(player => (
                  <div key={player.playerId} className="border rounded p-2">
                    <p className="font-bold text-sm">{player.name}</p>
                    <p className="text-xs text-gray-600">{player.role}</p>
                    {player.isCaptain && <span className="text-xs bg-yellow-200 px-1 rounded">C</span>}
                    {player.isViceCaptain && <span className="text-xs bg-orange-200 px-1 rounded">VC</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
