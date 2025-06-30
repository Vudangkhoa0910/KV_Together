import React from 'react';

interface CampaignProgressProps {
  current: number;
  target: number;
  className?: string;
}

const CampaignProgress: React.FC<CampaignProgressProps> = ({
  current,
  target,
  className = ''
}) => {
  const percentage = Math.min(100, Math.max(0, (current / target) * 100));
  const isCompleted = current >= target;
  const remainingAmount = Math.max(0, target - current);

  const formatCurrency = (amount: number) => {
    // Handle NaN, Infinity, and null/undefined values
    const safeAmount = isNaN(amount) || !isFinite(amount) || amount == null ? 0 : amount;
    return new Intl.NumberFormat('vi-VN').format(safeAmount) + 'đ';
  };

  // Luôn hiển thị progress bar, chỉ ẩn khi dữ liệu không hợp lệ
  const shouldShowProgressBar = !isNaN(percentage) && target > 0 && current >= 0;

  return (
    <div className={`campaign-progress ${className}`}>
      {/* Progress Info */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">
            {formatCurrency(current)}
          </span>
          <span className="text-xs text-gray-500">đã quyên góp</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className={`text-sm font-bold ${isCompleted ? 'text-green-600' : 'text-orange-600'}`}>
            {percentage.toFixed(2)}%
          </span>
          {isCompleted && (
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      {/* Progress Bar - luôn hiển thị khi có dữ liệu hợp lệ */}
      {shouldShowProgressBar && (
        <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${
              isCompleted 
                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                : 'bg-gradient-to-r from-orange-500 to-orange-600'
            }`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-shimmer"></div>
          </div>
          
          {/* Progress indicator - chỉ hiển thị text khi có đủ không gian */}
          {percentage > 10 && (
            <div 
              className="absolute top-0 h-full flex items-center justify-center text-xs font-medium text-white"
              style={{ left: '10px', right: '10px' }}
            >
              {percentage >= 20 && (
                <span className="drop-shadow-sm">
                  {percentage.toFixed(2)}%
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Target and Remaining Info */}
      <div className="flex justify-between items-center text-xs text-gray-600">
        <div>
          <span className="font-medium">Mục tiêu: </span>
          <span>{formatCurrency(target)}</span>
        </div>
        {!isCompleted && (
          <div className="text-right">
            <span className="font-medium text-orange-600">Còn thiếu: </span>
            <span className="text-orange-700 font-semibold">
              {formatCurrency(remainingAmount)}
            </span>
          </div>
        )}
        {isCompleted && (
          <div className="text-right">
            <span className="font-medium text-green-600">✓ Hoàn thành</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignProgress;
