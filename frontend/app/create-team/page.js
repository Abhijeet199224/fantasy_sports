/// frontend/app/create-team/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import PlayerCard from '@/components/PlayerCard';

export default function CreateTeam() {
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/${matchId}`);
    const data = await res.json();
    setMatch(data);
  };
  
  // ... rest of your component logic (same as before)
  
  if (!matchId) {
    return <div className="p-4">No match selected</div>;
  }
  
  if (!match) return <div>Loading...</div>;

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
