// frontend/app/create-team/CreateTeamContent.js
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function CreateTeamContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const matchId = searchParams.get('matchId');
  const contestId = searchParams.get('contestId');
  
  const [match, setMatch] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [credits, setCredits] = useState(100);
  const [captain, setCaptain] = useState(null);
  const [viceCaptain, setViceCaptain] = useState(null);
  const [filter, setFilter] = useState('ALL');
  
  useEffect(() => {
    if (matchId) {
      fetchMatch();
    }
  }, [matchId]);
  
  const fetchMatch = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/${matchId}`);
      const data = await res.json();
      setMatch(data);
    } catch (error) {
      console.error('Failed to fetch match:', error);
    }
  };
  
  const togglePlayer = (player) => {
    if (selectedPlayers.find(p => p.playerId === player.playerId)) {
      setSelectedPlayers(selectedPlayers.filter(p => p.playerId !== player.playerId));
      setCredits(credits + player.credits);
      
      if (captain?.playerId === player.playerId) setCaptain(null);
      if (viceCaptain?.playerId === player.playerId) setViceCaptain(null);
    } else {
      if (selectedPlayers.length >= 11) {
        alert('Maximum 11 players allowed');
        return;
      }
      
      if (credits < player.credits) {
        alert('Insufficient credits');
        return;
      }
      
      setSelectedPlayers([...selectedPlayers, player]);
      setCredits(credits - player.credits);
    }
  };
  
  const saveTeam = async () => {
    if (selectedPlayers.length !== 11) {
      alert('Select exactly 11 players');
      return;
    }
    
    if (!captain || !viceCaptain) {
      alert('Select Captain and Vice-Captain');
      return;
    }
    
    const token = localStorage.getItem('supabase_token');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          matchId,
          contestId,
          teamName: `Team ${Date.now()}`,
          players: selectedPlayers.map(p => ({
            ...p,
            isCaptain: p.playerId === captain.playerId,
            isViceCaptain: p.playerId === viceCaptain.playerId
          }))
        })
      });
      
      if (res.ok) {
        router.push('/my-teams');
      } else {
        alert('Failed to save team');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };
  
  if (!matchId) {
    return <div className="container mx-auto p-4">No match selected</div>;
  }
  
  if (!match) return <div className="container mx-auto p-4">Loading...</div>;
  
  const filteredPlayers = filter === 'ALL' 
    ? match.squad 
    : match.squad.filter(p => p.role === filter);
  
  return (
    <div className="container mx-auto p-4">
      <div className="sticky top-0 bg-white shadow-md p-4 mb-4 z-10">
        <h1 className="text-2xl font-bold">{match.title}</h1>
        <div className="flex justify-between mt-2">
          <span>Players: {selectedPlayers.length}/11</span>
          <span className="font-bold">Credits: {credits.toFixed(1)}/100</span>
        </div>
      </div>
      
      <div className="flex gap-2 mb-4 flex-wrap">
        {['ALL', 'WK', 'BAT', 'AR', 'BOWL'].map(role => (
          <button
            key={role}
            className={`px-4 py-2 rounded ${filter === role ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilter(role)}
          >
            {role}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
        {filteredPlayers.map(player => (
          <div
            key={player.playerId}
            className={`border rounded-lg p-4 cursor-pointer ${
              selectedPlayers.some(p => p.playerId === player.playerId) ? 'border-green-500 bg-green-50' : 'border-gray-300'
            }`}
            onClick={() => togglePlayer(player)}
          >
            <div className="flex justify-between mb-2">
              <div>
                <h3 className="font-bold">{player.name}</h3>
                <span className="text-sm text-gray-600">{player.team}</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{player.credits}</div>
                <div className="text-xs text-gray-500">Credits</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 text-xs rounded ${
                player.role === 'BAT' ? 'bg-red-100 text-red-700' :
                player.role === 'BOWL' ? 'bg-blue-100 text-blue-700' :
                player.role === 'AR' ? 'bg-purple-100 text-purple-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {player.role}
              </span>
            </div>
            
            {selectedPlayers.some(p => p.playerId === player.playerId) && (
              <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                <button
                  className={`flex-1 py-1 text-xs rounded ${
                    captain?.playerId === player.playerId ? 'bg-yellow-500 text-white' : 'bg-gray-200'
                  }`}
                  onClick={() => setCaptain(player)}
                >
                  {captain?.playerId === player.playerId ? '(C) 2x' : 'Captain'}
                </button>
                <button
                  className={`flex-1 py-1 text-xs rounded ${
                    viceCaptain?.playerId === player.playerId ? 'bg-orange-500 text-white' : 'bg-gray-200'
                  }`}
                  onClick={() => setViceCaptain(player)}
                >
                  {viceCaptain?.playerId === player.playerId ? '(VC) 1.5x' : 'VC'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4">
        <button
          className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
          onClick={saveTeam}
        >
          Save Team
        </button>
      </div>
    </div>
  );
}
