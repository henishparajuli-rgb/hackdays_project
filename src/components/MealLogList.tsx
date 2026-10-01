import React, { useState } from 'react';
import { Clock, Trash2, Edit3, Plus, Download, RotateCcw, Utensils, Coffee, Sun, Moon, Apple } from 'lucide-react';
import { LoggedMeal, MealType } from '../types';

interface MealLogListProps {
  meals: LoggedMeal[];
  onDeleteMeal: (mealId: string) => void;
  onEditMeal: (meal: LoggedMeal) => void;
  onResetDay: () => void;
  onExportCSV: () => void;
  onOpenSnap: () => void;
}

export const MealLogList: React.FC<MealLogListProps> = ({
  meals,
  onDeleteMeal,
  onEditMeal,
  onResetDay,
  onExportCSV,
  onOpenSnap,
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const getMealIcon = (type: MealType) => {
    switch (type) {
      case 'breakfast':
        return <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'lunch':
        return <Sun className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
      case 'dinner':
        return <Moon className="w-4 h-4 text-amber-700 dark:text-amber-300" />;
      case 'snack':
        return <Apple className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  const formatMealTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4">
      
      {/* List Header & Top Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[#3A2D28]/12 dark:border-[#F5EFEB]/12">
        <div>
          <h3 className="text-sm font-extrabold text-[#3A2D28] dark:text-[#F5EFEB] flex items-center gap-2">
            <Utensils className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>Today's Meal Log</span>
            <span className="text-xs font-mono font-bold text-[#3A2D28]/70 dark:text-[#F5EFEB]/70">
              ({meals.length} {meals.length === 1 ? 'entry' : 'entries'})
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {meals.length > 0 && (
            <>
              {/* Reset Day Trigger */}
              {showResetConfirm ? (
                <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/80 p-1 rounded-xl text-xs border border-rose-300 dark:border-rose-800">
                  <span className="text-rose-900 dark:text-rose-200 px-2 font-bold">Clear today?</span>
                  <button
                    onClick={() => {
                      onResetDay();
                      setShowResetConfirm(false);
                    }}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2 py-1 text-[#3A2D28]/70 dark:text-[#F5EFEB]/70 hover:text-[#3A2D28] cursor-pointer"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-3 py-1.5 text-xs font-bold text-[#3A2D28]/75 hover:text-rose-600 dark:text-[#F5EFEB]/75 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-[#3A2D28]/15 dark:border-[#F5EFEB]/15 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Reset today's meals"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset Day</span>
                </button>
              )}

              {/* Export CSV Trigger */}
              <button
                onClick={onExportCSV}
                className="px-3.5 py-1.5 text-xs font-bold text-[#3A2D28] dark:text-[#F5EFEB] bg-white dark:bg-[#231B18] border border-[#3A2D28]/20 dark:border-[#F5EFEB]/20 rounded-xl hover:bg-[#3A2D28]/5 dark:hover:bg-[#F5EFEB]/5 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#3A2D28]/70 dark:text-[#F5EFEB]/70" />
                <span>Export CSV</span>
              </button>
            </>
          )}

          {/* Quick Add CTA */}
          <button
            onClick={onOpenSnap}
            className="px-3.5 py-1.5 text-xs font-bold text-white dark:text-[#3A2D28] bg-[#3A2D28] hover:bg-[#261D19] dark:bg-[#F5EFEB] dark:hover:bg-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Meal</span>
          </button>
        </div>
      </div>

      {/* Meals Feed */}
      {meals.length === 0 ? (
        <div className="py-12 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#3A2D28]/5 dark:bg-[#F5EFEB]/5 border border-[#3A2D28]/15 dark:border-[#F5EFEB]/15 text-[#3A2D28]/70 dark:text-[#F5EFEB]/70 flex items-center justify-center mb-3">
            <Utensils className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-extrabold text-[#3A2D28] dark:text-[#F5EFEB]">
            No meals logged today yet
          </h4>
          <p className="text-xs text-[#3A2D28]/70 dark:text-[#F5EFEB]/70 mt-1 max-w-xs mb-4">
            Snap a photo of your breakfast, lunch, or snack to calculate calories automatically.
          </p>
          <button
            onClick={onOpenSnap}
            className="px-5 py-2.5 text-xs font-bold text-white dark:text-[#3A2D28] bg-[#3A2D28] hover:bg-[#261D19] dark:bg-[#F5EFEB] dark:hover:bg-white rounded-xl shadow-md shadow-[#3A2D28]/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Log Your First Meal</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {meals.map((meal) => (
            <div
              key={meal.id}
              className="p-3.5 sm:p-4 rounded-2xl border border-[#3A2D28]/15 dark:border-[#F5EFEB]/15 bg-[#FAF8F5] dark:bg-[#1B1412] hover:border-[#3A2D28]/35 dark:hover:border-[#F5EFEB]/35 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
            >
              {/* Left Slot: Thumbnail & Details */}
              <div className="flex items-start gap-3.5 min-w-0">
                {/* Photo Thumbnail or Fallback */}
                {meal.photoUrl ? (
                  <img
                    src={meal.photoUrl}
                    alt={meal.mealType}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#3A2D28]/20 dark:border-[#F5EFEB]/20 shadow-xs"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white dark:bg-[#231B18] text-[#3A2D28] dark:text-[#F5EFEB] flex items-center justify-center shrink-0 border border-[#3A2D28]/15 dark:border-[#F5EFEB]/15">
                    {getMealIcon(meal.mealType)}
                  </div>
                )}

                {/* Text Description */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#3A2D28] dark:text-[#F5EFEB] capitalize flex items-center gap-1.5">
                      {getMealIcon(meal.mealType)}
                      {meal.mealType}
                    </span>
                    <span className="text-[11px] font-mono font-medium text-[#3A2D28]/60 dark:text-[#F5EFEB]/60 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatMealTime(meal.timestamp)}
                    </span>
                  </div>

                  {/* List of items */}
                  <div className="text-xs font-semibold text-[#3A2D28] dark:text-[#F5EFEB] mt-1 line-clamp-1">
                    {meal.items.map((it, idx) => (
                      <span key={idx}>
                        {it.name} <span className="text-[#3A2D28]/60 dark:text-[#F5EFEB]/60 font-mono font-normal">({it.weight_g}g)</span>
                        {idx < meal.items.length - 1 ? ' · ' : ''}
                      </span>
                    ))}
                  </div>

                  {/* Macros Pills with High Contrast */}
                  <div className="flex items-center gap-2.5 mt-1.5 text-[11px] font-mono text-[#3A2D28]/80 dark:text-[#F5EFEB]/80">
                    <span className="text-blue-700 dark:text-blue-300 font-bold">P: {meal.totalProtein}g</span>
                    <span>·</span>
                    <span className="text-amber-700 dark:text-amber-300 font-bold">C: {meal.totalCarbs}g</span>
                    <span>·</span>
                    <span className="text-green-700 dark:text-green-400 font-bold">F: {meal.totalFat}g</span>
                  </div>
                </div>
              </div>

              {/* Right Slot: Calories and Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#3A2D28]/10 dark:border-[#F5EFEB]/10">
                <div className="text-right">
                  <div className="text-xl font-extrabold font-mono text-[#3A2D28] dark:text-[#F5EFEB] tabular-nums tracking-tight">
                    {meal.totalCalories.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-mono font-bold text-[#3A2D28]/60 dark:text-[#F5EFEB]/60">kcal</div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditMeal(meal)}
                    className="p-1.5 rounded-lg text-[#3A2D28]/70 hover:text-[#3A2D28] dark:text-[#F5EFEB]/70 dark:hover:text-white hover:bg-[#3A2D28]/10 dark:hover:bg-[#F5EFEB]/10 transition-colors cursor-pointer"
                    title="Edit meal items"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {deleteConfirmId === meal.id ? (
                    <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950 p-1 rounded-lg border border-rose-200 dark:border-rose-800">
                      <button
                        onClick={() => {
                          onDeleteMeal(meal.id);
                          setDeleteConfirmId(null);
                        }}
                        className="px-2 py-0.5 bg-rose-600 text-white text-[11px] font-bold rounded cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-1.5 py-0.5 text-[#3A2D28]/70 dark:text-[#F5EFEB]/70 text-[11px] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(meal.id)}
                      className="p-1.5 rounded-lg text-[#3A2D28]/70 hover:text-rose-600 dark:text-[#F5EFEB]/70 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete meal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
