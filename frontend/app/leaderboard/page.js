// frontend/app/leaderboard/page.js
'use client';

import { useState, useEffect } from 'react';

export default function Leaderboard() {
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetchContests();
  }, []);

  useEffect(() => {
    if (selectedContest) {
      fetchLeaderboard(selectedContest);
    }
  }, [selectedContest]);

  const fetchContests = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contests`);
      const data = await res.json();
      setContests(data);
      if (data.length > 0) setSelectedContest(data[0]._id);
    } catch (error) {
      console.error('Failed to fetch contests:', error);
    }
  };

  const fetchLeaderboard = async (contestId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contests/${contestId}/leaderboard`);
      const data = await res.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>

      <div className="mb-6">
        <select
          value={selectedContest || ''}
          onChange={(e) => setSelectedContest(e.target.value)}
          className="w-full md:w-96 border rounded p-2"
        >
          {contests.map(contest => (
            <option key={contest._id} value={contest._id}>
              {contest.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Rank</th>
              <th className="p-4 text-left">Team Name</th>
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={entry._id} className="border-t">
                <td className="p-4 font-bold">#{index + 1}</td>
                <td className="p-4">{entry.teamName}</td>
                <td className="p-4">{entry.userName}</td>
                <td className="p-4 text-right font-bold text-blue-600">{entry.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
