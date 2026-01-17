// frontend/app/matches/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => {
    fetchMatches();
  }, [filter]);

  const fetchMatches = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches?status=${filter}`);
      const data = await res.json();
      setMatches(data);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Matches</h1>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6">
        {['upcoming', 'live', 'completed'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-2 rounded ${
              filter === status ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Matches Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map(match => (
          <div key={match._id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg">{match.title}</h3>
              <span className={`px-3 py-1 text-xs rounded ${
                match.status === 'live' ? 'bg-red-500 text-white' :
                match.status === 'upcoming' ? 'bg-green-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {match.status}
              </span>
            </div>
            
            <p className="text-gray-600 mb-2">{match.matchType}</p>
            <p className="text-gray-600 mb-2">{match.venue}</p>
            <p className="text-sm text-gray-500 mb-4">
              {new Date(match.startTime).toLocaleString()}
            </p>
            
            <div className="flex gap-2">
              <Link
                href={`/contests?matchId=${match._id}`}
                className="flex-1 text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                View Contests
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
