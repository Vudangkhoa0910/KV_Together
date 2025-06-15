export function formatCurrency(amount: number): string {
  // Handle edge cases
  if (isNaN(amount) || amount < 0) return '0 VNĐ';
  
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
}

export function formatCurrencyShort(amount: number): string {
  // Handle edge cases
  if (isNaN(amount) || amount < 0) return '0đ';
  
  // For very large amounts, use abbreviated format
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B đ`;
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M đ`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K đ`;
  }
  
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

export function formatCurrencyDetailed(amount: number): string {
  if (isNaN(amount) || amount < 0) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

export function formatTimeLeft(endDate: string): string {
  const end = new Date(endDate);
  const now = new Date();
  
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'Đã kết thúc';
  }
  
  if (diffDays === 0) {
    return 'Còn hôm nay';
  }
  
  if (diffDays < 30) {
    return `Còn ${diffDays} ngày`;
  }
  
  const months = Math.floor(diffDays / 30);
  const remainingDays = diffDays % 30;
  
  if (remainingDays === 0) {
    return `Còn ${months} tháng`;
  }
  
  return `Còn ${months} tháng ${remainingDays} ngày`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatProgressPercentage(current: number, target: number): string {
  return Math.min(Math.round((current / target) * 100), 100) + '%';
}

export function getCampaignStatus(progress: number, daysLeft: number): {
  status: string;
  color: string;
  urgency: 'low' | 'medium' | 'high';
} {
  if (progress >= 100) {
    return { status: 'Đã hoàn thành', color: 'text-green-600', urgency: 'low' };
  } else if (daysLeft < 0) {
    return { status: 'Đã hết hạn', color: 'text-gray-500', urgency: 'low' };
  } else if (daysLeft <= 3) {
    return { status: 'Sắp hết hạn', color: 'text-red-600', urgency: 'high' };
  } else if (daysLeft <= 7) {
    return { status: 'Cần hỗ trợ gấp', color: 'text-orange-600', urgency: 'high' };
  } else if (progress >= 80) {
    return { status: 'Gần hoàn thành', color: 'text-blue-600', urgency: 'medium' };
  } else if (progress >= 50) {
    return { status: 'Đang phát triển tốt', color: 'text-green-600', urgency: 'medium' };
  } else if (progress >= 20) {
    return { status: 'Cần thêm hỗ trợ', color: 'text-yellow-600', urgency: 'medium' };
  } else {
    return { status: 'Mới bắt đầu', color: 'text-blue-600', urgency: 'low' };
  }
}