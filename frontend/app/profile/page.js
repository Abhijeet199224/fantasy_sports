// frontend/app/profile/page.js
'use client';

import { useState, useEffect } from 'react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('supabase_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUser(data.user);
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  if (!user) {
    return <div className="container mx-auto p-4">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user.displayName?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user.displayName}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">{stats.totalPoints || 0}</p>
              <p className="text-gray-600">Total Points</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">{stats.contestsWon || 0}</p>
              <p className="text-gray-600">Contests Won</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">{stats.contestsJoined || 0}</p>
              <p className="text-gray-600">Contests Joined</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
