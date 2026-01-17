// Add to Admin Dashboard UI
// frontend/app/admin/page.js

<div className="bg-white rounded-lg shadow p-6 mb-6">
  <h2 className="text-xl font-bold mb-4">System Health</h2>
  
  <div className="grid grid-cols-2 gap-4">
    <div>
      <p className="text-gray-600">API Calls Today</p>
      <p className="text-2xl font-bold">{apiStats.used}/100</p>
    </div>
    
    <div>
      <p className="text-gray-600">Backend Status</p>
      <p className="text-2xl font-bold text-green-600">
        {backendStatus === 'ok' ? 'Active' : 'Sleeping'}
      </p>
    </div>
  </div>
  
  <button 
    onClick={refreshMatch}
    disabled={apiStats.used >= 100}
    className="mt-4 w-full bg-blue-600 text-white py-2 rounded disabled:bg-gray-400"
  >
    Refresh Match Data ({apiStats.remaining} calls left)
  </button>
</div>
