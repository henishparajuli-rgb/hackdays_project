import React from 'react';
import { Flame, Sparkles } from 'lucide-react';

interface CircularProgressProps {
  consumed: number;
  target: number;
  tdee: number;
  size?: number;
  strokeWidth?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  consumed,
  target,
  tdee,
  size = 230,
  strokeWidth = 16,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Clamped percentage for the ring visually, but display true stats
  const percentage = target > 0 ? (consumed / target) * 100 : 0;
  const clampedProgress = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  const remaining = target - consumed;
  const isOverTarget = remaining < 0;
  const isOverTDEE = consumed > tdee;

  // Color dynamics aligned with #3A2D28 palette:
  // Under target: rich espresso #3A2D28 (light) / warm ivory (dark) with amber accent
  // Between target & TDEE: warm amber
  // Over TDEE: sharp coral/rose
  let ringColor = 'text-[#3A2D28] dark:text-[#F5EFEB]';
  let badgeColor = 'bg-[#3A2D28]/10 text-[#3A2D28] dark:bg-[#F5EFEB]/15 dark:text-[#F5EFEB] border border-[#3A2D28]/20 dark:border-[#F5EFEB]/25';
  let statusText = `${Math.abs(remaining).toLocaleString()} kcal remaining`;

  if (isOverTDEE) {
    ringColor = 'text-rose-600 dark:text-rose-400';
    badgeColor = 'bg-rose-50 text-rose-900 dark:bg-rose-950/80 dark:text-rose-200 border border-rose-300 dark:border-rose-800';
    statusText = `${Math.abs(remaining).toLocaleString()} kcal over target`;
  } else if (isOverTarget) {
    ringColor = 'text-amber-600 dark:text-amber-400';
    badgeColor = 'bg-amber-50 text-amber-950 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300 dark:border-amber-800';
    statusText = `${Math.abs(remaining).toLocaleString()} kcal over target`;
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 relative">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        
        {/* Soft Ambient Glow */}
        <div 
          className="absolute inset-0 rounded-full blur-2xl opacity-15 transition-all pointer-events-none"
          style={{
            background: isOverTDEE 
              ? 'radial-gradient(circle, #e11d48 0%, transparent 70%)' 
              : 'radial-gradient(circle, #3A2D28 0%, transparent 70%)'
          }}
        />

        {/* SVG Progress Ring */}
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 origin-center transition-all duration-700"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-[#3A2D28]/12 dark:text-[#F5EFEB]/12"
          />

          {/* Target Milestone Marker Ring / Dynamic Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${ringColor} transition-all duration-1000 ease-out`}
          />
        </svg>

        {/* Center Content with High Clarity Typography */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <div className="flex items-center gap-1.5 text-xs font-extrabold tracking-wider uppercase text-[#3A2D28]/70 dark:text-[#F5EFEB]/70 mb-0.5">
            <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Calories</span>
          </div>

          <div className="flex items-baseline gap-1 font-mono tracking-tight">
            <span className="text-4xl sm:text-5xl font-extrabold text-[#3A2D28] dark:text-[#F5EFEB] tabular-nums">
              {consumed.toLocaleString()}
            </span>
          </div>

          <div className="text-xs font-mono font-medium text-[#3A2D28]/75 dark:text-[#F5EFEB]/75 mt-0.5">
            of <span className="font-bold text-[#3A2D28] dark:text-[#F5EFEB]">{target.toLocaleString()}</span> kcal
          </div>

          {/* Status Badge */}
          <div className={`mt-2.5 px-3.5 py-1 rounded-full text-xs font-bold font-mono ${badgeColor} transition-colors flex items-center gap-1.5 shadow-xs`}>
            {isOverTarget ? (
              <span className="font-extrabold text-rose-600 dark:text-rose-400">!</span>
            ) : (
              <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            )}
            <span>{statusText}</span>
          </div>
        </div>

      </div>

      {/* Progress percentage bar / indicator */}
      <div className="mt-3 flex items-center gap-2 text-xs text-[#3A2D28]/80 dark:text-[#F5EFEB]/80 font-mono font-medium">
        <span>Daily Intake</span>
        <span className="text-[#3A2D28]/40 dark:text-[#F5EFEB]/40">·</span>
        <span className="font-extrabold text-[#3A2D28] dark:text-[#F5EFEB]">
          {Math.round(percentage)}% of target
        </span>
      </div>
    </div>
  );
};
