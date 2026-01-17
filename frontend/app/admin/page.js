// frontend/app/admin/page.js
'use client';

import { useState, useEffect } from 'react';

export default function AdminPanel() {
  const [apiStats, setApiStats] = useState({ used: 0, remaining: 100, logs: [] });
  const [backendStatus, setBackendStatus] = useState('checking');
  const [matches, setMatches] = useState([]);
  
  useEffect(() => {
    fetchApiStats();
    checkBackendStatus();
    fetchMatches();
  }, []);
  
  const fetchApiStats = async () => {
    try {
      const token = localStorage.getItem('supabase_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/api-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setApiStats(data);
    } catch (error) {
      console.error('Failed to fetch API stats:', error);
    }
  };
  
  const checkBackendStatus = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
      setBackendStatus(res.ok ? 'ok' : 'error');
    } catch (error) {
      setBackendStatus('offline');
    }
  };
  
  const fetchMatches = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches`);
      const data = await res.json();
      setMatches(data);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    }
  };
  
  const refreshMatch = async (matchId) => {
    try {
      const token = localStorage.getItem('supabase_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/refresh-match/${matchId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        alert('Match data refreshed!');
        fetchApiStats();
      } else {
        alert('Failed to refresh');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">System Health</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">API Calls Today</p>
            <p className="text-2xl font-bold">{apiStats.used}/100</p>
          </div>
          
          <div>
            <p className="text-gray-600">Backend Status</p>
            <p className={`text-2xl font-bold ${backendStatus === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
              {backendStatus === 'ok' ? 'Active' : 'Offline'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Match Controls</h2>
        
        <div className="space-y-4">
          {matches.map(match => (
            <div key={match._id} className="border rounded p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold">{match.title}</h3>
                <p className="text-sm text-gray-600">
                  Last Updated: {match.lastUpdated ? new Date(match.lastUpdated).toLocaleTimeString() : 'Never'}
                </p>
              </div>
              
              <button
                onClick={() => refreshMatch(match._id)}
                disabled={apiStats.remaining <= 0}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
              >
                Refresh ({apiStats.remaining} left)
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
