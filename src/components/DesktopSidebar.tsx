import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Building,
  CalendarOff,
  MapPin,
  FileSpreadsheet,
  Sun,
  Moon,
  Smartphone,
  LogOut,
  TrendingUp,
  Mic,
  CalendarDays,
  FolderKanban,
  Fingerprint,
  Globe,
  Sparkles,
  Bell,
  Shield,
  UserCheck,
  CheckCircle2,
  ChevronDown,
  KeyRound,
  Settings
} from 'lucide-react';
import { ActiveTab, UserRoleMode } from '../types';
import { Language, translations } from '../i18n/translations';

interface DesktopSidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  roleMode: UserRoleMode;
  theme: 'auto' | 'light' | 'dark';
  onSetTheme: (theme: 'auto' | 'light' | 'dark') => void;
  lang: Language;
  onToggleLang: () => void;
  onOpenVoiceAssistant: () => void;
  onSignOut: () => void;
  onOpenAccountSettings?: () => void;
  currentUser?: any;
  unreadCount?: number;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onSelectTab,
  roleMode,
  theme,
  onSetTheme,
  lang,
  onToggleLang,
  onOpenVoiceAssistant,
  onSignOut,
  onOpenAccountSettings,
  currentUser,
  unreadCount = 2
}) => {
  const t = translations[lang];
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(unreadCount > 0);

  return (
    <aside className="hidden lg:flex flex-col w-72 fixed inset-y-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 select-none overflow-y-auto">
      {/* Brand & Topbar Section (Moved from topbar) */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        {/* Workspace Brand and Controls */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center p-1.5 shrink-0">
              <div className="relative w-5 h-5 flex items-center justify-center">
                <div className="absolute w-2 h-2 rounded-full bg-blue-600 top-0 left-0"></div>
                <div className="absolute w-2 h-2 rounded-full bg-blue-500 top-0 right-0"></div>
                <div className="absolute w-2 h-2 rounded-full bg-blue-400 bottom-0 left-0"></div>
                <div className="absolute w-2 h-2 rounded-full bg-blue-700 bottom-0 right-0"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 ring-2 ring-white"></div>
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <h2 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                  {lang === 'km' ? 'ម៉ាឃីធីង ឡែនម៉ាក' : 'Marketing Landmark'}
                </h2>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{t.workforceProjects}</p>
            </div>
          </div>

          {/* Topbar Action Icons (Notifications + Language) */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Notification Bell with popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors relative"
                title={t.recentAlerts}
              >
                <Bell className="w-4 h-4" />
                {hasUnread && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div className="absolute left-0 top-10 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{t.recentAlerts}</span>
                    <button
                      onClick={() => {
                        setHasUnread(false);
                        setShowNotifications(false);
                      }}
                      className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      {t.markAllRead}
                    </button>
                  </div>
                  <div className="space-y-2 mt-2 max-h-56 overflow-y-auto">
                    <div className="p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 text-xs">
                      <div className="font-semibold text-blue-950 dark:text-blue-200">{t.shiftStarted}</div>
                      <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">{t.shiftStartedMsg}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-xs">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{t.salesDealWon}</div>
                      <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">{t.salesDealWonMsg}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              className="px-2 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors"
              title="Switch Language / ប្តូរភាសា"
            >
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>{lang === 'en' ? 'ខ្មែរ 🇰🇭' : 'EN 🇬🇧'}</span>
            </button>
          </div>
        </div>

        {/* User Profile Card & Role Switcher (Moved from Topbar) */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser?.name?.charAt(0) || 'M'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUser?.name || 'Administrator'}
                </div>
                <div className="text-[11px] text-slate-400 font-mono truncate">
                  {currentUser?.phone || '+855 12 888 999'}
                </div>
              </div>
            </div>

            {/* Zero-pill clean unboxed role metadata */}
            <span className={`text-[11px] font-semibold ${
              roleMode === 'admin'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-blue-600 dark:text-blue-400'
            }`}>
              {roleMode === 'admin' ? 'Executive' : 'Staff'}
            </span>
          </div>

          {/* Manage Account & Password Button */}
          {onOpenAccountSettings && (
            <button
              onClick={onOpenAccountSettings}
              className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-colors"
              title={t.manageAccount}
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>{t.manageAccount}</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-3 space-y-3 overflow-y-auto">
        {/* Voice Assistant Quick Launch Banner */}
        <div>
          <button
            onClick={onOpenVoiceAssistant}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Mic className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.voiceAssistant}</span>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
          </button>
        </div>

        {/* Primary Core Sections */}
        <div className="space-y-1">
          {roleMode === 'admin' && (
            <button
              onClick={() => onSelectTab('admin_hub')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors mb-1 ${
                activeTab === 'admin_hub'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Shield className="w-4 h-4 shrink-0 text-amber-500" />
              <span className="truncate">{t.adminHub}</span>
            </button>
          )}

          <button
            onClick={() => onSelectTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>{t.dashboard}</span>
          </button>

          <button
            onClick={() => onSelectTab('projects')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'projects'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FolderKanban className="w-4 h-4 shrink-0" />
            <span>{t.projectsTasks}</span>
          </button>

          <button
            onClick={() => onSelectTab('sales')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'sales'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{t.salesManagement}</span>
          </button>

          {/* Admin must not clock in/out */}
          {roleMode !== 'admin' && (
            <button
              onClick={() => onSelectTab('clock')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'clock'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Fingerprint className="w-4 h-4 shrink-0" />
              <span>{t.clockInOut}</span>
            </button>
          )}

          <button
            onClick={() => onSelectTab('shifts')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'shifts'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CalendarDays className="w-4 h-4 shrink-0" />
            <span>{t.shiftSchedules}</span>
          </button>
        </div>

        {/* Workforce Operations */}
        <div className="pt-2">
          <div className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-1.5">
            {t.workforce}
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectTab('employees')}
              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'employees'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{t.employees}</span>
            </button>

            <button
              onClick={() => onSelectTab('attendance')}
              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'attendance'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CalendarCheck className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{t.attendance}</span>
            </button>

            <button
              onClick={() => onSelectTab('departments')}
              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'departments'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Building className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{t.departments}</span>
            </button>

            <button
              onClick={() => onSelectTab('leave')}
              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'leave'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CalendarOff className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{t.leave}</span>
            </button>
          </div>
        </div>

        {/* Operations */}
        <div className="pt-2">
          <div className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-1.5">
            {t.operations}
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectTab('locations')}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'locations'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{t.locations}</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                3
              </span>
            </button>

            <button
              onClick={() => onSelectTab('reports')}
              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'reports'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{t.reports}</span>
            </button>

            <button
              onClick={() => onSelectTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{t.systemSettings}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer: Theme Switcher & Sign Out */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
        {/* Theme Segmented Control */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => onSetTheme('auto')}
            className={`py-1 text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
              theme === 'auto' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            <span>{t.auto}</span>
          </button>
          <button
            onClick={() => onSetTheme('light')}
            className={`py-1 text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
              theme === 'light' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            <Sun className="w-3 h-3" />
            <span>{t.light}</span>
          </button>
          <button
            onClick={() => onSetTheme('dark')}
            className={`py-1 text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
              theme === 'dark' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            <Moon className="w-3 h-3" />
            <span>{t.dark}</span>
          </button>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t.signOut}</span>
        </button>
      </div>
    </aside>
  );
};
