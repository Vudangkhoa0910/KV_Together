import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  showPercentage?: boolean;
  height?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  max, 
  showPercentage = false,
  height = 'md',
  variant = 'default',
  label
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  // Height configurations
  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  // Color configurations
  const colorClasses = {
    default: 'bg-gradient-to-r from-orange-500 to-orange-600',
    success: 'bg-gradient-to-r from-green-500 to-green-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    danger: 'bg-gradient-to-r from-red-500 to-red-600'
  };

  // Determine minimum width for visibility - always show some progress if value > 0
  const getMinimumWidth = () => {
    if (percentage === 0) return '0%';
    if (percentage < 2) return '8px'; // Minimum 8px width for very small percentages
    return `${percentage}%`;
  };

  // Determine if we should show the bar at all
  const showBar = value > 0;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-500">{percentage.toFixed(2)}%</span>
          )}
        </div>
      )}
      
      <div className={`bg-gray-200 rounded-full overflow-hidden ${heightClasses[height]} relative`}>
        {showBar && (
          <div
            className={`${heightClasses[height]} ${colorClasses[variant]} transition-all duration-700 ease-out relative`}
            style={{
              width: getMinimumWidth(),
              maxWidth: '100%'
            }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-40 animate-pulse" />
            
            {/* Subtle glow effect for non-zero progress */}
            {percentage > 0 && (
              <div className="absolute inset-0 shadow-sm" style={{
                boxShadow: `0 0 4px ${variant === 'default' ? 'rgba(249, 115, 22, 0.4)' : 
                  variant === 'success' ? 'rgba(34, 197, 94, 0.4)' :
                  variant === 'warning' ? 'rgba(234, 179, 8, 0.4)' :
                  'rgba(239, 68, 68, 0.4)'}`
              }} />
            )}
          </div>
        )}
        
        {/* Progress text overlay for larger bars */}
        {height === 'lg' && percentage > 20 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-white drop-shadow-sm">
              {percentage.toFixed(0)}%
            </span>
          </div>
        )}
      </div>
      
      {/* Alternative percentage display below bar */}
      {showPercentage && !label && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">
            {value.toLocaleString('vi-VN')}
          </span>
          <span className="text-xs text-gray-500">
            {max.toLocaleString('vi-VN')} ({percentage.toFixed(2)}%)
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
