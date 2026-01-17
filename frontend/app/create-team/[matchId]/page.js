// frontend/app/create-team/[matchId]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PlayerCard from '@/components/PlayerCard';

export default function CreateTeam() {
  const { matchId } = useParams();
  const router = useRouter();
  
  const [match, setMatch] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [credits, setCredits] = useState(100);
  const [captain, setCaptain] = useState(null);
  const [viceCaptain, setViceCaptain] = useState(null);
  
  const [filter, setFilter] = useState('ALL'); // ALL, BAT, BOWL, AR, WK
  
  useEffect(() => {
    fetchMatch();
  }, [matchId]);
  
  const fetchMatch = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/${matchId}`);
    const data = await res.json();
    setMatch(data);
  };
  
  const togglePlayer = (player) => {
    if (selectedPlayers.find(p => p.playerId === player.playerId)) {
      // Remove player
      setSelectedPlayers(selectedPlayers.filter(p => p.playerId !== player.playerId));
      setCredits(credits + player.credits);
      
      if (captain?.playerId === player.playerId) setCaptain(null);
      if (viceCaptain?.playerId === player.playerId) setViceCaptain(null);
    } else {
      // Add player (validate rules)
      if (selectedPlayers.length >= 11) {
        alert('Maximum 11 players allowed');
        return;
      }
      
      if (credits < player.credits) {
        alert('Insufficient credits');
        return;
      }
      
      // Check team composition rules
      const roleCount = selectedPlayers.filter(p => p.role === player.role).length;
      const maxRoleLimits = { BAT: 6, BOWL: 6, AR: 4, WK: 4 };
      
      if (roleCount >= maxRoleLimits[player.role]) {
        alert(`Maximum ${maxRoleLimits[player.role]} ${player.role} allowed`);
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
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        matchId,
        contestId: new URLSearchParams(window.location.search).get('contestId'),
        teamName: `Team ${Date.now()}`,
        players: selectedPlayers.map(p => ({
          ...p,
          isCaptain: p.playerId === captain.playerId,
          isViceCaptain: p.playerId === viceCaptain.playerId
        }))
      })
    });
    
    if (res.ok) {
      router.push('/contests');
    }
  };
  
  if (!match) return <div>Loading...</div>;
  
  const filteredPlayers = filter === 'ALL' 
    ? match.squad 
    : match.squad.filter(p => p.role === filter);
  
  return (
    <div className="container mx-auto p-4">
      <div className="sticky top-0 bg-white shadow-md p-4 mb-4">
        <h1 className="text-2xl font-bold">{match.title}</h1>
        <div className="flex justify-between mt-2">
          <span>Players: {selectedPlayers.length}/11</span>
          <span className="font-bold">Credits: {credits.toFixed(1)}/100</span>
        </div>
      </div>
      
      {/* Role Filter */}
      <div className="flex gap-2 mb-4">
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
      
      {/* Player Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map(player => (
          <PlayerCard
            key={player.playerId}
            player={player}
            isSelected={selectedPlayers.some(p => p.playerId === player.playerId)}
            isCaptain={captain?.playerId === player.playerId}
            isViceCaptain={viceCaptain?.playerId === player.playerId}
            onToggle={() => togglePlayer(player)}
            onSetCaptain={() => selectedPlayers.some(p => p.playerId === player.playerId) && setCaptain(player)}
            onSetViceCaptain={() => selectedPlayers.some(p => p.playerId === player.playerId) && setViceCaptain(player)}
          />
        ))}
      </div>
      
      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4">
        <button
          className="w-full bg-green-600 text-white py-3 rounded-lg font-bold"
          onClick={saveTeam}
        >
          Save Team
        </button>
      </div>
    </div>
  );
}
