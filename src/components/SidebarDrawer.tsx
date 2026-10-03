import React from 'react';
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
  X,
  TrendingUp,
  Mic,
  CalendarDays,
  FolderKanban,
  Fingerprint,
  Globe,
  KeyRound,
  Shield,
  Settings
} from 'lucide-react';
import { ActiveTab, UserRoleMode } from '../types';
import { Language, translations } from '../i18n/translations';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
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
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
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
  currentUser
}) => {
  const t = translations[lang];
  if (!isOpen) return null;

  const handleSelect = (tab: ActiveTab) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-80 max-w-[85vw] bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
        {/* Header Branding */}
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center p-2">
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <div className="absolute w-2.5 h-2.5 rounded-full bg-blue-600 top-0 left-0"></div>
                  <div className="absolute w-2.5 h-2.5 rounded-full bg-blue-500 top-0 right-0"></div>
                  <div className="absolute w-2.5 h-2.5 rounded-full bg-blue-400 bottom-0 left-0"></div>
                  <div className="absolute w-2.5 h-2.5 rounded-full bg-blue-700 bottom-0 right-0"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></div>
                </div>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {lang === 'km' ? 'កម្មវិធីគ្រប់គ្រងបុគ្គលិក' : 'Employee Tracking App'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Marketing Landmark</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Company Card */}
          <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 shadow-xs flex items-center justify-center border border-slate-200/60 dark:border-slate-600 shrink-0">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">ML</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  Marketing Landmark
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  admin@marketinglandmark.com
                </p>
              </div>
            </div>

            {/* Language Switch */}
            <button
              onClick={onToggleLang}
              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-bold text-slate-700 dark:text-slate-300 shrink-0"
            >
              {lang === 'en' ? 'ខ្មែរ' : 'EN'}
            </button>
          </div>

          {/* User Account Card */}
          <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-2">
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

            {onOpenAccountSettings && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAccountSettings();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-[11px] font-medium border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>{t.manageAccount}</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-4 py-2 space-y-4">
          {/* Admin Back-End Hub */}
          {roleMode === 'admin' && (
            <div>
              <button
                onClick={() => handleSelect('admin_hub')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'admin_hub'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-500" />
                <span>{t.adminHub}</span>
              </button>
            </div>
          )}

          {/* Main Dashboard */}
          <div>
            <button
              onClick={() => handleSelect('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>{t.dashboard}</span>
            </button>
          </div>

          {/* CORE MODULES */}
          <div className="space-y-1">
            <button
              onClick={() => handleSelect('projects')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-colors ${
                activeTab === 'projects'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FolderKanban className="w-5 h-5 text-blue-600" />
              <span>{t.projectsTasks}</span>
            </button>

            {/* Sales Management */}
            <button
              onClick={() => handleSelect('sales')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-colors ${
                activeTab === 'sales'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>{t.salesManagement}</span>
            </button>

            {/* Admin must not clock in/out */}
            {roleMode !== 'admin' && (
              <button
                onClick={() => handleSelect('clock')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-colors ${
                  activeTab === 'clock'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Fingerprint className="w-5 h-5 text-blue-500" />
                <span>{t.clockInOut}</span>
              </button>
            )}

            {/* Admin Attendance Ledger (Admins review attendance ledger instead of clock in/out) */}
            {roleMode === 'admin' && (
              <button
                onClick={() => handleSelect('attendance')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-colors ${
                  activeTab === 'attendance'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <CalendarCheck className="w-5 h-5 text-blue-500" />
                <span>{t.attendance}</span>
              </button>
            )}

            {/* Shift Schedules */}
            <button
              onClick={() => handleSelect('shifts')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-colors ${
                activeTab === 'shifts'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CalendarDays className="w-5 h-5 text-blue-500" />
              <span>{t.shiftSchedules}</span>
            </button>

            {/* Voice Assistant Trigger */}
            <button
              onClick={() => {
                onClose();
                onOpenVoiceAssistant();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100/60 transition-colors"
            >
              <Mic className="w-5 h-5 text-indigo-600 animate-pulse" />
              <span>{t.voiceAssistant}</span>
            </button>
          </div>

          {/* WORKFORCE SECTION */}
          <div>
            <div className="px-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
              {t.workforce}
            </div>
            <div className="mt-2 space-y-1">
              {/* Employees Directory: Admin only */}
              {roleMode === 'admin' && (
                <button
                  onClick={() => handleSelect('employees')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                    activeTab === 'employees'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>{t.employees}</span>
                </button>
              )}

              {/* Departments Management: Admin only */}
              {roleMode === 'admin' && (
                <button
                  onClick={() => handleSelect('departments')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                    activeTab === 'departments'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Building className="w-4 h-4 text-slate-500" />
                  <span>{t.departments}</span>
                </button>
              )}

              {/* Leave Requests: Staff (own) and Admin (approvals) */}
              <button
                onClick={() => handleSelect('leave')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === 'leave'
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <CalendarOff className="w-4 h-4 text-slate-500" />
                <span>{t.leave}</span>
              </button>
            </div>
          </div>

          {/* OPERATIONS SECTION */}
          <div>
            <div className="px-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
              {t.operations}
            </div>
            <div className="mt-2 space-y-1">
              {/* Locations: Admin only */}
              {roleMode === 'admin' && (
                <button
                  onClick={() => handleSelect('locations')}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                    activeTab === 'locations'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>{t.locations}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 font-semibold">
                    3
                  </span>
                </button>
              )}

              {/* Reports */}
              <button
                onClick={() => handleSelect('reports')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === 'reports'
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                <span>{t.reports}</span>
              </button>

              {/* System Settings: Admin only */}
              {roleMode === 'admin' && (
                <button
                  onClick={() => handleSelect('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>{t.systemSettings}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Area: Appearance & Sign Out */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          {/* Appearance Card */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">{t.appearance}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
              <button
                onClick={() => onSetTheme('auto')}
                className={`flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-xs font-medium transition-colors ${
                  theme === 'auto'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>{t.auto}</span>
              </button>
              <button
                onClick={() => onSetTheme('light')}
                className={`flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-xs font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>{t.light}</span>
              </button>
              <button
                onClick={() => onSetTheme('dark')}
                className={`flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-xs font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>{t.dark}</span>
              </button>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={() => {
              onClose();
              onSignOut();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.signOut}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
