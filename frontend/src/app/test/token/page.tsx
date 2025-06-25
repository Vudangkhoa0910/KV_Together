'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TokenManager } from '@/lib/tokenManager';

const TestTokenPage = () => {
  const { user, token, refreshToken, isAuthenticated } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleCheckToken = () => {
    const info = TokenManager.getTokenInfo();
    setTokenInfo(info);
    setResult(JSON.stringify(info, null, 2));
  };

  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      const newToken = await refreshToken();
      setResult(`Token refreshed successfully!\nNew token: ${newToken.substring(0, 50)}...`);
      // Update token info
      setTimeout(() => {
        handleCheckToken();
      }, 100);
    } catch (error: any) {
      setResult(`Failed to refresh token: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      setResult(`API Test Result:\n${JSON.stringify(data, null, 2)}`);
    } catch (error: any) {
      setResult(`API Test Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Test Token Management
          </h1>

          {/* Auth Status */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="font-semibold text-blue-900 mb-2">Authentication Status:</h2>
            <div className="text-sm text-blue-800">
              <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
              <p><strong>User:</strong> {user?.name || 'Not logged in'}</p>
              <p><strong>Token:</strong> {token ? `${token.substring(0, 30)}...` : 'No token'}</p>
            </div>
          </div>

          {/* Token Info */}
          {tokenInfo && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h2 className="font-semibold text-yellow-900 mb-2">Token Information:</h2>
              <div className="text-sm text-yellow-800 space-y-1">
                <p><strong>Has Token:</strong> {tokenInfo.token ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Created At:</strong> {tokenInfo.createdAt ? new Date(tokenInfo.createdAt).toLocaleString() : 'N/A'}</p>
                <p><strong>Is Expired:</strong> {tokenInfo.isExpired ? '❌ Yes' : '✅ No'}</p>
                <p><strong>Should Refresh:</strong> {tokenInfo.shouldRefresh ? '⚠️ Yes' : '✅ No'}</p>
                <p><strong>Age:</strong> {tokenInfo.createdAt ? Math.floor((Date.now() - tokenInfo.createdAt) / 1000 / 60) : 0} minutes</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={handleCheckToken}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              🔍 Check Token Info
            </button>
            
            <button
              onClick={handleManualRefresh}
              disabled={loading || !isAuthenticated}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? '⏳ Refreshing...' : '🔄 Manual Refresh'}
            </button>

            <button
              onClick={handleTestAPI}
              disabled={loading || !isAuthenticated}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? '⏳ Testing...' : '🧪 Test API'}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h2 className="font-semibold text-gray-900 mb-2">Result:</h2>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                {result}
              </pre>
            </div>
          )}

          {/* Instructions */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="font-semibold text-green-900 mb-2">How to Test:</h2>
            <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
              <li>Make sure you're logged in</li>
              <li>Click "Check Token Info" to see current token status</li>
              <li>Click "Manual Refresh" to test token refresh functionality</li>
              <li>Click "Test API" to verify the token works with API calls</li>
              <li>Check browser console for detailed logs</li>
              <li>Auto refresh happens every 55 minutes automatically</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestTokenPage;
