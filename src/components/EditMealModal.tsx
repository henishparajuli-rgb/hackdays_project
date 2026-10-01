import React, { useState } from 'react';
import { X, Check, Trash2, Plus, Scale } from 'lucide-react';
import { FoodItemDetection, LoggedMeal, MealType } from '../types';
import { calculateItemNutrients } from '../utils/calculations';

interface EditMealModalProps {
  meal: LoggedMeal | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMeal: LoggedMeal) => void;
}

export const EditMealModal: React.FC<EditMealModalProps> = ({
  meal,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !meal) return null;

  const [mealType, setMealType] = useState<MealType>(meal.mealType);
  const [items, setItems] = useState<FoodItemDetection[]>(meal.items || []);
  const [notes, setNotes] = useState<string>(meal.notes || '');

  const handleItemChange = (index: number, field: string, value: any) => {
    setItems(prev => {
      const next = [...prev];
      const item = { ...next[index], [field]: value };

      if (['weight_g', 'calories_per_100g', 'protein_g_per_100g', 'carbs_g_per_100g', 'fat_g_per_100g'].includes(field)) {
        const weight = Number(item.weight_g) || 0;
        const cal100 = Number(item.calories_per_100g) || 0;
        const p100 = Number(item.protein_g_per_100g) || 0;
        const c100 = Number(item.carbs_g_per_100g) || 0;
        const f100 = Number(item.fat_g_per_100g) || 0;

        const calculated = calculateItemNutrients(cal100, p100, c100, f100, weight);
        item.totalCalories = calculated.totalCalories;
        item.totalProtein = calculated.totalProtein;
        item.totalCarbs = calculated.totalCarbs;
        item.totalFat = calculated.totalFat;
      }

      next[index] = item;
      return next;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    const newItem: FoodItemDetection = {
      id: `item-${Date.now()}`,
      name: 'New Food Item',
      calories_per_100g: 100,
      protein_g_per_100g: 5,
      carbs_g_per_100g: 15,
      fat_g_per_100g: 2,
      weight_g: 100,
      totalCalories: 100,
      totalProtein: 5,
      totalCarbs: 15,
      totalFat: 2,
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleSave = () => {
    const totalCalories = items.reduce((sum, it) => sum + it.totalCalories, 0);
    const totalProtein = Math.round(items.reduce((sum, it) => sum + it.totalProtein, 0) * 10) / 10;
    const totalCarbs = Math.round(items.reduce((sum, it) => sum + it.totalCarbs, 0) * 10) / 10;
    const totalFat = Math.round(items.reduce((sum, it) => sum + it.totalFat, 0) * 10) / 10;

    const updated: LoggedMeal = {
      ...meal,
      mealType,
      items,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      notes: notes || undefined,
    };

    onSave(updated);
    onClose();
  };

  const totalMealCalories = items.reduce((sum, it) => sum + it.totalCalories, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="glass-panel w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-[#3A2D28]/20 dark:border-[#F5EFEB]/20 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3A2D28]/12 dark:border-[#F5EFEB]/12 bg-white dark:bg-[#1E1714]">
          <div>
            <h2 className="text-base font-extrabold text-[#3A2D28] dark:text-[#F5EFEB]">
              Edit Logged Meal
            </h2>
            <p className="text-xs text-[#3A2D28]/70 dark:text-[#F5EFEB]/70 mt-0.5">
              Adjust portions and component nutrients
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#3A2D28]/70 hover:text-[#3A2D28] dark:text-[#F5EFEB]/70 dark:hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Meal Type */}
          <div>
            <label className="block text-xs font-bold text-[#3A2D28] dark:text-[#F5EFEB] mb-1.5">
              Meal Type
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-[#1B1412] border border-[#3A2D28]/15 dark:border-[#F5EFEB]/15 rounded-xl">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMealType(t)}
                  className={`py-1.5 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                    mealType === t
                      ? 'bg-[#3A2D28] text-white dark:bg-[#F5EFEB] dark:text-[#3A2D28] shadow-xs'
                      : 'text-[#3A2D28]/70 hover:text-[#3A2D28] dark:text-[#F5EFEB]/70 dark:hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#3A2D28] dark:text-[#F5EFEB] mb-1.5">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#3A2D28]/20 dark:border-[#F5EFEB]/20 bg-white dark:bg-[#1B1412] text-[#3A2D28] dark:text-[#F5EFEB] focus:outline-none focus:ring-2 focus:ring-[#3A2D28]"
            />
          </div>

          {/* Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3A2D28] dark:text-[#F5EFEB]">
                Items ({items.length})
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3.5 rounded-2xl border border-[#3A2D28]/15 dark:border-[#F5EFEB]/15 bg-[#FAF8F5] dark:bg-[#1B1412] space-y-2.5 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                    className="font-bold text-xs text-[#3A2D28] dark:text-[#F5EFEB] bg-transparent border-b border-transparent hover:border-[#3A2D28]/30 focus:border-[#3A2D28] focus:outline-none flex-1 py-0.5"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1 text-[#3A2D28]/60 hover:text-rose-600 dark:text-[#F5EFEB]/60 dark:hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#3A2D28]/70 dark:text-[#F5EFEB]/70 font-semibold">Weight:</span>
                    <div className="flex items-center gap-1 font-mono">
                      <input
                        type="number"
                        min="1"
                        value={item.weight_g}
                        onChange={(e) => handleItemChange(idx, 'weight_g', parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-0.5 text-right font-bold text-xs bg-white dark:bg-[#231B18] border border-[#3A2D28]/20 dark:border-[#F5EFEB]/20 rounded-lg text-[#3A2D28] dark:text-[#F5EFEB] focus:outline-none focus:ring-1 focus:ring-[#3A2D28]"
                      />
                      <span className="font-bold text-[#3A2D28] dark:text-[#F5EFEB]">g</span>
                    </div>
                  </div>

                  <div className="font-mono font-extrabold text-[#3A2D28] dark:text-[#F5EFEB]">
                    {item.totalCalories} kcal
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#3A2D28]/12 dark:border-[#F5EFEB]/12 bg-white dark:bg-[#1E1714] flex items-center justify-between">
          <div className="text-xs font-mono font-extrabold text-[#3A2D28] dark:text-[#F5EFEB]">
            Total: {totalMealCalories} kcal
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#3A2D28]/70 dark:text-[#F5EFEB]/70 hover:text-[#3A2D28] dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-[#3A2D28] hover:bg-[#261D19] dark:bg-[#F5EFEB] dark:hover:bg-white text-white dark:text-[#3A2D28] font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Update Meal</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
