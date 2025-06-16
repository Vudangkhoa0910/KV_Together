interface ProgressProps {
  value: number;
  max: number;
}

const Progress: React.FC<ProgressProps> = ({ value, max }) => {
  const percent = Math.min((value / max) * 100, 100);
  // For any percent > 0, always show a minimum width visually (fixes 50% bug)
  let minWidth: string | undefined = undefined;
  if (percent > 0 && percent < 100) {
    minWidth = '12px'; // slightly larger for better visibility
  }
  // Only round right side if 100%, otherwise only left
  const borderRadius = percent === 100 ? '9999px' : '9999px 0 0 9999px';
  const showBar = percent > 0;

  return (
    <div className="relative w-full">
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        {showBar && (
          <div
            className="h-full bg-orange-500 relative"
            style={{
              width: `${percent}%`,
              minWidth,
              maxWidth: '100%',
              borderRadius,
              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-shine" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;
