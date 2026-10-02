import React, { useState } from 'react';
import {
  CreditCard,
  CalendarCheck,
  Coffee,
  Umbrella,
  Copy,
  Check,
  ArrowRight,
  Fingerprint,
  Calendar,
  Sparkles,
  Clock
} from 'lucide-react';
import { CianPunchState, ActiveTab, Language } from '../types';
import { translations } from '../i18n/translations';

interface EmployeeDashboardProps {
  punchState: CianPunchState;
  onNavigateTab: (tab: ActiveTab) => void;
  onRequestLeave: () => void;
  lang?: Language;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  punchState,
  onNavigateTab,
  onRequestLeave,
  lang = 'en'
}) => {
  const t = translations[lang];
  const [copiedCode, setCopiedCode] = useState(false);

  const copyEmployeeCode = () => {
    navigator.clipboard.writeText('EMP-1780778608260');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isClockedIn = punchState.clockedIn;
  const breakCount = punchState.breaksToday.length;

  return (
    <div className="flex flex-col min-h-full px-4 sm:px-8 py-5 pb-24 max-w-5xl mx-auto w-full">
      {/* Greeting Header matching screenshot 4 */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.goodAfternoon}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Cian</h2>
            <span className="text-xl">👋</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {lang === 'km' ? 'អ្នកឯកទេសពាណិជ្ជកម្មជាន់ខ្ពស់ · ផ្នែកទីផ្សារ' : 'Senior Ads Specialist · Marketing'}
          </p>
        </div>

        {/* Avatar 'C' */}
        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-lg ring-4 ring-blue-50 dark:ring-slate-800">
          C
        </div>
      </div>

      {/* Employee Code Card matching screenshot 4 */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">{t.employeeCode}</div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono tracking-tight">
              EMP-1780778608260
            </div>
          </div>
        </div>

        <button
          onClick={copyEmployeeCode}
          aria-label="Copy employee code"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          title="Copy Code"
        >
          {copiedCode ? (
            <Check className="w-4 h-4 text-emerald-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Quick Status Badges matching screenshot 4 */}
      <div className="flex items-center gap-2 mb-6">
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            isClockedIn
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
              : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-400'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isClockedIn ? 'bg-emerald-500 animate-pulse' : 'border border-slate-400'
            }`}
          />
          <span>{isClockedIn ? `${t.clockedInAt} ${punchState.clockInTime}` : t.noPunchYet}</span>
        </div>

        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            punchState.onBreak
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
              : 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>
            {punchState.onBreak
              ? (lang === 'km' ? 'កំពុងសម្រាក' : 'Break in progress')
              : breakCount > 0
              ? `${breakCount} ${t.breaksLogged}`
              : t.noBreaksYet}
          </span>
        </div>
      </div>

      {/* Today at a Glance Section matching screenshot 4 */}
      <div className="space-y-3 mb-6">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {t.todayAtAGlance}
        </h3>

        {/* Item 1: Attendance */}
        <div
          onClick={() => onNavigateTab('clock')}
          className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs cursor-pointer hover:border-blue-200 dark:hover:border-slate-600 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">{t.attendance}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span>
              {isClockedIn
                ? `${t.clockedInAt} ${punchState.clockInTime} (${punchState.currentLocation}).`
                : (lang === 'km' ? 'មិនទាន់មានទិន្នន័យកត់ត្រាទេ — សូមចុចចូលធ្វើការ' : 'Nothing recorded yet — clock in from Workforce.')}
            </span>
          </div>
        </div>

        {/* Item 2: Breaks */}
        <div
          onClick={() => onNavigateTab('clock')}
          className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs cursor-pointer hover:border-blue-200 dark:hover:border-slate-600 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Coffee className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">{lang === 'km' ? 'ការសម្រាក' : 'Breaks'}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {punchState.onBreak
              ? (lang === 'km' ? `កំពុងសម្រាក (ចាប់ផ្តើមម៉ោង ${punchState.breakStartTime})` : `Currently on break (started at ${punchState.breakStartTime}).`)
              : breakCount > 0
              ? (lang === 'km' ? `បានសម្រាក ${breakCount} ដងថ្ងៃនេះ (${punchState.breaksToday.reduce((a, b) => a + b.durationMinutes, 0)} នាទីសរុប)` : `${breakCount} break logged today (${punchState.breaksToday.reduce((a, b) => a + b.durationMinutes, 0)}m total).`)
              : t.noBreaksYet}
          </p>
        </div>

        {/* Item 3: Leave */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Umbrella className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">{t.leave}</span>
            </div>
            <button
              onClick={onRequestLeave}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              + {t.applyBtn}
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.noPendingLeave} {t.annualBalanceMsg}
          </p>
        </div>
      </div>

      {/* Fast CTA Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-white">{t.readyToLogTime}</h4>
          <p className="text-[11px] text-blue-100 mt-0.5">
            {isClockedIn ? t.shiftActiveMsg : t.clockIn1Tap}
          </p>
        </div>
        <button
          onClick={() => onNavigateTab('clock')}
          className="px-4 py-2 rounded-xl bg-white text-blue-600 font-bold text-xs shadow-xs hover:bg-blue-50 active:scale-95 transition-transform flex items-center gap-1.5"
        >
          <Fingerprint className="w-4 h-4" />
          <span>{isClockedIn ? t.clockOut : t.clockIn}</span>
        </button>
      </div>
    </div>
  );
};
