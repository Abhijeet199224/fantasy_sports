// frontend/app/contests/create/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateContest() {
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [formData, setFormData] = useState({
    matchId: '',
    name: '',
    maxTeams: 5,
    prizePool: 'Bragging Rights'
  });

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches?status=upcoming`);
      const data = await res.json();
      setMatches(data);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('supabase_token');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        router.push('/contests');
      } else {
        alert('Failed to create contest');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create Contest</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Select Match</label>
          <select
            required
            value={formData.matchId}
            onChange={(e) => setFormData({...formData, matchId: e.target.value})}
            className="w-full border rounded p-2"
          >
            <option value="">Choose a match</option>
            {matches.map(match => (
              <option key={match._id} value={match._id}>
                {match.title} - {new Date(match.startTime).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Contest Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full border rounded p-2"
            placeholder="Friends League #1"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Max Teams</label>
          <input
            type="number"
            required
            min="2"
            max="10"
            value={formData.maxTeams}
            onChange={(e) => setFormData({...formData, maxTeams: parseInt(e.target.value)})}
            className="w-full border rounded p-2"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Prize</label>
          <input
            type="text"
            required
            value={formData.prizePool}
            onChange={(e) => setFormData({...formData, prizePool: e.target.value})}
            className="w-full border rounded p-2"
            placeholder="Bragging Rights"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700"
        >
          Create Contest
        </button>
      </form>
    </div>
  );
}
