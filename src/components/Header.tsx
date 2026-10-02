import React, { useState } from 'react';
import { Menu, Bell, UserCheck, Shield, Mic, Globe, LogOut, KeyRound, Smartphone } from 'lucide-react';
import { UserRoleMode } from '../types';
import { Language, translations } from '../i18n/translations';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  title: string;
  onOpenDrawer: () => void;
  roleMode: UserRoleMode;
  lang: Language;
  onToggleLang: () => void;
  onOpenVoiceAssistant: () => void;
  onSignOut: () => void;
  onOpenAccountSettings?: () => void;
  onOpenAlerts?: () => void;
  currentUser?: any;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onOpenDrawer,
  roleMode,
  lang,
  onToggleLang,
  onOpenVoiceAssistant,
  onSignOut,
  onOpenAccountSettings,
  onOpenAlerts,
  currentUser,
  unreadCount = 2
}) => {
  const t = translations[lang];
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors w-full">
      {/* Top Helper Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 sm:px-8 py-1.5 flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium tracking-tight truncate">{t.workspaceName}</span>
          {roleMode === 'admin' && (
            <span className="text-[10px] font-semibold text-amber-400 border border-amber-400/30 px-1.5 py-0.2 rounded">
              Admin
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors"
            title="Switch Language / ប្តូរភាសា"
          >
            <Globe className="w-3 h-3 text-blue-400" />
            <span>{lang === 'en' ? 'ខ្មែរ 🇰🇭' : 'EN 🇬🇧'}</span>
          </button>

          {/* Sign Out */}
          <button
            onClick={onSignOut}
            className="flex items-center gap-1 text-[11px] text-rose-300 hover:text-rose-100 px-2 py-0.5 rounded-lg hover:bg-rose-950/40 transition-colors"
            title={t.signOut}
          >
            <LogOut className="w-3 h-3 text-rose-400" />
            <span className="hidden sm:inline">{t.signOut}</span>
          </button>
        </div>
      </div>

      {/* Main app bar */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-3 h-14 w-full">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
          <button
            onClick={onOpenDrawer}
            aria-label="Open Navigation Menu"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-transform shadow-xs shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Voice Assistant Button */}
          <button
            onClick={onOpenVoiceAssistant}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all"
            title="Voice Assistant for managing projects"
          >
            <Mic className="w-4 h-4 animate-pulse" />
            <span className="hidden sm:inline">{t.voiceAssistant}</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 relative transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{t.recentAlerts}</span>
                  <span className="text-[10px] text-blue-600 font-semibold cursor-pointer" onClick={() => setShowNotifications(false)}>
                    {t.markAllRead}
                  </span>
                </div>
                <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                  <div className="p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 text-xs">
                    <div className="font-semibold text-blue-950 dark:text-blue-200">{t.shiftStarted}</div>
                    <div className="text-slate-600 dark:text-slate-400 text-[11px]">{t.shiftStartedMsg}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-xs">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{t.salesDealWon}</div>
                    <div className="text-slate-600 dark:text-slate-400 text-[11px]">{t.salesDealWonMsg}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PWA Install Button */}
          <PWAInstallButton lang={lang} variant="compact" />

          {/* Telegram & WebPush Alerts Settings Button */}
          {onOpenAlerts && (
            <button
              onClick={onOpenAlerts}
              aria-label="Alerts & Telegram Integration"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-400 transition-colors"
              title="Alerts, WebPush & Telegram Bot"
            >
              <Bell className="w-5 h-5" />
            </button>
          )}

          {/* Account & Password Settings */}
          {onOpenAccountSettings && (
            <button
              onClick={onOpenAccountSettings}
              aria-label="Manage Account & Password"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title={t.manageAccount}
            >
              <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
