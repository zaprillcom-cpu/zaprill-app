"use client";

interface MatchRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export default function MatchRing({
  percentage,
  size = 64,
  strokeWidth = 4,
}: MatchRingProps) {
  // Increase radius reduction to create a visible gutter between text and ring
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  // Dynamic color based on match percentage
  const getColorClass = (p: number) => {
    if (p >= 90) return "text-emerald-500";
    if (p >= 75) return "text-blue-500";
    if (p >= 50) return "text-amber-500";
    return "text-destructive";
  };

  const colorClass = getColorClass(percentage);

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${colorClass}`}
      style={{ width: size, height: size }}
    >
      <svg
        className="w-full h-full -rotate-90 transform"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.1}
          strokeWidth={strokeWidth}
          className="transition-colors duration-500"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            animation: "progress-fill 1s ease-out forwards",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span
          className="font-black leading-none tracking-tighter"
          style={{ fontSize: size * 0.26 }} // Reduced from 0.32 to create space
        >
          {percentage}%
        </span>
        {size >= 64 && (
          <span className="text-[10px] font-black uppercase tracking-widest opacity-70 mt-0.5">
            Match
          </span>
        )}
      </div>
    </div>
  );
}
