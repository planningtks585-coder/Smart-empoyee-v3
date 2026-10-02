import React, { useState, useEffect } from 'react';
import {
  LogIn,
  LogOut,
  History,
  Clock,
  MapPin,
  Coffee,
  Utensils,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ChevronDown,
  Pencil,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { CianPunchState, AttendanceRecord, LocationSite, Language, ShiftType } from '../types';
import { translations } from '../i18n/translations';

interface ClockInOutScreenProps {
  punchState: CianPunchState;
  attendanceHistory: AttendanceRecord[];
  locations: LocationSite[];
  onClockIn: (location: string, notes: string, shiftType?: ShiftType) => Promise<void>;
  onClockOut: (notes: string) => Promise<void>;
  onToggleBreak: (type: 'short' | 'lunch') => Promise<void>;
  onUpdateAttendance?: (id: string, data: Partial<AttendanceRecord>) => Promise<void>;
  lang?: Language;
}

export const ClockInOutScreen: React.FC<ClockInOutScreenProps> = ({
  punchState,
  attendanceHistory,
  locations,
  onClockIn,
  onClockOut,
  onToggleBreak,
  onUpdateAttendance,
  lang = 'en'
}) => {
  const t = translations[lang];
  const [selectedLocation, setSelectedLocation] = useState<string>(punchState.currentLocation || 'Marketing Hub Creative Space (ទួលគោក)');
  
  // Default shift selection based on current hour: Morning (< 12:30 PM), else Evening
  const initialShift: ShiftType = punchState.shiftType || (new Date().getHours() < 12 ? 'morning' : 'evening');
  const [selectedShift, setSelectedShift] = useState<ShiftType>(initialShift);
  
  const [notes, setNotes] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Edit attendance record state
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [editClockIn, setEditClockIn] = useState('');
  const [editClockOut, setEditClockOut] = useState('');
  const [editHours, setEditHours] = useState('8');
  const [editMinutes, setEditMinutes] = useState('0');
  const [editNotes, setEditNotes] = useState('');

  const handleOpenEditRecord = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setEditClockIn(rec.clockIn || '09:00 AM');
    setEditClockOut(rec.clockOut || '05:00 PM');
    const h = Math.floor(rec.totalMinutes / 60);
    const m = rec.totalMinutes % 60;
    setEditHours(String(h > 0 ? h : 8));
    setEditMinutes(String(m));
    setEditNotes(rec.notes || '');
  };

  const handleSaveEditRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !onUpdateAttendance) return;
    const h = Math.max(0, parseInt(editHours, 10) || 0);
    const m = Math.max(0, Math.min(59, parseInt(editMinutes, 10) || 0));
    await onUpdateAttendance(editingRecord.id, {
      clockIn: editClockIn,
      clockOut: editClockOut,
      totalMinutes: h * 60 + m,
      notes: editNotes
    });
    setEditingRecord(null);
  };

  // Live real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString(lang === 'km' ? 'km-KH' : 'en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  const handleClockInAction = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onClockIn(selectedLocation, notes, selectedShift);
      setActionSuccess(`${t.successClockIn} (${selectedShift === 'morning' ? t.morningShift : t.eveningShift})`);
      setNotes('');
      setTimeout(() => setActionSuccess(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOutAction = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onClockOut(notes);
      setActionSuccess(t.successClockOut);
      setNotes('');
      setTimeout(() => setActionSuccess(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleBreakAction = async (type: 'short' | 'lunch') => {
    if (loading) return;
    setLoading(true);
    try {
      await onToggleBreak(type);
      setActionSuccess(punchState.onBreak ? t.breakEnded : `${t.breakStarted} (${type === 'lunch' ? 'Lunch' : 'Short'})`);
      setTimeout(() => setActionSuccess(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const isClockedIn = punchState.clockedIn;

  return (
    <div className="flex flex-col min-h-full px-4 sm:px-8 py-5 pb-24 max-w-4xl mx-auto w-full">
      {/* Notifications feedback banner */}
      {actionSuccess && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Live Date / Time Badge */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-mono tabular-nums tracking-wide">{currentTime || '09:00:00 AM'}</span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">{currentDate}</p>
      </div>

      {/* Standard Shift System Selector (Morning / Evening Shift) */}
      <div className="mb-5 max-w-lg mx-auto w-full bg-slate-100 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/80">
        <div className="flex items-center justify-between px-2 pb-1.5 pt-0.5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t.selectShift}
          </span>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
            {isClockedIn ? `Active: ${punchState.shiftType === 'evening' ? t.eveningShift : t.morningShift}` : 'Choose Shift'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            disabled={isClockedIn}
            onClick={() => setSelectedShift('morning')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              (isClockedIn ? punchState.shiftType !== 'evening' : selectedShift === 'morning')
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-700/60'
            } ${isClockedIn ? 'opacity-80' : ''}`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-950" />
            <div className="text-left">
              <div>{t.morningShift}</div>
              <div className="text-[9px] opacity-80 font-normal">08:30 AM - 05:30 PM</div>
            </div>
          </button>

          <button
            type="button"
            disabled={isClockedIn}
            onClick={() => setSelectedShift('evening')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              (isClockedIn ? punchState.shiftType === 'evening' : selectedShift === 'evening')
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-700/60'
            } ${isClockedIn ? 'opacity-80' : ''}`}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-200" />
            <div className="text-left">
              <div>{t.eveningShift}</div>
              <div className="text-[9px] opacity-80 font-normal">01:30 PM - 09:30 PM</div>
            </div>
          </button>
        </div>
      </div>

      {/* Top 2 Action Buttons matching screenshot 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 max-w-lg mx-auto w-full">
        <button
          onClick={handleClockInAction}
          disabled={loading || isClockedIn}
          className={`py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
            isClockedIn
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-blue-500/25 active:scale-[0.98]'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>{t.clockIn}</span>
        </button>

        <button
          onClick={handleClockOutAction}
          disabled={loading || !isClockedIn}
          className={`py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
            !isClockedIn
              ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs active:scale-[0.98]'
          }`}
        >
          <LogOut className="w-4 h-4" />
          <span>{t.clockOut}</span>
        </button>
      </div>

      {/* Attendance History Link */}
      <div className="text-center mb-6">
        <button
          onClick={() => setShowHistoryModal(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <History className="w-4 h-4" />
          <span>{t.attendanceHistory}</span>
        </button>
      </div>

      {/* Center Biometric/Clock Graphic Circle from screenshot 2 */}
      <div className="flex-1 flex flex-col items-center justify-center my-6">
        <div className="relative flex items-center justify-center">
          {isClockedIn && (
            <div className="absolute w-44 h-44 rounded-full bg-blue-500/15 animate-ping" />
          )}
          <div className="absolute w-40 h-40 rounded-full bg-blue-500/10 dark:bg-blue-400/10" />

          {/* Main interactive circular clock button */}
          <button
            onClick={() => {
              if (isClockedIn) {
                handleClockOutAction();
              } else {
                handleClockInAction();
              }
            }}
            disabled={loading}
            aria-label="Clock in or out trigger"
            className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl shadow-blue-500/35 flex items-center justify-center active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 rounded-full border-2 border-white/90 flex items-center justify-center">
              <Clock className="w-8 h-8 text-white stroke-[2.5]" />
            </div>
          </button>
        </div>

        <h3 className="mt-6 text-lg font-bold text-slate-800 dark:text-white tracking-tight">
          {t.clockInOut}
        </h3>

        <div className="mt-1 flex items-center gap-1.5 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              isClockedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {isClockedIn
              ? `${t.activeClockedInAt} ${punchState.clockInTime || '09:00 AM'}`
              : t.notPunchedToday}
          </span>
        </div>
      </div>

      {/* Break Controls when Clocked In */}
      {isClockedIn && (
        <div className="mb-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 max-w-lg mx-auto w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{t.breakManagement}</span>
            {punchState.onBreak && (
              <span className="text-[11px] font-semibold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full">
                {punchState.breakType === 'lunch' ? t.endLunch : t.endShortBreak}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleBreakAction('short')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                punchState.onBreak && punchState.breakType === 'short'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50'
              }`}
            >
              <Coffee className="w-3.5 h-3.5 text-amber-500" />
              <span>{punchState.onBreak && punchState.breakType === 'short' ? t.endShortBreak : t.shortBreak}</span>
            </button>

            <button
              onClick={() => handleBreakAction('lunch')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                punchState.onBreak && punchState.breakType === 'lunch'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50'
              }`}
            >
              <Utensils className="w-3.5 h-3.5 text-orange-500" />
              <span>{punchState.onBreak && punchState.breakType === 'lunch' ? t.endLunch : t.lunchBreak}</span>
            </button>
          </div>
        </div>
      )}

      {/* Location & Shift Notes Section */}
      <div className="space-y-3 bg-white dark:bg-slate-800/60 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs max-w-lg mx-auto w-full">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            {t.workLocation}
          </label>
          <div className="relative">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full pl-8 pr-8 py-2.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-800 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
            <MapPin className="w-4 h-4 text-blue-500 absolute left-2.5 top-3 pointer-events-none" />
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            {t.shiftNotes}
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.shiftNotesPlaceholder}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Attendance History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.attendanceHistory}</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1"
              >
                {t.close}
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {attendanceHistory.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">{t.noHistoryPunches}</div>
              ) : (
                attendanceHistory.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{rec.employeeName}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          rec.shiftType === 'evening'
                            ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        }`}>
                          {rec.shiftType === 'evening' ? 'Evening 🌙' : 'Morning ☀️'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{rec.date}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 mt-2">
                      <div>
                        <span className="text-slate-400">{t.clockIn}: </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{rec.clockIn}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">{t.clockOut}: </span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">{rec.clockOut || t.inProgress}</span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[170px]">{rec.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">
                          {rec.totalMinutes > 0 ? `${(rec.totalMinutes / 60).toFixed(1)} ${t.hours}` : t.inProgress}
                        </span>
                        {onUpdateAttendance && (
                          <button
                            onClick={() => handleOpenEditRecord(rec)}
                            className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600 transition-colors"
                            title={t.editAttendanceRecord}
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Record Modal in Clock Screen */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.editAttendanceRecord}
              </h4>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditRecord} className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">{t.clockInTime}</label>
                  <input
                    type="text"
                    value={editClockIn}
                    onChange={e => setEditClockIn(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">{t.clockOutTime}</label>
                  <input
                    type="text"
                    value={editClockOut}
                    onChange={e => setEditClockOut(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">{t.totalHoursWorked}</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={editHours}
                      onChange={e => setEditHours(e.target.value)}
                      className="w-full bg-transparent text-xs font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-400 font-bold ml-1">{t.hoursLabel}</span>
                  </div>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={editMinutes}
                      onChange={e => setEditMinutes(e.target.value)}
                      className="w-full bg-transparent text-xs font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-400 font-bold ml-1">{t.minutesLabel}</span>
                  </div>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-500"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  {t.saveAttendance}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
