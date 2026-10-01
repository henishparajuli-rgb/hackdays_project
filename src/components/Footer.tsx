import React from 'react';
import { Flame, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#3A2D28]/10 dark:border-[#F5EFEB]/10 bg-white/40 dark:bg-[#1E1714]/40 backdrop-blur py-8 mt-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#3A2D28]/70 dark:text-[#F5EFEB]/70">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#3A2D28] dark:bg-[#F5EFEB] flex items-center justify-center text-white dark:text-[#3A2D28]">
              <Flame className="w-3 h-3" />
            </div>
            <span className="font-bold text-[#3A2D28] dark:text-[#F5EFEB]">NutriSnap</span>
            <span>·</span>
            <span>AI Calorie Tracker & Deficit Engine</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Mifflin-St Jeor Evidence-Based Formulas</span>
            <span>·</span>
            <span>Visual Neural Analysis</span>
          </div>
        </div>

        {/* Required Medical & Health Disclaimer */}
        <div className="p-4 rounded-2xl bg-[#3A2D28]/5 dark:bg-[#F5EFEB]/5 border border-[#3A2D28]/10 dark:border-[#F5EFEB]/10 text-[11px] leading-relaxed text-[#3A2D28]/80 dark:text-[#F5EFEB]/80 flex items-start gap-2.5 shadow-xs">
          <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <strong>Health & Nutritional Disclaimer:</strong> All caloric calculations, macronutrient breakdowns, BMR/TDEE estimates, and food photo recognitions provided by NutriSnap are calculated for informational, fitness, and lifestyle logging purposes only. Variations in culinary preparations, ingredients, and portion densities mean estimates are approximate. This application does not provide clinical nutrition diagnoses, medical recommendations, or eating disorder therapies. Always consult a qualified physician or registered dietitian before beginning any intensive calorie-restricted diet or training regimen.
          </div>
        </div>

        <div className="text-center text-[10px] font-mono text-[#3A2D28]/50 dark:text-[#F5EFEB]/50 pt-2">
          © {new Date().getFullYear()} NutriSnap. All data stored securely on your local device.
        </div>

      </div>
    </footer>
  );
};
