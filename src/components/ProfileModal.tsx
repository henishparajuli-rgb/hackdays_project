import React, { useState } from 'react';
import { User, Activity, Target, Scale, HeartPulse, Check, Info } from 'lucide-react';
import { ActivityLevel, Goal, Sex, UserProfile } from '../types';
import {
  calculateBMR,
  calculateBMI,
  calculateTargetCalories,
  calculateTDEE,
  convertFeetInchesToCm,
} from '../utils/calculations';

interface ProfileModalProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isInline?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  onSaveProfile,
  isOpen = true,
  onClose,
  isInline = false,
}) => {
  const [weightKg, setWeightKg] = useState<number>(profile.weightKg || 70);
  const [heightFt, setHeightFt] = useState<number>(profile.heightFt || 5);
  const [heightIn, setHeightIn] = useState<number>(profile.heightIn || 9);
  const [age, setAge] = useState<number>(profile.age || 26);
  const [sex, setSex] = useState<Sex>(profile.sex || 'male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel || 'moderate');
  const [goal, setGoal] = useState<Goal>(profile.goal || 'lose');

  // Live calculation preview
  const heightCm = convertFeetInchesToCm(heightFt, heightIn);
  const liveBMR = calculateBMR(weightKg, heightCm, age, sex);
  const liveTDEE = calculateTDEE(liveBMR, activityLevel);
  const liveTarget = calculateTargetCalories(liveTDEE, liveBMR, goal);
  const { bmi: liveBMI, category: liveCategory } = calculateBMI(weightKg, heightCm);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      weightKg: Math.max(30, Math.min(300, weightKg)),
      heightFt: Math.max(3, Math.min(7, heightFt)),
      heightIn: Math.max(0, Math.min(11, heightIn)),
      age: Math.max(12, Math.min(110, age)),
      sex,
      activityLevel,
      goal,
    };
    onSaveProfile(updated);
    if (onClose) onClose();
  };

  const content = (
    <form onSubmit={handleSave} className="space-y-6">
      
      {/* Real-time Bio-Stats HUD Preview */}
      <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1B1412] border border-[#3A2D28]/15 dark:border-[#F5EFEB]/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center shadow-xs">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#3A2D28]/70 dark:text-[#F5EFEB]/70">BMR</span>
          <div className="text-xl font-extrabold font-mono text-[#3A2D28] dark:text-[#F5EFEB] tabular-nums">
            {liveBMR.toLocaleString()} <span className="text-xs font-normal text-[#3A2D28]/60 dark:text-[#F5EFEB]/60">kcal</span>
          </div>
          <span className="text-[10px] text-[#3A2D28]/70 dark:text-[#F5EFEB]/70">at rest</span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#3A2D28]/70 dark:text-[#F5EFEB]/70">TDEE</span>
          <div className="text-xl font-extrabold font-mono text-[#3A2D28] dark:text-[#F5EFEB] tabular-nums">
            {liveTDEE.toLocaleString()} <span className="text-xs font-normal text-[#3A2D28]/60 dark:text-[#F5EFEB]/60">kcal</span>
          </div>
          <span className="text-[10px] text-[#3A2D28]/70 dark:text-[#F5EFEB]/70">maintenance</span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-700 dark:text-amber-400">Daily Target</span>
          <div className="text-xl font-extrabold font-mono text-amber-700 dark:text-amber-400 tabular-nums">
            {liveTarget.toLocaleString()} <span className="text-xs font-normal text-[#3A2D28]/60 dark:text-[#F5EFEB]/60">kcal</span>
          </div>
          <span className="text-[10px] text-[#3A2D28]/70 dark:text-[#F5EFEB]/70 capitalize">{goal} goal</span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#3A2D28]/70 dark:text-[#F5EFEB]/70">BMI</span>
          <div className="text-xl font-extrabold font-mono text-[#3A2D28] dark:text-[#F5EFEB] tabular-nums">
            {liveBMI}
          </div>
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">{liveCategory}</span>
        </div>
      </div>

      {/* Basic Metrics (Weight, Height ft+in, Age, Sex) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Weight in kg */}
        <div>
          <label className="block text-xs font-bold text-[#3A2D28] dark:text-[#F5EFEB] mb-1.5 flex items-center justify-between">
            <span>Body Weight</span>
            <span className="font-mono text-[#3A2D28]/60 dark:text-[#F5EFEB]/60 font-semibold">kg</span>
          </label>
          <input
            type="number"
            min="30"
            max="300"
            step="0.5"
            required
            value={weightKg}
            onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#3A2D28]/20 dark:border-[#F5EFEB]/20 bg-white dark:bg-[#1B1412] text-[#3A2D28] dark:text-[#F5EFEB] font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#3A2D28]"
          />
        </div>

        {/* Height in Feet and Inches (two separate fields as required) */}
        <div>
          <label className="block text-xs font-bold text-[#3A2D28] dark:text-[#F5EFEB] mb-1.5 flex items-center justify-between">
            <span>Height</span>
            <span className="font-mono text-[#3A2D28]/60 dark:text-[#F5EFEB]/60 font-semibold">{heightCm} cm</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <input
                type="number"
                min="3"
                max="7"
                required
                value={heightFt}
                onChange={(e) => setHeightFt(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#3A2D28]/20 dark:border-[#F5EFEB]/20 bg-white dark:bg-[#1B1412] text-[#3A2D28] dark:text-[#F5EFEB] font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#3A2D28]"
              />
              <span className="absolute right-3 top-2.5 text-xs text-[#3A2D28]/50 dark:text-[#F5EFEB]/50 font-mono font-bold">ft</span>
            </div>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="11"
                required
                value={heightIn}
                onChange={(e) => setHeightIn(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#3A2D28]/20 dark:border-[#F5EFEB]/20 bg-white dark:bg-[#1B1412] text-[#3A2D28] dark:text-[#F5EFEB] font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#3A2D28]"
              />
              <span className="absolute right-3 top-2.5 text-xs text-[#3A2D28]/50 dark:text-[#F5EFEB]/50 font-mono font-bold">in</span>
            </div>
          </div>
        </div>

        {/* Age */}
        <div>
          <label className="block text-xs font-bold text-[#3A2D28] dark:text-[#F5EFEB] mb-1.5 flex items-center justify-between">
            <span>Age</span>
            <span className="font-mono text-[#3A2D28]/60 dark:text-[#F5EFEB]/60 font-semibold">years</span>
          </label>
          <input
            type="number"
            min="12"
            max="110"
            required
            value={age}
            onChange={(e) => setAge(parseInt(e.target.value) || 0)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#3A2D28]/20 dark:border-[#F5EFEB]/20 bg-white dark:bg-[#1B1412] text-[#3A2D28] dark:text-[#F5EFEB] font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#3A2D28]"
          />
        </div>

        {/* Biological Sex */}
        <div>
          <label className="block text-xs font-bold text-[#3A2D28] dark:text-[#F5EFEB] mb-1.5">
            Biological Sex (Mifflin-St Jeor formula)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSex('male')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sex === 'male'
                  ? 'bg-[#3A2D28] text-white dark:bg-[#F5EFEB] dark:text-[#3A2D28] shadow-sm'
                  : 'bg-white dark:bg-[#1B1412] border border-[#3A2D28]/20 dark:border-[#F5EFEB]/20 text-[#3A2D28]/80 dark:text-[#F5EFEB]/80 hover:bg-[#3A2D28]/10'
              }`}
            >
              Male (+5 kcal)
            </button>
            <button
              type="button"
              onClick={() => setSex('female')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sex === 'female'
                  ? 'bg-[#3A2D28] text-white dark:bg-[#F5EFEB] dark:text-[#3A2D28] shadow-sm'
                  : 'bg-white dark:bg-[#1B1412] border border-[#3A2D28]/20 dark:border-[#F5EFEB]/20 text-[#3A2D28]/80 dark:text-[#F5EFEB]/80 hover:bg-[#3A2D28]/10'
              }`}
            >
              Female (-161 kcal)
            </button>
          </div>
        </div>

      </div>

      {/* Activity Level */}
      <div>
        <label className="block text-xs font-bold text-[#3A2D28] dark:text-[#F5EFEB] mb-2">
          Daily Activity Level
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {[
            { id: 'sedentary', label: 'Sedentary', desc: 'Desk job, little movement', mult: '1.2' },
            { id: 'light', label: 'Light', desc: '1–3 days exercise/week', mult: '1.375' },
            { id: 'moderate', label: 'Moderate', desc: '3–5 days workout/week', mult: '1.55' },
            { id: 'very_active', label: 'Very Active', desc: '6–7 days hard training', mult: '1.725' },
            { id: 'athlete', label: 'Athlete', desc: 'Physical job / 2x daily training', mult: '1.9' },
          ].map((act) => (
            <button
              key={act.id}
              type="button"
              onClick={() => setActivityLevel(act.id as ActivityLevel)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                activityLevel === act.id
                  ? 'border-[#3A2D28] bg-[#3A2D28] text-white dark:border-[#F5EFEB] dark:bg-[#F5EFEB] dark:text-[#3A2D28] shadow-sm'
                  : 'border-[#3A2D28]/15 dark:border-[#F5EFEB]/15 bg-white dark:bg-[#1B1412] text-[#3A2D28] dark:text-[#F5EFEB] hover:border-[#3A2D28]/40'
              }`}
            >
              <div className="text-xs font-bold flex items-center justify-between">
                <span>{act.label}</span>
                <span className="text-[10px] font-mono opacity-80">×{act.mult}</span>
              </div>
              <div className={`text-[10px] mt-1 line-clamp-2 ${activityLevel === act.id ? 'opacity-90' : 'text-[#3A2D28]/70 dark:text-[#F5EFEB]/70'}`}>
                {act.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Goal Selection */}
      <div>
        <label className="block text-xs font-bold text-[#3A2D28] dark:text-[#F5EFEB] mb-2">
          Nutritional Goal
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'lose',
              label: 'Lose Weight',
              sub: 'TDEE − 500 kcal',
              detail: 'Calculates ~0.45 kg weekly fat loss deficit with BMR safety guardrail.',
            },
            {
              id: 'maintain',
              label: 'Maintain Weight',
              sub: 'TDEE (Equal intake)',
              detail: 'Balance energy expenditure for weight stability and metabolic health.',
            },
            {
              id: 'gain',
              label: 'Gain Muscle',
              sub: 'TDEE + 300 kcal',
              detail: 'Controlled caloric surplus for hypertrophy and strength progression.',
            },
          ].map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGoal(g.id as Goal)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                goal === g.id
                  ? 'border-[#3A2D28] bg-[#3A2D28] text-white dark:border-[#F5EFEB] dark:bg-[#F5EFEB] dark:text-[#3A2D28] shadow-sm'
                  : 'border-[#3A2D28]/15 dark:border-[#F5EFEB]/15 bg-white dark:bg-[#1B1412] text-[#3A2D28] dark:text-[#F5EFEB] hover:border-[#3A2D28]/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{g.label}</span>
                <span className={`text-[10px] font-mono font-bold ${goal === g.id ? 'text-amber-200 dark:text-amber-900' : 'text-amber-700 dark:text-amber-400'}`}>
                  {g.sub}
                </span>
              </div>
              <p className={`text-[11px] mt-1 ${goal === g.id ? 'opacity-90' : 'text-[#3A2D28]/70 dark:text-[#F5EFEB]/70'}`}>
                {g.detail}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Scientific Formula Note */}
      <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#1B1412] border border-[#3A2D28]/15 dark:border-[#F5EFEB]/15 flex items-start gap-2.5 text-xs text-[#3A2D28]/80 dark:text-[#F5EFEB]/80">
        <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div>
          <strong>Mifflin-St Jeor Formula:</strong> Recognized by clinical dietitians as the standard for resting metabolic rate. Height is converted to cm: ({heightFt} × 12 + {heightIn}) × 2.54 = {heightCm} cm.
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onClose && !isInline && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#3A2D28]/70 dark:text-[#F5EFEB]/70 hover:text-[#3A2D28] dark:hover:text-white cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2.5 bg-[#3A2D28] hover:bg-[#261D19] dark:bg-[#F5EFEB] dark:hover:bg-white text-white dark:text-[#3A2D28] font-bold text-xs rounded-xl shadow-lg shadow-[#3A2D28]/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Save Profile & Update Targets</span>
        </button>
      </div>

    </form>
  );

  if (isInline) {
    return (
      <div className="glass-panel rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#3A2D28]/12 dark:border-[#F5EFEB]/12">
          <div className="w-10 h-10 rounded-2xl bg-[#3A2D28] dark:bg-[#F5EFEB] text-[#F5EFEB] dark:text-[#3A2D28] flex items-center justify-center shadow-xs">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#3A2D28] dark:text-[#F5EFEB]">
              User Profile & Biometric Settings
            </h2>
            <p className="text-xs text-[#3A2D28]/70 dark:text-[#F5EFEB]/70 mt-0.5">
              Update your body metrics to recalculate BMR, TDEE, and daily deficit targets
            </p>
          </div>
        </div>
        {content}
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="glass-panel w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-[#3A2D28]/20 dark:border-[#F5EFEB]/20 p-6 animate-in fade-in duration-200">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#3A2D28]/12 dark:border-[#F5EFEB]/12">
          <h2 className="text-base font-extrabold text-[#3A2D28] dark:text-[#F5EFEB]">
            User Profile Setup
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-[#3A2D28]/70 hover:text-[#3A2D28] dark:text-[#F5EFEB]/70 dark:hover:text-white text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
        <div className="overflow-y-auto flex-1 pr-1">
          {content}
        </div>
      </div>
    </div>
  );
};
