import React from 'react';
import { LayoutGrid, Fingerprint, CalendarDays, CheckCircle2, Shield, CalendarCheck } from 'lucide-react';
import { ActiveTab, Language, UserRoleMode } from '../types';
import { translations } from '../i18n/translations';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  lang?: Language;
  roleMode?: UserRoleMode;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab, lang = 'en', roleMode = 'employee' }) => {
  const t = translations[lang];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16 items-center px-2">
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center h-full transition-all ${
            activeTab === 'dashboard'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-50 dark:bg-blue-900/40 scale-105'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[70px]">{t.dashboard}</span>
        </button>

        {/* Tab 2: Clock In/Out for staff OR Attendance for admin (admin must not clock in/out) */}
        {roleMode !== 'admin' ? (
          <button
            onClick={() => onSelectTab('clock')}
            className={`flex flex-col items-center justify-center h-full transition-all ${
              activeTab === 'clock'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                activeTab === 'clock'
                  ? 'bg-blue-50 dark:bg-blue-900/40 scale-105'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Fingerprint className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[70px]">{t.clockInOut}</span>
          </button>
        ) : (
          <button
            onClick={() => onSelectTab('attendance')}
            className={`flex flex-col items-center justify-center h-full transition-all ${
              activeTab === 'attendance'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                activeTab === 'attendance'
                  ? 'bg-blue-50 dark:bg-blue-900/40 scale-105'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[70px]">{t.attendance}</span>
          </button>
        )}

        {/* Tab 3: Shift Schedules */}
        <button
          onClick={() => onSelectTab('shifts')}
          className={`flex flex-col items-center justify-center h-full transition-all ${
            activeTab === 'shifts'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              activeTab === 'shifts'
                ? 'bg-blue-50 dark:bg-blue-900/40 scale-105'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <CalendarDays className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[70px]">{t.schedulesTab}</span>
        </button>

        {/* Tab 4: Projects & Tasks (or Admin Hub if admin) */}
        {roleMode === 'admin' ? (
          <button
            onClick={() => onSelectTab('admin_hub')}
            className={`flex flex-col items-center justify-center h-full transition-all ${
              activeTab === 'admin_hub'
                ? 'text-amber-600 dark:text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                activeTab === 'admin_hub'
                  ? 'bg-amber-50 dark:bg-amber-950/40 scale-105'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Shield className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[70px]">{t.adminHub}</span>
          </button>
        ) : (
          <button
            onClick={() => onSelectTab('projects')}
            className={`flex flex-col items-center justify-center h-full transition-all ${
              activeTab === 'projects'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                activeTab === 'projects'
                  ? 'bg-blue-50 dark:bg-blue-900/40 scale-105'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[70px]">{t.projectsTab}</span>
          </button>
        )}
      </div>
    </nav>
  );
};
