import React, { useState, useEffect } from 'react';
import {
  Header,
} from './components/Header';
import { CircularProgress } from './components/CircularProgress';
import { MetricCards } from './components/MetricCards';
import { MacroBreakdown } from './components/MacroBreakdown';
import { MealLogList } from './components/MealLogList';
import { FoodScannerModal } from './components/FoodScannerModal';
import { HistoryChart } from './components/HistoryChart';
import { ProfileModal } from './components/ProfileModal';
import { EditMealModal } from './components/EditMealModal';
import { Footer } from './components/Footer';
import { LoggedMeal, UserProfile } from './types';
import { computeMetrics } from './utils/calculations';
import {
  clearMealsForDate,
  deleteMeal,
  exportMealsToCSV,
  formatDateKey,
  getMealsForDate,
  getStoredMeals,
  getStoredProfile,
  getStoredTheme,
  logMeal,
  saveStoredProfile,
  saveStoredTheme,
  seedSampleData,
  updateMeal,
} from './utils/storage';
import {
  UtensilsCrossed,
  BarChart3,
  User,
  Camera,
  Flame,
  PlusCircle,
  Sparkles,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';

export default function App() {
  // Ensure starter demo profile & meals exist on initial launch
  useEffect(() => {
    seedSampleData();
  }, []);

  const [profile, setProfile] = useState<UserProfile>(() => {
    return (
      getStoredProfile() || {
        weightKg: 70,
        heightFt: 5,
        heightIn: 9,
        age: 26,
        sex: 'male',
        activityLevel: 'moderate',
        goal: 'lose',
      }
    );
  });

  const [meals, setMeals] = useState<LoggedMeal[]>(() => getStoredMeals());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'profile'>('dashboard');
  const [isSnapOpen, setIsSnapOpen] = useState<boolean>(false);
  const [editingMeal, setEditingMeal] = useState<LoggedMeal | null>(null);

  // Dark mode state
  const [isDark, setIsDark] = useState<boolean>(() => getStoredTheme() === 'dark');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      saveStoredTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      saveStoredTheme('light');
    }
  }, [isDark]);

  // Sync today's date and meals
  const todayKey = formatDateKey(new Date());
  const todayMeals = meals.filter((m) => m.dateKey === todayKey);

  const todayCalories = todayMeals.reduce((sum, m) => sum + m.totalCalories, 0);
  const todayProtein = Math.round(todayMeals.reduce((sum, m) => sum + m.totalProtein, 0) * 10) / 10;
  const todayCarbs = Math.round(todayMeals.reduce((sum, m) => sum + m.totalCarbs, 0) * 10) / 10;
  const todayFat = Math.round(todayMeals.reduce((sum, m) => sum + m.totalFat, 0) * 10) / 10;

  // Compute evidence-based metrics (BMR, TDEE, Target, BMI, Deficit)
  const metrics = computeMetrics(profile, todayCalories);

  // Handlers
  const handleSaveMeal = (newMeal: LoggedMeal) => {
    logMeal(newMeal);
    setMeals(getStoredMeals());
  };

  const handleUpdateMeal = (updated: LoggedMeal) => {
    updateMeal(updated);
    setMeals(getStoredMeals());
  };

  const handleDeleteMeal = (mealId: string) => {
    deleteMeal(mealId);
    setMeals(getStoredMeals());
  };

  const handleResetDay = () => {
    clearMealsForDate(todayKey);
    setMeals(getStoredMeals());
  };

  const handleExportCSV = () => {
    exportMealsToCSV(meals);
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    saveStoredProfile(newProfile);
    setProfile(newProfile);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F4] dark:bg-[#150F0D] text-[#291F1C] dark:text-[#F7F4F0] transition-colors pb-20 md:pb-0">
      
      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab as any}
        setActiveTab={(t) => {
          if (t === 'snap') {
            setIsSnapOpen(true);
          } else {
            setActiveTab(t);
          }
        }}
        isDark={isDark}
        setIsDark={setIsDark}
        onOpenSnap={() => setIsSnapOpen(true)}
        todayCalories={todayCalories}
        targetCalories={metrics.targetCalories}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* TAB 1: MAIN DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Top Overview Grid: Progress Ring + Donut Macro Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Circular Progress Ring Card */}
              <div className="lg:col-span-5 glass-panel rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-[#3A2D28]/12 dark:border-[#F5EFEB]/12">
                  <div>
                    <h2 className="text-sm font-extrabold text-[#3A2D28] dark:text-[#F5EFEB] tracking-tight">
                      Daily Calorie Budget
                    </h2>
                    <p className="text-xs text-[#3A2D28]/70 dark:text-[#F5EFEB]/70 mt-0.5">
                      Target goal: <span className="capitalize font-bold text-[#3A2D28] dark:text-[#F5EFEB]">{profile.goal} weight</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSnapOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#3A2D28] hover:bg-[#261D19] dark:bg-[#F5EFEB] dark:hover:bg-white text-white dark:text-[#3A2D28] text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Snap Meal</span>
                  </button>
                </div>

                <CircularProgress
                  consumed={todayCalories}
                  target={metrics.targetCalories}
                  tdee={metrics.tdee}
                  size={230}
                  strokeWidth={16}
                />

                <div className="pt-3 border-t border-[#3A2D28]/12 dark:border-[#F5EFEB]/12 flex items-center justify-between text-xs text-[#3A2D28]/80 dark:text-[#F5EFEB]/80 font-mono font-medium">
                  <span className="font-bold">Target: {metrics.targetCalories} kcal</span>
                  <span className="text-[#3A2D28]/40 dark:text-[#F5EFEB]/40">·</span>
                  <span>TDEE: {metrics.tdee} kcal</span>
                </div>
              </div>

              {/* Macro Donut Chart & Calorie Split Card */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <MacroBreakdown
                  proteinG={todayProtein}
                  carbsG={todayCarbs}
                  fatG={todayFat}
                  targetCalories={metrics.targetCalories}
                  isDark={isDark}
                />

                {/* Motivational & Deficit Summary Banner with #3A2D28 Styling */}
                <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-[#231B18] border border-[#3A2D28]/15 dark:border-[#F5EFEB]/15 flex items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#3A2D28] text-[#F5EFEB] dark:bg-[#F5EFEB] dark:text-[#3A2D28] flex items-center justify-center shrink-0 shadow-sm">
                      {profile.goal === 'lose' && metrics.deficitOrSurplus > 0 ? (
                        <TrendingDown className="w-5 h-5 text-emerald-300 dark:text-emerald-700" />
                      ) : profile.goal === 'gain' && metrics.deficitOrSurplus < 0 ? (
                        <TrendingUp className="w-5 h-5 text-emerald-300 dark:text-emerald-700" />
                      ) : (
                        <Flame className="w-5 h-5 text-amber-300 dark:text-amber-700" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-[#3A2D28] dark:text-[#F5EFEB]">
                        {profile.goal === 'lose' && metrics.deficitOrSurplus > 0
                          ? `On Track: -${metrics.deficitOrSurplus} kcal deficit today!`
                          : profile.goal === 'lose' && metrics.deficitOrSurplus <= 0
                          ? `Over Target: +${Math.abs(metrics.deficitOrSurplus)} kcal above daily deficit goal`
                          : profile.goal === 'gain'
                          ? `Progressing toward +${Math.abs(metrics.deficitOrSurplus)} kcal surplus`
                          : `Caloric intake aligned with maintenance targets.`}
                      </div>
                      <div className="text-[11px] text-[#3A2D28]/70 dark:text-[#F5EFEB]/70 mt-0.5">
                        {profile.goal === 'lose' && metrics.deficitOrSurplus > 0
                          ? `Estimated fat loss at this rate: ~${Math.abs(metrics.weeklyEstimatedKgChange)} kg / week.`
                          : `Consistent photo logging increases nutritional adherence and accountability.`}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('history')}
                    className="hidden sm:flex text-xs font-bold text-[#3A2D28] dark:text-[#F5EFEB] hover:underline shrink-0 items-center gap-1 cursor-pointer"
                  >
                    <span>7-day trends</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

            </div>

            {/* 6 Key Metric Cards (BMR, TDEE, Consumed, Remaining, Deficit/Surplus, BMI) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#3A2D28]/80 dark:text-[#F5EFEB]/80">
                  Biometric & Caloric Calculations
                </h3>
                <span className="text-[11px] font-mono font-medium text-[#3A2D28]/60 dark:text-[#F5EFEB]/60">
                  Mifflin-St Jeor equation
                </span>
              </div>
              <MetricCards
                metrics={metrics}
                profile={profile}
                consumedToday={todayCalories}
              />
            </div>

            {/* Today's Meal Log */}
            <MealLogList
              meals={todayMeals}
              onDeleteMeal={handleDeleteMeal}
              onEditMeal={(meal) => setEditingMeal(meal)}
              onResetDay={handleResetDay}
              onExportCSV={handleExportCSV}
              onOpenSnap={() => setIsSnapOpen(true)}
            />

          </div>
        )}

        {/* TAB 2: HISTORY & ANALYTICS */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <HistoryChart
              meals={meals}
              targetCalories={metrics.targetCalories}
              tdee={metrics.tdee}
              profile={profile}
              isDark={isDark}
            />
          </div>
        )}

        {/* TAB 3: USER PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl mx-auto">
            <ProfileModal
              profile={profile}
              onSaveProfile={handleSaveProfile}
              isInline={true}
            />
          </div>
        )}

      </main>

      {/* Food Photo Scanner & Review Modal */}
      <FoodScannerModal
        isOpen={isSnapOpen}
        onClose={() => setIsSnapOpen(false)}
        onSaveMeal={handleSaveMeal}
      />

      {/* Edit Logged Meal Modal */}
      <EditMealModal
        meal={editingMeal}
        isOpen={Boolean(editingMeal)}
        onClose={() => setEditingMeal(null)}
        onSave={handleUpdateMeal}
      />

      {/* Footer with Medical Disclaimer */}
      <Footer />

      {/* Mobile Fixed Bottom Navigation Bar in #3A2D28 Palette */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 dark:bg-[#1E1714]/98 backdrop-blur-md border-t border-[#3A2D28]/15 dark:border-[#F5EFEB]/15 pb-safe shadow-lg">
        <div className="grid grid-cols-4 items-center h-16 px-2">
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'dashboard'
                ? 'text-[#3A2D28] dark:text-[#F5EFEB] font-extrabold'
                : 'text-[#3A2D28]/50 dark:text-[#F5EFEB]/50'
            }`}
          >
            <UtensilsCrossed className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Dashboard</span>
          </button>

          <button
            onClick={() => setIsSnapOpen(true)}
            className="flex flex-col items-center justify-center -mt-5 group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-2xl bg-[#3A2D28] dark:bg-[#F5EFEB] text-white dark:text-[#3A2D28] flex items-center justify-center shadow-lg shadow-[#3A2D28]/30 group-active:scale-95 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold text-[#3A2D28] dark:text-[#F5EFEB] mt-1">Snap</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'history'
                ? 'text-[#3A2D28] dark:text-[#F5EFEB] font-extrabold'
                : 'text-[#3A2D28]/50 dark:text-[#F5EFEB]/50'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Trends</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'profile'
                ? 'text-[#3A2D28] dark:text-[#F5EFEB] font-extrabold'
                : 'text-[#3A2D28]/50 dark:text-[#F5EFEB]/50'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Profile</span>
          </button>

        </div>
      </div>

    </div>
  );
}
