'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, MonthlyStats, MonthlyStatsSummary } from '@/services/api';
import { withCache } from '@/utils/cache';

interface UseMonthlyStatsReturn {
  data: MonthlyStats[];
  summary: MonthlyStatsSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const CACHE_KEY = 'monthly-stats';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useMonthlyStats(): UseMonthlyStatsReturn {
  const [data, setData] = useState<MonthlyStats[]>([]);
  const [summary, setSummary] = useState<MonthlyStatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await withCache(
        CACHE_KEY,
        () => api.getMonthlyStats(),
        CACHE_TTL
      );
      
      // Convert amount từ string sang number và format dữ liệu
      const monthlyStats: MonthlyStats[] = response.data.map(item => ({
        ...item,
        month: item.month_vi || item.month, // Sử dụng month_vi nếu có
        amount: typeof item.amount === 'string' ? parseInt(item.amount) : item.amount
      }));
      
      setData(monthlyStats);
      setSummary(response.summary); // Set summary data từ API
    } catch (err) {
      console.error('Error fetching monthly stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch monthly stats');
      // Don't use fallback data - show empty state instead
      setData([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    // Clear cache and refetch
    const { dataCache } = await import('@/utils/cache');
    dataCache.delete(CACHE_KEY);
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    summary,
    loading,
    error,
    refetch
  };
}
