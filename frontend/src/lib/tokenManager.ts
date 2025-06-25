// Token management utilities
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface TokenInfo {
  token: string;
  createdAt: number;
  isExpired: boolean;
  shouldRefresh: boolean;
}

export class TokenManager {
  private static readonly TOKEN_LIFETIME = 60 * 60 * 1000; // 1 hour
  private static readonly REFRESH_THRESHOLD = 50 * 60 * 1000; // Refresh when 50 minutes old

  static getTokenInfo(): TokenInfo | null {
    const token = localStorage.getItem('token');
    const tokenTimestamp = localStorage.getItem('token_timestamp');
    
    if (!token || !tokenTimestamp) {
      return null;
    }

    const createdAt = parseInt(tokenTimestamp);
    const now = Date.now();
    const age = now - createdAt;

    return {
      token,
      createdAt,
      isExpired: age > this.TOKEN_LIFETIME,
      shouldRefresh: age > this.REFRESH_THRESHOLD
    };
  }

  static setToken(token: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('token_timestamp', Date.now().toString());
  }

  static clearToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('token_timestamp');
  }

  static async refreshTokenIfNeeded(): Promise<string | null> {
    const tokenInfo = this.getTokenInfo();
    
    if (!tokenInfo) {
      return null;
    }

    if (tokenInfo.isExpired) {
      console.log('Token expired, clearing...');
      this.clearToken();
      return null;
    }

    if (tokenInfo.shouldRefresh) {
      try {
        console.log('Token should be refreshed, attempting refresh...');
        const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
          headers: {
            'Authorization': `Bearer ${tokenInfo.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          const newToken = response.data.token;
          this.setToken(newToken);
          console.log('Token refreshed successfully');
          return newToken;
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        this.clearToken();
        return null;
      }
    }

    return tokenInfo.token;
  }

  static isTokenValid(): boolean {
    const tokenInfo = this.getTokenInfo();
    return tokenInfo !== null && !tokenInfo.isExpired;
  }
}
