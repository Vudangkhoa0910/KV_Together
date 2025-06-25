'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TokenManager } from '@/lib/tokenManager';

export default function TokenTestComponent() {
  const { refreshToken, isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRefreshToken = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await refreshToken();
      setMessage('✅ Token refreshed successfully!');
    } catch (error) {
      setMessage('❌ Token refresh failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getTokenInfo = () => {
    const tokenInfo = TokenManager.getTokenInfo();
    if (!tokenInfo) return 'No token found';
    
    const ageMinutes = Math.floor((Date.now() - tokenInfo.createdAt) / (1000 * 60));
    return `Token age: ${ageMinutes} minutes, Should refresh: ${tokenInfo.shouldRefresh ? 'Yes' : 'No'}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please login to test token functionality</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🔑 Token Management Test</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-700">Current User:</h4>
          <p className="text-sm text-gray-600">{user?.name} ({user?.email})</p>
        </div>

        <div>
          <h4 className="font-medium text-gray-700">Token Info:</h4>
          <p className="text-sm text-gray-600">{getTokenInfo()}</p>
        </div>

        <div>
          <button
            onClick={handleRefreshToken}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Refreshing...' : 'Manual Refresh Token'}
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded-lg ${
            message.includes('✅') 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="text-sm text-gray-500">
          <p><strong>Auto-refresh:</strong> Token will automatically refresh when it's 50+ minutes old</p>
          <p><strong>API errors:</strong> 401 errors will trigger automatic refresh</p>
          <p><strong>Background refresh:</strong> Token refreshes every 55 minutes if authenticated</p>
        </div>
      </div>
    </div>
  );
}
