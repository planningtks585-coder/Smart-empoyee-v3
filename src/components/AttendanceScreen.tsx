import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  MapPin,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock4,
  Pencil,
  Plus,
  X,
  RotateCcw,
  Check,
  Trash2,
  Calendar,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { AttendanceRecord, Language, Employee, Department } from '../types';
import { translations } from '../i18n/translations';

interface AttendanceScreenProps {
  records: AttendanceRecord[];
  lang?: Language;
  onUpdateRecord?: (recordId: string, data: Partial<AttendanceRecord>) => Promise<void>;
  onAddRecord?: (data: Partial<AttendanceRecord>) => Promise<void>;
  onDeleteRecord?: (recordId: string) => Promise<void>;
  employees?: Employee[];
  departments?: Department[];
}

export const AttendanceScreen: React.FC<AttendanceScreenProps> = ({
  records,
  lang = 'en',
  onUpdateRecord,
  onAddRecord,
  onDeleteRecord,
  employees = [],
  departments = []
}) => {
  const t = translations[lang];

  // Ledger Filter States
  const [statusFilter, setStatusFilter] = useState<'all' | 'on_time' | 'late' | 'overtime' | 'active'>('all');
  const [datePreset, setDatePreset] = useState<'all' | 'today' | 'yesterday' | 'week' | 'custom'>('all');
  const [customDate, setCustomDate] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Editing attendance record state
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [editClockIn, setEditClockIn] = useState('');
  const [editClockOut, setEditClockOut] = useState('');
  const [editHours, setEditHours] = useState('8');
  const [editMinutes, setEditMinutes] = useState('0');
  const [editStatus, setEditStatus] = useState<'on_time' | 'late' | 'overtime'>('on_time');
  const [editNotes, setEditNotes] = useState('');
  const [editLocation, setEditLocation] = useState('');

  // Deleting attendance record state
  const [deletingRecord, setDeletingRecord] = useState<AttendanceRecord | null>(null);

  // Manual record modal state
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState('Cian');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualClockIn, setManualClockIn] = useState('09:00 AM');
  const [manualClockOut, setManualClockOut] = useState('05:00 PM');
  const [manualHours, setManualHours] = useState('8');
  const [manualMinutes, setManualMinutes] = useState('0');
  const [manualLocation, setManualLocation] = useState('Marketing Landmark HQ');
  const [manualNotes, setManualNotes] = useState('');
  const [manualStatus, setManualStatus] = useState<'on_time' | 'late' | 'overtime'>('on_time');

  const [notice, setNotice] = useState<string | null>(null);

  const triggerNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  // Distinct locations
  const availableLocations = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.location) set.add(r.location);
    });
    return Array.from(set);
  }, [records]);

  // Distinct departments
  const departmentsList = useMemo(() => {
    const set = new Set<string>();
    departments.forEach(d => set.add(d.name));
    employees.forEach(e => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set);
  }, [departments, employees]);

  // Today & Yesterday string calculation
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }, []);

  // Filtered Records Calculation
  const filtered = useMemo(() => {
    return records.filter(r => {
      // Status Filter
      if (statusFilter === 'active') {
        if (r.clockOut) return false;
      } else if (statusFilter !== 'all') {
        if (r.status !== statusFilter) return false;
      }

      // Department Filter
      if (deptFilter !== 'all') {
        const emp = employees.find(e => e.id === r.employeeId || e.name.toLowerCase() === r.employeeName.toLowerCase());
        if (emp && emp.department !== deptFilter) return false;
      }

      // Location Filter
      if (locationFilter !== 'all' && r.location !== locationFilter) {
        return false;
      }

      // Date Preset Filter
      if (datePreset === 'today') {
        if (r.date !== todayStr) return false;
      } else if (datePreset === 'yesterday') {
        if (r.date !== yesterdayStr) return false;
      } else if (datePreset === 'custom' && customDate) {
        if (r.date !== customDate) return false;
      } else if (datePreset === 'week') {
        // Last 7 days
        const recDate = new Date(r.date).getTime();
        const now = Date.now();
        const diffDays = (now - recDate) / (1000 * 3600 * 24);
        if (diffDays > 7 || diffDays < 0) return false;
      }

      // Search Query
      if (search) {
        const q = search.toLowerCase();
        const matches =
          r.employeeName.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.notes.toLowerCase().includes(q) ||
          r.date.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [records, statusFilter, deptFilter, datePreset, customDate, locationFilter, search, todayStr, yesterdayStr, employees]);

  // Summary Metrics for Active View
  const ledgerMetrics = useMemo(() => {
    let totalMins = 0;
    let onTimeCount = 0;
    let lateCount = 0;

    filtered.forEach(r => {
      totalMins += r.totalMinutes || (r.clockOut ? 480 : 240);
      if (r.status === 'on_time') onTimeCount++;
      if (r.status === 'late') lateCount++;
    });

    const onTimeRate = filtered.length > 0 ? Math.round((onTimeCount / filtered.length) * 100) : 100;

    return {
      totalHours: (totalMins / 60).toFixed(1),
      onTimeRate,
      lateCount
    };
  }, [filtered]);

  const hasActiveFilters =
    statusFilter !== 'all' ||
    deptFilter !== 'all' ||
    datePreset !== 'all' ||
    customDate !== '' ||
    locationFilter !== 'all' ||
    search !== '';

  const clearAllFilters = () => {
    setStatusFilter('all');
    setDeptFilter('all');
    setDatePreset('all');
    setCustomDate('');
    setLocationFilter('all');
    setSearch('');
  };

  const handleOpenEdit = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setEditClockIn(rec.clockIn || '09:00 AM');
    setEditClockOut(rec.clockOut || '05:00 PM');
    const h = Math.floor((rec.totalMinutes || 0) / 60);
    const m = (rec.totalMinutes || 0) % 60;
    setEditHours(String(h > 0 ? h : 8));
    setEditMinutes(String(m));
    setEditStatus(rec.status || 'on_time');
    setEditNotes(rec.notes || '');
    setEditLocation(rec.location || 'Marketing Landmark HQ');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !onUpdateRecord) return;
    const h = Math.max(0, parseInt(editHours, 10) || 0);
    const m = Math.max(0, Math.min(59, parseInt(editMinutes, 10) || 0));
    const totalMins = h * 60 + m;

    try {
      await onUpdateRecord(editingRecord.id, {
        clockIn: editClockIn,
        clockOut: editClockOut,
        totalMinutes: totalMins,
        status: editStatus,
        notes: editNotes,
        location: editLocation
      });
      triggerNotice(`Updated attendance punch for ${editingRecord.employeeName}`);
      setEditingRecord(null);
    } catch (err: any) {
      console.error(err);
      triggerNotice(err.message || 'Failed to update attendance');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRecord || !onDeleteRecord) return;
    try {
      await onDeleteRecord(deletingRecord.id);
      triggerNotice(`Deleted attendance log for ${deletingRecord.employeeName} (${deletingRecord.date})`);
      setDeletingRecord(null);
    } catch (err: any) {
      console.error(err);
      triggerNotice(err.message || 'Failed to delete attendance log');
    }
  };

  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddRecord) return;
    const h = Math.max(0, parseInt(manualHours, 10) || 0);
    const m = Math.max(0, Math.min(59, parseInt(manualMinutes, 10) || 0));
    const totalMins = h * 60 + m;

    try {
      await onAddRecord({
        employeeName: manualName,
        date: manualDate,
        clockIn: manualClockIn,
        clockOut: manualClockOut,
        totalMinutes: totalMins,
        location: manualLocation,
        notes: manualNotes,
        status: manualStatus
      });
      triggerNotice(`Manual attendance logged for ${manualName}`);
      setShowManualModal(false);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-full px-4 sm:px-8 py-6 pb-24 max-w-7xl mx-auto w-full space-y-6">
      {/* 1. Header with Title & Add Manual Record */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Workforce Management</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-white">Attendance Operations</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            {t.attendanceLedger}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time workforce punches, punctuality tracking, and verified work duration
          </p>
        </div>

        {onAddRecord && (
          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t.manualAttendanceRecord}</span>
          </button>
        )}
      </div>

      {/* Global Feedback Banner */}
      {notice && (
        <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. SUMMARY KPI STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Filtered Logs</span>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
            {filtered.length} <span className="text-xs text-slate-400 font-sans font-normal">records</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Duration</span>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
            {ledgerMetrics.totalHours} <span className="text-xs text-slate-400 font-sans font-normal">hrs</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Punctuality Rate</span>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
            {ledgerMetrics.onTimeRate}%
          </div>
        </div>

        <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Late Check-ins</span>
          <div className="text-xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-0.5">
            {ledgerMetrics.lateCount}
          </div>
        </div>
      </div>

      {/* 3. ATTENDANCE LEDGER FILTER BAR */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Attendance Ledger Filters
            </span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Attendance Status
            </label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium"
            >
              <option value="all">All Statuses ({records.length})</option>
              <option value="on_time">On Time</option>
              <option value="late">Late Check-ins</option>
              <option value="overtime">Overtime</option>
              <option value="active">Active On Shift</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Department
            </label>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium"
            >
              <option value="all">All Departments</option>
              {departmentsList.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Date Preset Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Date Period
            </label>
            <select
              value={datePreset}
              onChange={e => setDatePreset(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium"
            >
              <option value="all">All Available Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Past 7 Days</option>
              <option value="custom">Exact Calendar Date...</option>
            </select>
          </div>

          {/* Specific Custom Date Picker (when custom selected or directly available) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Filter by Exact Date
            </label>
            <input
              type="date"
              value={customDate}
              onChange={e => {
                setCustomDate(e.target.value);
                setDatePreset('custom');
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
            />
          </div>

          {/* Location Site Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Work Location Site
            </label>
            <select
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium"
            >
              <option value="all">All Locations</option>
              {availableLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search bar inside Ledger */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search ledger by employee name, location, or notes..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 4. ATTENDANCE LEDGER TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Clock In / Clock Out</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums">
              {filtered.map(rec => (
                <tr
                  key={rec.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Employee Name */}
                  <td className="py-3 px-4 font-sans font-semibold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
                        {rec.employeeName.charAt(0)}
                      </div>
                      <span className="truncate">{rec.employeeName}</span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-3 px-4 text-slate-500">
                    {rec.date}
                  </td>

                  {/* Timestamps */}
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">
                    {rec.clockIn} → {rec.clockOut || (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-sans">
                        Active Now
                      </span>
                    )}
                  </td>

                  {/* Duration */}
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-bold">
                    {(rec.totalMinutes / 60).toFixed(1)} hrs
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 font-sans">
                    {rec.status === 'on_time' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>On Time</span>
                      </span>
                    ) : rec.status === 'late' ? (
                      <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span>Late</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-purple-700 dark:text-purple-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                        <span>Overtime</span>
                      </span>
                    )}
                  </td>

                  {/* Location */}
                  <td className="py-3 px-4 font-sans text-slate-500 dark:text-slate-400 truncate max-w-xs">
                    <div className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{rec.location}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right font-sans">
                    <div className="flex items-center justify-end gap-1.5">
                      {onUpdateRecord && (
                        <button
                          onClick={() => handleOpenEdit(rec)}
                          className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 transition-colors"
                          title="Edit Punch Record"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteRecord && (
                        <button
                          onClick={() => setDeletingRecord(rec)}
                          className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 hover:text-rose-700 transition-colors"
                          title="Delete Punch Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs font-sans">
                    No attendance records match the current filter selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: EDIT ATTENDANCE */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Edit Attendance Log: {editingRecord.employeeName}
                </h3>
                <p className="text-[11px] font-mono text-slate-400">{editingRecord.date}</p>
              </div>
              <button onClick={() => setEditingRecord(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Clock In Time
                  </label>
                  <input
                    type="text"
                    value={editClockIn}
                    onChange={e => setEditClockIn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Clock Out Time
                  </label>
                  <input
                    type="text"
                    value={editClockOut}
                    onChange={e => setEditClockOut(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Total Hours Worked
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={editHours}
                    onChange={e => setEditHours(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <option value="on_time">On Time</option>
                    <option value="late">Late</option>
                    <option value="overtime">Overtime</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Location Site
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={e => setEditLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Correction Audit Notes
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="e.g. Adjusted with manager approval"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-3.5 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs"
                >
                  Save Corrections
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: DELETE PUNCH CONFIRMATION */}
      {deletingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Delete Attendance Entry
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Permanently remove attendance log for <strong className="text-slate-900 dark:text-white">{deletingRecord.employeeName}</strong> on <span className="font-mono">{deletingRecord.date}</span>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingRecord(null)}
                className="px-3.5 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs"
              >
                Delete Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: MANUAL ATTENDANCE PUNCH */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.manualAttendanceRecord}
              </h3>
              <button onClick={() => setShowManualModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Employee Name *
                </label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={manualDate}
                  onChange={e => setManualDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Clock In
                  </label>
                  <input
                    type="text"
                    value={manualClockIn}
                    onChange={e => setManualClockIn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Clock Out
                  </label>
                  <input
                    type="text"
                    value={manualClockOut}
                    onChange={e => setManualClockOut(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={manualHours}
                    onChange={e => setManualHours(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={manualStatus}
                    onChange={e => setManualStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <option value="on_time">On Time</option>
                    <option value="late">Late</option>
                    <option value="overtime">Overtime</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Location Site
                </label>
                <input
                  type="text"
                  value={manualLocation}
                  onChange={e => setManualLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Audit Notes
                </label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={e => setManualNotes(e.target.value)}
                  placeholder="e.g. Field photography assignment"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
