// frontend/app/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [activeContests, setActiveContests] = useState([]);

  useEffect(() => {
    fetchUpcomingMatches();
    fetchActiveContests();
  }, []);

  const fetchUpcomingMatches = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches?status=upcoming&limit=3`);
      const data = await res.json();
      setUpcomingMatches(data);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    }
  };

  const fetchActiveContests = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contests?status=open&limit=3`);
      const data = await res.json();
      setActiveContests(data);
    } catch (error) {
      console.error('Failed to fetch contests:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="text-center mb-12 mt-8">
        <h1 className="text-5xl font-bold mb-4">Fantasy Cricket League</h1>
        <p className="text-xl text-gray-600">Compete with friends, win bragging rights!</p>
      </div>

      {/* Upcoming Matches */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Upcoming Matches</h2>
          <Link href="/matches" className="text-blue-600 hover:underline">View All</Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {upcomingMatches.map(match => (
            <div key={match._id} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-bold text-lg mb-2">{match.title}</h3>
              <p className="text-gray-600 mb-2">{match.venue}</p>
              <p className="text-sm text-gray-500 mb-4">
                {new Date(match.startTime).toLocaleString()}
              </p>
              <Link
                href={`/contests?matchId=${match._id}`}
                className="block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                View Contests
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Active Contests */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Active Contests</h2>
          <Link href="/contests" className="text-blue-600 hover:underline">View All</Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {activeContests.map(contest => (
            <div key={contest._id} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-bold text-lg mb-2">{contest.name}</h3>
              <p className="text-gray-600 mb-2">Prize: {contest.prizePool}</p>
              <p className="text-sm text-gray-500 mb-4">
                {contest.participants?.length || 0}/{contest.maxTeams} Teams
              </p>
              <Link
                href={`/create-team?matchId=${contest.matchId}&contestId=${contest._id}`}
                className="block text-center bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Join Contest
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
