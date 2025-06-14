interface ProgressProps {
  value: number;
  max: number;
}

const Progress: React.FC<ProgressProps> = ({ value, max }) => {
  const percent = Math.min((value / max) * 100, 100);

  return (
    <div className="relative w-full">
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-500 rounded-full relative"
          style={{
            width: `${percent}%`,
            transition: 'width 1s ease-out'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-shine" />
        </div>
      </div>
    </div>
  );
};

export default Progress;
