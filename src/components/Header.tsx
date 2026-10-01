import React from 'react';
import { Camera, Moon, Sun, User, UtensilsCrossed, BarChart3, Flame } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'snap' | 'history' | 'profile';
  setActiveTab: (tab: 'dashboard' | 'snap' | 'history' | 'profile') => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onOpenSnap: () => void;
  todayCalories: number;
  targetCalories: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  onOpenSnap,
  todayCalories,
  targetCalories,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#3A2D28]/10 dark:border-[#F5EFEB]/10 bg-[#FAF8F5]/90 dark:bg-[#1E1714]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#3A2D28] dark:bg-[#F5EFEB] flex items-center justify-center shadow-md shadow-[#3A2D28]/20 group-hover:scale-105 transition-transform">
                <Flame className="w-5 h-5 text-[#F5EFEB] dark:text-[#3A2D28]" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-[#3A2D28] dark:text-[#F5EFEB] flex items-center gap-1.5">
                  NutriSnap
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                </span>
                <span className="hidden sm:block text-[11px] font-medium text-[#3A2D28]/60 dark:text-[#F5EFEB]/60 -mt-1">
                  AI Calorie & Deficit Tracker
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (single-line, clean tabs with high clarity) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#3A2D28]/5 dark:bg-[#F5EFEB]/5 p-1 rounded-xl border border-[#3A2D28]/10 dark:border-[#F5EFEB]/10">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#3A2D28] text-white dark:bg-[#F5EFEB] dark:text-[#3A2D28] shadow-sm'
                  : 'text-[#3A2D28]/70 dark:text-[#F5EFEB]/70 hover:text-[#3A2D28] dark:hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#3A2D28] text-white dark:bg-[#F5EFEB] dark:text-[#3A2D28] shadow-sm'
                  : 'text-[#3A2D28]/70 dark:text-[#F5EFEB]/70 hover:text-[#3A2D28] dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Trends & History</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#3A2D28] text-white dark:bg-[#F5EFEB] dark:text-[#3A2D28] shadow-sm'
                  : 'text-[#3A2D28]/70 dark:text-[#F5EFEB]/70 hover:text-[#3A2D28] dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Profile</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Snap Food CTA & Theme Toggle) */}
          <div className="flex items-center gap-2.5">
            {/* Quick calories progress badge */}
            <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#2A201C] border border-[#3A2D28]/15 dark:border-[#F5EFEB]/15 text-xs font-mono text-[#3A2D28] dark:text-[#F5EFEB] shadow-sm">
              <span className="font-bold">{todayCalories}</span>
              <span className="text-[#3A2D28]/40 dark:text-[#F5EFEB]/40">/</span>
              <span className="text-[#3A2D28]/70 dark:text-[#F5EFEB]/70">{targetCalories} kcal</span>
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl text-[#3A2D28]/70 hover:text-[#3A2D28] dark:text-[#F5EFEB]/70 dark:hover:text-white hover:bg-[#3A2D28]/10 dark:hover:bg-[#F5EFEB]/10 border border-transparent hover:border-[#3A2D28]/10 transition-colors cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-[#3A2D28]" />}
            </button>

            {/* Quick Snap CTA */}
            <button
              onClick={onOpenSnap}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white dark:text-[#3A2D28] bg-[#3A2D28] hover:bg-[#291F1B] dark:bg-[#F5EFEB] dark:hover:bg-white active:scale-95 rounded-xl shadow-md shadow-[#3A2D28]/25 transition-all whitespace-nowrap cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Snap Food</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
