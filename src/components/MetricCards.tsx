import React from 'react';
import { Activity, Flame, HeartPulse, Scale, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { MetricSummary, UserProfile } from '../types';

interface MetricCardsProps {
  metrics: MetricSummary;
  profile: UserProfile;
  consumedToday: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  metrics,
  profile,
  consumedToday,
}) => {
  const remaining = metrics.targetCalories - consumedToday;
  const isDeficit = metrics.deficitOrSurplus > 0;
  const deficitAbs = Math.abs(metrics.deficitOrSurplus);

  // Status badge styling for Deficit/Surplus card based on user goal
  let deficitBadgeStyle = '';
  let deficitTitle = '';
  let deficitDescription = '';

  if (profile.goal === 'lose') {
    if (isDeficit) {
      deficitBadgeStyle = 'border-emerald-600/40 dark:border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-100 shadow-sm';
      deficitTitle = `Deficit: -${deficitAbs.toLocaleString()} kcal`;
      deficitDescription = `Burning ~${Math.abs(metrics.weeklyEstimatedKgChange)} kg fat / week`;
    } else {
      deficitBadgeStyle = 'border-rose-600/40 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-950/70 text-rose-950 dark:text-rose-100 shadow-sm';
      deficitTitle = `Overshoot: +${deficitAbs.toLocaleString()} kcal`;
      deficitDescription = 'Exceeding maintenance energy today';
    }
  } else if (profile.goal === 'gain') {
    if (!isDeficit) {
      deficitBadgeStyle = 'border-emerald-600/40 dark:border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-100 shadow-sm';
      deficitTitle = `Surplus: +${deficitAbs.toLocaleString()} kcal`;
      deficitDescription = `Gaining ~${Math.abs(metrics.weeklyEstimatedKgChange)} kg / week`;
    } else {
      deficitBadgeStyle = 'border-amber-600/40 dark:border-amber-500/50 bg-amber-50 dark:bg-amber-950/70 text-amber-950 dark:text-amber-100 shadow-sm';
      deficitTitle = `Under by ${deficitAbs.toLocaleString()} kcal`;
      deficitDescription = 'Eat more protein & carbs to hit surplus';
    }
  } else {
    // Maintain goal
    deficitBadgeStyle = 'border-[#3A2D28]/25 dark:border-[#F5EFEB]/25 bg-white dark:bg-[#231B18] text-[#3A2D28] dark:text-[#F5EFEB] shadow-sm';
    deficitTitle = isDeficit ? `Balance: -${deficitAbs} kcal` : `Balance: +${deficitAbs} kcal`;
    deficitDescription = 'Within maintenance range';
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 w-full">
      
      {/* 1. BMR Card */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between transition-all hover:border-[#3A2D28]/40 hover:shadow-md">
        <div className="flex items-center justify-between text-[#3A2D28]/80 dark:text-[#F5EFEB]/80">
          <span className="text-xs font-extrabold uppercase tracking-wider">BMR</span>
          <HeartPulse className="w-4 h-4 text-rose-600 dark:text-rose-400" />
        </div>
        <div className="my-2">
          <div className="text-2xl font-extrabold font-mono text-[#3A2D28] dark:text-[#F5EFEB] tabular-nums tracking-tight">
            {metrics.bmr.toLocaleString()}
          </div>
          <div className="text-[11px] font-semibold text-[#3A2D28]/75 dark:text-[#F5EFEB]/75">
            kcal at resting state
          </div>
        </div>
        <div className="text-[10px] text-[#3A2D28]/60 dark:text-[#F5EFEB]/60 font-mono">
          Mifflin-St Jeor formula
        </div>
      </div>

      {/* 2. TDEE Card */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between transition-all hover:border-[#3A2D28]/40 hover:shadow-md">
        <div className="flex items-center justify-between text-[#3A2D28]/80 dark:text-[#F5EFEB]/80">
          <span className="text-xs font-extrabold uppercase tracking-wider">TDEE</span>
          <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="my-2">
          <div className="text-2xl font-extrabold font-mono text-[#3A2D28] dark:text-[#F5EFEB] tabular-nums tracking-tight">
            {metrics.tdee.toLocaleString()}
          </div>
          <div className="text-[11px] font-semibold text-[#3A2D28]/75 dark:text-[#F5EFEB]/75">
            maintenance energy
          </div>
        </div>
        <div className="text-[10px] text-[#3A2D28]/60 dark:text-[#F5EFEB]/60 capitalize font-mono">
          {profile.activityLevel.replace('_', ' ')}
        </div>
      </div>

      {/* 3. Consumed Today */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between transition-all hover:border-[#3A2D28]/40 hover:shadow-md">
        <div className="flex items-center justify-between text-[#3A2D28]/80 dark:text-[#F5EFEB]/80">
          <span className="text-xs font-extrabold uppercase tracking-wider">Consumed</span>
          <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="my-2">
          <div className="text-2xl font-extrabold font-mono text-[#3A2D28] dark:text-[#F5EFEB] tabular-nums tracking-tight">
            {consumedToday.toLocaleString()}
          </div>
          <div className="text-[11px] font-semibold text-[#3A2D28]/75 dark:text-[#F5EFEB]/75">
            kcal eaten today
          </div>
        </div>
        <div className="text-[10px] text-[#3A2D28]/60 dark:text-[#F5EFEB]/60 font-mono">
          Target: {metrics.targetCalories} kcal
        </div>
      </div>

      {/* 4. Remaining */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between transition-all hover:border-[#3A2D28]/40 hover:shadow-md">
        <div className="flex items-center justify-between text-[#3A2D28]/80 dark:text-[#F5EFEB]/80">
          <span className="text-xs font-extrabold uppercase tracking-wider">Remaining</span>
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="my-2">
          <div className={`text-2xl font-extrabold font-mono tabular-nums tracking-tight ${
            remaining >= 0 ? 'text-[#3A2D28] dark:text-[#F5EFEB]' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {Math.abs(remaining).toLocaleString()}
          </div>
          <div className="text-[11px] font-semibold text-[#3A2D28]/75 dark:text-[#F5EFEB]/75">
            {remaining >= 0 ? 'kcal left in budget' : 'kcal above target'}
          </div>
        </div>
        <div className={`text-[10px] font-mono font-bold ${remaining >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {remaining >= 0 ? 'On pace' : 'Over daily target'}
        </div>
      </div>

      {/* 5. Deficit / Surplus Card (Dynamic Highlighting) */}
      <div className={`rounded-2xl p-4 border flex flex-col justify-between transition-all hover:shadow-md ${deficitBadgeStyle}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider">
            {isDeficit ? 'Deficit' : 'Surplus'}
          </span>
          {isDeficit ? (
            <TrendingDown className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
          ) : (
            <TrendingUp className="w-4 h-4 text-rose-700 dark:text-rose-300" />
          )}
        </div>
        <div className="my-2">
          <div className="text-xl font-extrabold font-mono tabular-nums">
            {deficitTitle}
          </div>
          <div className="text-[11px] font-semibold mt-0.5 line-clamp-1 opacity-90">
            {deficitDescription}
          </div>
        </div>
        <div className="text-[10px] opacity-80 font-mono font-medium">
          vs TDEE ({metrics.tdee} kcal)
        </div>
      </div>

      {/* 6. BMI & Category */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between transition-all hover:border-[#3A2D28]/40 hover:shadow-md">
        <div className="flex items-center justify-between text-[#3A2D28]/80 dark:text-[#F5EFEB]/80">
          <span className="text-xs font-extrabold uppercase tracking-wider">BMI</span>
          <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="my-2">
          <div className="text-2xl font-extrabold font-mono text-[#3A2D28] dark:text-[#F5EFEB] tabular-nums tracking-tight">
            {metrics.bmi}
          </div>
          <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            {metrics.bmiCategory}
          </div>
        </div>
        <div className="text-[10px] text-[#3A2D28]/60 dark:text-[#F5EFEB]/60 font-mono">
          {profile.weightKg} kg · {profile.heightFt}'{profile.heightIn}" ({metrics.heightCm} cm)
        </div>
      </div>

    </div>
  );
};
