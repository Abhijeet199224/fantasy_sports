// frontend/app/contests/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contests`);
      const data = await res.json();
      setContests(data);
    } catch (error) {
      console.error('Failed to fetch contests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading contests...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Contests</h1>
        <Link
          href="/contests/create"
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          + Create Contest
        </Link>
      </div>

      {contests.length === 0 ? (
        <p className="text-gray-600">No contests available</p>
      ) : (
        <div className="grid gap-4">
          {contests.map(contest => (
            <div key={contest._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold mb-2">{contest.name}</h3>
                  <p className="text-gray-600 mb-2">Prize: {contest.prizePool}</p>
                  <p className="text-sm text-gray-500">
                    Participants: {contest.participants?.length || 0}/{contest.maxTeams}
                  </p>
                  <p className="text-sm text-gray-500">Status: {contest.status}</p>
                </div>
                
                <Link
                  href={`/create-team?matchId=${contest.matchId}&contestId=${contest._id}`}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Join Contest
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
