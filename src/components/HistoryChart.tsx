import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineElement,
  PointElement,
  LineController
} from 'chart.js';
import { TrendingDown, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';
import { LoggedMeal, UserProfile } from '../types';
import { formatDateKey } from '../utils/storage';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController
);

interface HistoryChartProps {
  meals: LoggedMeal[];
  targetCalories: number;
  tdee: number;
  profile: UserProfile;
  isDark?: boolean;
}

export const HistoryChart: React.FC<HistoryChartProps> = ({
  meals,
  targetCalories,
  tdee,
  profile,
  isDark = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  // Compute the last 7 days (including today)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateKey = formatDateKey(d);
    const dayLabel = d.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' });
    const shortDay = d.toLocaleDateString([], { weekday: 'short' });

    // Aggregate meals for this day
    const dayMeals = meals.filter(m => m.dateKey === dateKey);
    const consumed = dayMeals.reduce((acc, m) => acc + m.totalCalories, 0);
    const deficit = tdee - consumed;

    return {
      dateKey,
      dayLabel,
      shortDay,
      consumed,
      deficit,
      mealsCount: dayMeals.length,
      isToday: i === 6,
    };
  });

  const totalWeeklyConsumed = last7Days.reduce((acc, d) => acc + d.consumed, 0);
  const activeDaysCount = last7Days.filter(d => d.consumed > 0).length || 1;
  const avgDailyIntake = Math.round(totalWeeklyConsumed / activeDaysCount);
  const avgDeficit = Math.round(tdee - avgDailyIntake);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const labels = last7Days.map(d => (d.isToday ? `${d.shortDay} (Today)` : d.shortDay));
    const dataConsumed = last7Days.map(d => d.consumed);
    const dataTarget = last7Days.map(() => targetCalories);

    // Color code bars: espresso/ivory if under target, red if over
    const barColors = last7Days.map(d => {
      if (d.consumed === 0) {
        return isDark ? 'rgba(245, 239, 235, 0.15)' : 'rgba(58, 45, 40, 0.14)';
      }
      return d.consumed <= targetCalories ? (isDark ? '#F5EFEB' : '#3A2D28') : '#E11D48';
    });

    chartInstance.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            type: 'line',
            label: 'Daily Target',
            data: dataTarget,
            borderColor: '#D97706', // Warm amber target line
            borderWidth: 2.5,
            borderDash: [5, 4],
            pointRadius: 0,
            fill: false,
            order: 1,
          },
          {
            type: 'bar',
            label: 'Calories Consumed',
            data: dataConsumed,
            backgroundColor: barColors,
            borderRadius: 8,
            borderSkipped: false,
            order: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: isDark ? 'rgba(245, 239, 235, 0.85)' : 'rgba(58, 45, 40, 0.85)',
              font: {
                family: 'Plus Jakarta Sans',
                size: 11,
                weight: 'bold',
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: isDark ? 'rgba(245, 239, 235, 0.10)' : 'rgba(58, 45, 40, 0.10)',
            },
            ticks: {
              color: isDark ? 'rgba(245, 239, 235, 0.85)' : 'rgba(58, 45, 40, 0.85)',
              font: {
                family: 'JetBrains Mono',
                size: 10,
                weight: 'bold',
              },
              callback: (val) => `${val} kcal`,
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              color: isDark ? '#F5EFEB' : '#3A2D28',
              boxWidth: 12,
              boxHeight: 12,
              font: {
                size: 11,
                family: 'Plus Jakarta Sans',
                weight: 'bold',
              },
            },
          },
          tooltip: {
            callbacks: {
              afterBody: (context) => {
                const idx = context[0].dataIndex;
                const item = last7Days[idx];
                const diff = item.consumed - targetCalories;
                return diff > 0
                  ? `Over Target by: +${diff} kcal`
                  : `Deficit: ${Math.abs(item.deficit)} kcal (vs TDEE)`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [meals, targetCalories, tdee, isDark]);

  return (
    <div className="space-y-6">
      
      {/* 7-Day Trend Chart Card */}
      <div className="glass-panel rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-3.5 border-b border-[#3A2D28]/12 dark:border-[#F5EFEB]/12">
          <div>
            <h2 className="text-base font-extrabold text-[#3A2D28] dark:text-[#F5EFEB] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>7-Day Calorie Intake vs Target</span>
            </h2>
            <p className="text-xs text-[#3A2D28]/70 dark:text-[#F5EFEB]/70 mt-0.5">
              Track consistency and deficit adherence across the past week
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#1B1412] border border-[#3A2D28]/15 dark:border-[#F5EFEB]/15 text-[#3A2D28] dark:text-[#F5EFEB] shadow-xs">
              Avg Intake: <span className="font-extrabold">{avgDailyIntake}</span> kcal
            </div>
            <div className={`px-3.5 py-1.5 rounded-xl font-bold border shadow-xs ${
              avgDeficit >= 0
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-100 border-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/70 text-rose-950 dark:text-rose-100 border-rose-300 dark:border-rose-800'
            }`}>
              {avgDeficit >= 0 ? `Avg Deficit: -${avgDeficit} kcal` : `Avg Surplus: +${Math.abs(avgDeficit)} kcal`}
            </div>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="h-64 sm:h-72 w-full">
          <canvas ref={canvasRef} />
        </div>
      </div>

      {/* 7-Day History Day-by-Day Cards */}
      <div className="glass-panel rounded-3xl p-6">
        <h3 className="text-sm font-extrabold text-[#3A2D28] dark:text-[#F5EFEB] mb-4">
          Daily Log Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {last7Days.map((day) => {
            const isDeficit = day.deficit > 0;
            const metTarget = day.consumed > 0 && day.consumed <= targetCalories;

            return (
              <div
                key={day.dateKey}
                className={`p-3.5 rounded-2xl border transition-all ${
                  day.isToday
                    ? 'border-[#3A2D28] dark:border-[#F5EFEB] bg-[#FAF8F5] dark:bg-[#1E1714] shadow-md ring-1 ring-[#3A2D28]/30 dark:ring-[#F5EFEB]/30'
                    : 'border-[#3A2D28]/15 dark:border-[#F5EFEB]/15 bg-white dark:bg-[#1B1412]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className={day.isToday ? 'text-[#3A2D28] dark:text-[#F5EFEB] font-extrabold' : 'text-[#3A2D28]/80 dark:text-[#F5EFEB]/80'}>
                    {day.dayLabel}
                  </span>
                  {metTarget && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>

                <div className="text-lg font-extrabold font-mono text-[#3A2D28] dark:text-[#F5EFEB] tabular-nums tracking-tight">
                  {day.consumed > 0 ? day.consumed.toLocaleString() : '—'}
                  <span className="text-[10px] font-normal text-[#3A2D28]/60 dark:text-[#F5EFEB]/60 ml-1">kcal</span>
                </div>

                <div className="mt-2 pt-2 border-t border-[#3A2D28]/10 dark:border-[#F5EFEB]/10 text-[11px] font-mono flex items-center justify-between">
                  <span className="text-[#3A2D28]/60 dark:text-[#F5EFEB]/60">{day.mealsCount} meals</span>
                  {day.consumed > 0 && (
                    <span className={isDeficit ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' : 'text-rose-600 dark:text-rose-400 font-extrabold'}>
                      {isDeficit ? `-${day.deficit}` : `+${Math.abs(day.deficit)}`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
