import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, DoughnutController);

interface MacroBreakdownProps {
  proteinG: number;
  carbsG: number;
  fatG: number;
  targetCalories: number;
  isDark?: boolean;
}

export const MacroBreakdown: React.FC<MacroBreakdownProps> = ({
  proteinG,
  carbsG,
  fatG,
  targetCalories,
  isDark = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  const proteinKcal = Math.round(proteinG * 4);
  const carbsKcal = Math.round(carbsG * 4);
  const fatKcal = Math.round(fatG * 9);
  const totalMacroKcal = proteinKcal + carbsKcal + fatKcal;

  const proteinPct = totalMacroKcal > 0 ? Math.round((proteinKcal / totalMacroKcal) * 100) : 0;
  const carbsPct = totalMacroKcal > 0 ? Math.round((carbsKcal / totalMacroKcal) * 100) : 0;
  const fatPct = totalMacroKcal > 0 ? Math.round((fatKcal / totalMacroKcal) * 100) : 0;

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const dataValues = totalMacroKcal > 0 ? [proteinKcal, carbsKcal, fatKcal] : [1, 1, 1];
    const bgColors = totalMacroKcal > 0
      ? ['#2563EB', '#D97706', '#16A34A'] // Blue (Protein), Amber (Carbs), Green (Fat)
      : isDark
      ? ['#3A2D28', '#4A3B34', '#5A4A42']
      : ['#EAE4DF', '#DFD7D0', '#D3C9C1'];

    chartInstance.current = new ChartJS(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Protein', 'Carbs', 'Fat'],
        datasets: [
          {
            data: dataValues,
            backgroundColor: bgColors,
            borderColor: isDark ? '#231B18' : '#FFFFFF',
            borderWidth: 3,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: totalMacroKcal > 0,
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const val = context.raw as number;
                return ` ${label}: ${val} kcal`;
              },
            },
          },
        },
        animation: {
          duration: 600,
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [proteinKcal, carbsKcal, fatKcal, isDark, totalMacroKcal]);

  return (
    <div className="glass-panel rounded-3xl p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[#3A2D28]/12 dark:border-[#F5EFEB]/12">
        <div>
          <h3 className="text-sm font-extrabold text-[#3A2D28] dark:text-[#F5EFEB]">
            Macronutrient Breakdown
          </h3>
          <span className="text-[11px] text-[#3A2D28]/60 dark:text-[#F5EFEB]/60 font-medium">
            Daily energy composition
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-[#3A2D28] dark:text-[#F5EFEB] bg-[#3A2D28]/5 dark:bg-[#F5EFEB]/10 px-2.5 py-1 rounded-lg border border-[#3A2D28]/10 dark:border-[#F5EFEB]/10">
          {totalMacroKcal} kcal logged
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
        
        {/* Donut Chart Canvas with Center Stat */}
        <div className="sm:col-span-5 flex justify-center relative">
          <div className="w-36 h-36 relative">
            <canvas ref={canvasRef} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#3A2D28]/60 dark:text-[#F5EFEB]/60">Split</span>
              <span className="text-sm font-extrabold font-mono text-[#3A2D28] dark:text-[#F5EFEB]">
                {totalMacroKcal > 0 ? `${proteinPct}/${carbsPct}/${fatPct}` : '0%'}
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown Details List with High Clarity */}
        <div className="sm:col-span-7 flex flex-col gap-2.5">
          {/* Protein */}
          <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#1B1412] border border-[#3A2D28]/15 dark:border-[#F5EFEB]/15 shadow-xs">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#3A2D28] dark:text-[#F5EFEB]">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shadow-xs"></span>
                <span>Protein</span>
              </div>
              <span className="font-mono font-extrabold text-[#3A2D28] dark:text-[#F5EFEB]">
                {proteinG}g · {proteinKcal} kcal ({proteinPct}%)
              </span>
            </div>
            <div className="w-full bg-[#3A2D28]/10 dark:bg-[#F5EFEB]/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(proteinPct, 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#1B1412] border border-[#3A2D28]/15 dark:border-[#F5EFEB]/15 shadow-xs">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#3A2D28] dark:text-[#F5EFEB]">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block shadow-xs"></span>
                <span>Carbohydrates</span>
              </div>
              <span className="font-mono font-extrabold text-[#3A2D28] dark:text-[#F5EFEB]">
                {carbsG}g · {carbsKcal} kcal ({carbsPct}%)
              </span>
            </div>
            <div className="w-full bg-[#3A2D28]/10 dark:bg-[#F5EFEB]/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(carbsPct, 100)}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#1B1412] border border-[#3A2D28]/15 dark:border-[#F5EFEB]/15 shadow-xs">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#3A2D28] dark:text-[#F5EFEB]">
                <span className="w-2.5 h-2.5 rounded-full bg-green-600 inline-block shadow-xs"></span>
                <span>Fats</span>
              </div>
              <span className="font-mono font-extrabold text-[#3A2D28] dark:text-[#F5EFEB]">
                {fatG}g · {fatKcal} kcal ({fatPct}%)
              </span>
            </div>
            <div className="w-full bg-[#3A2D28]/10 dark:bg-[#F5EFEB]/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-green-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(fatPct, 100)}%` }}
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
