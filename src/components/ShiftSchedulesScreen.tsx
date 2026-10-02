import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Clock,
  Coffee,
  UtensilsCrossed,
  LogOut,
  LogIn,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { ShiftItem, ShiftTimelineItem, Language } from '../types';
import { translations } from '../i18n/translations';

interface ShiftSchedulesScreenProps {
  shifts: ShiftItem[];
  onBackToDashboard: () => void;
  lang?: Language;
  onUpdateTimelineItem?: (shiftId: string, itemId: string) => void;
}

export const ShiftSchedulesScreen: React.FC<ShiftSchedulesScreenProps> = ({
  shifts,
  onBackToDashboard,
  lang = 'en'
}) => {
  const t = translations[lang];
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(2);
  const [shiftList, setShiftList] = useState<ShiftItem[]>(shifts);

  const daysHeader = [
    { name: t.mon, num: 5, hasShift: true },
    { name: t.tue, num: 6, hasShift: true },
    { name: t.wed, num: 7, hasShift: true },
    { name: t.thu, num: 8, hasShift: true },
    { name: t.fri, num: 9, hasShift: true },
    { name: t.sat, num: 10, hasShift: false },
    { name: t.sun, num: 11, hasShift: false },
  ];

  const currentShift = shiftList[selectedDayIndex] || shiftList[0];

  const toggleTimeline = (itemId: string) => {
    setShiftList(prev =>
      prev.map((s, idx) => {
        if (idx !== selectedDayIndex) return s;
        return {
          ...s,
          timeline: s.timeline.map(t => (t.id === itemId ? { ...t, completed: !t.completed } : t))
        };
      })
    );
  };

  return (
    <div className="flex flex-col min-h-full px-4 sm:px-8 py-5 pb-24 max-w-5xl mx-auto w-full">
      {/* Week Navigator */}
      <div className="flex items-center justify-between mt-1 mb-4">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {t.weekOf} Oct 5 – Oct 11, 2026
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedDayIndex(prev => Math.max(0, prev - 1))}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedDayIndex(prev => Math.min(daysHeader.length - 1, prev + 1))}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days Horizontal Carousel Row */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-3 mb-6">
        {daysHeader.map((day, idx) => {
          const isSelected = idx === selectedDayIndex;
          return (
            <button
              key={day.name}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex flex-col items-center py-2.5 px-1 rounded-2xl transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105 ring-2 ring-blue-500/20'
                  : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-100 dark:border-slate-800'
              }`}
            >
              <span className={`text-[11px] font-medium ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                {day.name}
              </span>
              <span className="text-sm font-bold mt-1 font-mono">{day.num}</span>
              {day.hasShift && (
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                    isSelected ? 'bg-white' : 'bg-blue-500'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Today's Shift Card (Rich Blue Gradient) */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-sky-500 text-white p-5 sm:p-6 shadow-xl shadow-blue-500/20 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-blue-100">{t.todaysShift}</span>
            <h3 className="text-xl sm:text-2xl font-bold mt-0.5 tracking-tight text-white">
              {currentShift ? currentShift.role : 'Senior Ads Specialist'}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* 4-Column Metric Row */}
        <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-white/20 text-center">
          <div>
            <div className="text-[10px] uppercase font-semibold text-blue-100 tracking-wider">{t.start}</div>
            <div className="text-xs sm:text-sm font-bold font-mono mt-1">{currentShift?.startTime || '9:00 AM'}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-blue-100 tracking-wider">{t.end}</div>
            <div className="text-xs sm:text-sm font-bold font-mono mt-1">{currentShift?.endTime || '5:00 PM'}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-blue-100 tracking-wider">{t.hours}</div>
            <div className="text-xs sm:text-sm font-bold font-mono mt-1">8h 00m</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-blue-100 tracking-wider">{t.location}</div>
            <div className="text-xs sm:text-sm font-bold mt-1 truncate">{currentShift?.location || 'Marketing'}</div>
          </div>
        </div>

        {/* Bottom Shift Status Pill */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{t.shiftStartsToday}</span>
          </div>
        </div>
      </div>

      {/* Shift Timeline Card */}
      <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-xs mb-6">
        <div className="flex items-center justify-between mb-5">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.shiftTimeline}</h4>
          <span className="text-[11px] text-slate-400">{t.clickStepToToggle}</span>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
          {/* Step 1: Clock In */}
          <div
            onClick={() => toggleTimeline('t1')}
            className="relative flex items-center justify-between cursor-pointer group"
          >
            <div className="absolute -left-6 top-0.5 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center ring-4 ring-white dark:ring-slate-800">
              <LogIn className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600">
                {t.clockIn}
              </h5>
              <p className="text-[11px] text-slate-400">{t.scheduledArrival}</p>
            </div>
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
              9:00 AM
            </span>
          </div>

          {/* Step 2: Short Break */}
          <div
            onClick={() => toggleTimeline('t2')}
            className="relative flex items-center justify-between cursor-pointer group"
          >
            <div className="absolute -left-6 top-0.5 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center ring-4 ring-white dark:ring-slate-800">
              <Coffee className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600">
                {t.shortBreak}
              </h5>
              <p className="text-[11px] text-slate-400">{t.coffeeBreak}</p>
            </div>
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
              10:15 AM
            </span>
          </div>

          {/* Step 3: Lunch Break */}
          <div
            onClick={() => toggleTimeline('t3')}
            className="relative flex items-center justify-between cursor-pointer group"
          >
            <div className="absolute -left-6 top-0.5 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center ring-4 ring-white dark:ring-slate-800">
              <UtensilsCrossed className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600">
                {t.lunchBreak}
              </h5>
              <p className="text-[11px] text-slate-400">{t.cafeteriaBreak}</p>
            </div>
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
              01:00 PM
            </span>
          </div>

          {/* Step 4: Clock Out */}
          <div
            onClick={() => toggleTimeline('t4')}
            className="relative flex items-center justify-between cursor-pointer group"
          >
            <div className="absolute -left-6 top-0.5 w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center ring-4 ring-white dark:ring-slate-800">
              <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600">
                {t.clockOut}
              </h5>
              <p className="text-[11px] text-slate-400">{t.shiftCompletion}</p>
            </div>
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
              5:00 PM
            </span>
          </div>
        </div>
      </div>

      {/* Week Overview Metric */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.thisWeekCommitment}</h5>
            <p className="text-[11px] text-slate-500">{t.shiftsScheduledMsg}</p>
          </div>
        </div>
        <span className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full">
          {t.onTrack100}
        </span>
      </div>
    </div>
  );
};
