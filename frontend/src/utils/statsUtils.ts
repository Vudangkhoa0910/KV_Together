// Statistics formatting utilities
export const formatStatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

export const formatGrowthRate = (current: number, previous: number): string => {
  if (previous === 0) return '+100%';
  const growth = ((current - previous) / previous) * 100;
  const sign = growth >= 0 ? '+' : '';
  return `${sign}${growth.toFixed(1)}%`;
};

export const formatDonationFrequency = (donations: number, donors: number): number => {
  if (donors === 0) return 0;
  return Math.round((donations / donors) * 10) / 10; // Round to 1 decimal
};

export const getProgressColor = (percentage: number): string => {
  if (percentage >= 80) return 'text-green-600';
  if (percentage >= 60) return 'text-yellow-600';
  if (percentage >= 40) return 'text-orange-600';
  return 'text-red-600';
};

export const getProgressBarColor = (percentage: number): string => {
  if (percentage >= 80) return 'from-green-400 via-green-500 to-green-600';
  if (percentage >= 60) return 'from-yellow-400 via-yellow-500 to-orange-500';
  if (percentage >= 40) return 'from-orange-400 via-orange-500 to-red-500';
  return 'from-red-400 via-red-500 to-pink-500';
};

export const getTrendIcon = (current: number, previous: number): '📈' | '📉' | '➡️' => {
  if (current > previous) return '📈';
  if (current < previous) return '📉';
  return '➡️';
};

export const formatCompactNumber = (num: number): string => {
  const formatters = [
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'K' }
  ];

  for (const { value, suffix } of formatters) {
    if (num >= value) {
      return `${(num / value).toFixed(1)}${suffix}`;
    }
  }

  return num.toString();
};

export const calculateMonthlyGrowth = (monthlyData: Array<{ amount: number }>): number[] => {
  if (monthlyData.length < 2) return [];
  
  return monthlyData.slice(1).map((current, index) => {
    const previous = monthlyData[index];
    if (previous.amount === 0) return 100;
    return ((current.amount - previous.amount) / previous.amount) * 100;
  });
};

export const getTopPerformerBadge = (rank: number): string => {
  switch (rank) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return '🏅';
  }
};

export const formatDuration = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} ngày`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} tháng`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} năm`;
  }
};
