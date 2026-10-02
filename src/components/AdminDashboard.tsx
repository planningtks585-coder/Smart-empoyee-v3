import React, { useState, useMemo } from 'react';
import {
  Users,
  CheckCircle2,
  BarChart3,
  Umbrella,
  Clock,
  Sparkles,
  TrendingUp,
  Building,
  FileSpreadsheet,
  ChevronRight,
  Shield,
  Plus,
  Search,
  Filter,
  AlertCircle,
  Clock4,
  MapPin,
  Calendar,
  Check,
  X,
  RefreshCw,
  FolderKanban,
  DollarSign,
  ArrowUpRight,
  UserCheck,
  CalendarCheck
} from 'lucide-react';
import {
  AppMetrics,
  ActiveTab,
  AttendanceRecord,
  Language,
  Employee,
  DepartmentItem,
  LeaveRequest,
  Project,
  ShiftItem
} from '../types';
import { translations } from '../i18n/translations';

interface AdminDashboardProps {
  metrics: AppMetrics;
  recentAttendance: AttendanceRecord[];
  onNavigateTab: (tab: ActiveTab) => void;
  lang?: Language;
  employees?: Employee[];
  departments?: DepartmentItem[];
  leaveRequests?: LeaveRequest[];
  projects?: Project[];
  weeklyShifts?: ShiftItem[];
  onUpdateLeaveStatus?: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  onAddManualAttendance?: (data: any) => Promise<void>;
  onRefreshState?: () => Promise<void> | void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  metrics,
  recentAttendance,
  onNavigateTab,
  lang = 'en',
  employees = [],
  departments = [],
  leaveRequests = [],
  projects = [],
  weeklyShifts = [],
  onUpdateLeaveStatus,
  onAddManualAttendance,
  onRefreshState
}) => {
  const t = translations[lang];

  // Filters for Live Workforce Roster
  const [rosterFilter, setRosterFilter] = useState<'all' | 'working' | 'leave' | 'late'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isManualPunchOpen, setIsManualPunchOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Manual Punch Form State
  const [punchEmpId, setPunchEmpId] = useState(employees[0]?.id || 'emp_cian');
  const [punchDate, setPunchDate] = useState(new Date().toISOString().split('T')[0]);
  const [punchClockIn, setPunchClockIn] = useState('09:00 AM');
  const [punchClockOut, setPunchClockOut] = useState('05:00 PM');
  const [punchLocation, setPunchLocation] = useState('Marketing Landmark HQ');
  const [punchStatus, setPunchStatus] = useState<'on_time' | 'late' | 'overtime'>('on_time');

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Pending Leave Requests
  const pendingLeaves = useMemo(() => {
    return leaveRequests.filter(r => r.status === 'pending');
  }, [leaveRequests]);

  // Calculate Today's Labor & Payroll Metrics
  const { totalLoggedHours, estimatedPayrollToday } = useMemo(() => {
    let totalMinutes = 0;
    let totalCost = 0;

    recentAttendance.forEach(rec => {
      // Find matching employee for hourly rate
      const emp = employees.find(e => e.id === rec.employeeId);
      const rate = emp?.hourlyRate || 50;
      const mins = rec.totalMinutes > 0 ? rec.totalMinutes : 480; // default to 8h if active
      totalMinutes += mins;
      totalCost += (mins / 60) * rate;
    });

    return {
      totalLoggedHours: totalMinutes / 60,
      estimatedPayrollToday: Math.round(totalCost)
    };
  }, [recentAttendance, employees]);

  // Build employee roster state
  const employeeRoster = useMemo(() => {
    return employees.map(emp => {
      const punch = recentAttendance.find(r => r.employeeId === emp.id);
      const leave = leaveRequests.find(
        l => l.employeeId === emp.id && l.status === 'approved'
      );
      const shift = weeklyShifts.find(s => s.employeeId === emp.id);

      let status: 'working' | 'completed' | 'leave' | 'scheduled' | 'absent' = 'scheduled';
      let durationHours = 0;

      if (punch) {
        if (!punch.clockOut) {
          status = 'working';
          durationHours = punch.totalMinutes > 0 ? punch.totalMinutes / 60 : 4.5;
        } else {
          status = 'completed';
          durationHours = punch.totalMinutes / 60;
        }
      } else if (leave) {
        status = 'leave';
      }

      return {
        ...emp,
        punch,
        shift,
        leave,
        liveStatus: status,
        durationHours: durationHours.toFixed(1),
        clockInTime: punch?.clockIn || shift?.startTime || '09:00 AM',
        locationName: punch?.location || shift?.location || 'Marketing Landmark HQ',
        punctuality: punch?.status || 'on_time'
      };
    });
  }, [employees, recentAttendance, leaveRequests, weeklyShifts]);

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    return employeeRoster.filter(item => {
      if (rosterFilter === 'working' && item.liveStatus !== 'working') return false;
      if (rosterFilter === 'leave' && item.liveStatus !== 'leave') return false;
      if (rosterFilter === 'late' && item.punctuality !== 'late') return false;
      if (
        searchQuery &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.role.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.department.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [employeeRoster, rosterFilter, searchQuery]);

  // Weekly Trend Chart Data
  const weeklyTrendData = [
    { day: t.mon, percent: 94, count: 9, hours: 7.9 },
    { day: t.tue, percent: 91, count: 8, hours: 8.1 },
    { day: t.wed, percent: 96, count: 9, hours: 8.4 },
    { day: t.thu, percent: 89, count: 8, hours: 8.0 },
    { day: t.fri, percent: 84, count: 7, hours: 7.6 },
    { day: t.sat, percent: 35, count: 3, hours: 4.5 },
    { day: t.sun, percent: 12, count: 1, hours: 4.0 }
  ];

  // Handle Leave Approval
  const handleApproveLeave = async (id: string, empName: string) => {
    if (!onUpdateLeaveStatus) return;
    try {
      await onUpdateLeaveStatus(id, 'approved');
      triggerNotice(`Approved leave request for ${empName}`);
      if (onRefreshState) onRefreshState();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectLeave = async (id: string, empName: string) => {
    if (!onUpdateLeaveStatus) return;
    try {
      await onUpdateLeaveStatus(id, 'rejected');
      triggerNotice(`Declined leave request for ${empName}`);
      if (onRefreshState) onRefreshState();
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Manual Punch Submission
  const handleManualPunchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddManualAttendance) return;
    try {
      const emp = employees.find(e => e.id === punchEmpId);
      await onAddManualAttendance({
        employeeId: punchEmpId,
        employeeName: emp?.name || 'Staff',
        date: punchDate,
        clockIn: punchClockIn,
        clockOut: punchClockOut,
        location: punchLocation,
        status: punchStatus,
        notes: `Admin executive correction logged on ${punchDate}`
      });
      triggerNotice(`Manual attendance recorded for ${emp?.name || 'employee'}`);
      setIsManualPunchOpen(false);
      if (onRefreshState) onRefreshState();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col min-h-full px-4 sm:px-8 py-6 pb-24 max-w-7xl mx-auto w-full space-y-6">
      {/* 1. EXECUTIVE COMMAND HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {lang === 'km' ? 'មជ្ឈមណ្ឌលត្រួតពិនិត្យប្រតិបត្តិការផ្ទាល់' : 'Live Operations Command'}
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs font-mono text-slate-400">
              {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {lang === 'km' ? 'ផ្ទាំងគ្រប់គ្រងធនធានមនុស្ស និងប្រតិបត្តិការ' : 'Workforce Intelligence & Governance'}
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              Admin
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'km'
              ? 'ការត្រួតពិនិត្យវត្តមានជាក់ស្តែង ការអនុម័តច្បាប់ឈប់សម្រាក និងការគ្រប់គ្រងបន្ទុកការងារទូទាំងក្រុមហ៊ុន'
              : 'Real-time attendance pulse, leave authorization queue, labor metrics, and team capacity'}
          </p>
        </div>

        {/* Primary Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {onRefreshState && (
            <button
              onClick={() => onRefreshState()}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Refresh Real-Time Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setIsManualPunchOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>{lang === 'km' ? 'កត់ត្រាវត្តមានដោយដៃ' : 'Manual Punch'}</span>
          </button>

          <button
            onClick={() => onNavigateTab('admin_hub')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-semibold shadow-xs transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
            <span>{lang === 'km' ? 'ការកំណត់ Back-End' : 'Admin Control Hub'}</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Notice */}
      {actionNotice && (
        <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. EXECUTIVE METRIC KPI RIBBON */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Workforce */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">{t.workingNow}</span>
            <Users className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {metrics.workingNow}
            </span>
            <span className="text-xs font-mono text-slate-400">
              / {metrics.totalEmployees} {lang === 'km' ? 'បុគ្គលិកសរុប' : 'total staff'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>{metrics.presentToday} present</span>
            <span>·</span>
            <span>{metrics.attendanceBreakdown.absent} absent</span>
            <span>·</span>
            <span>{metrics.onLeaveToday} on leave</span>
          </div>
        </div>

        {/* KPI 2: Attendance Punctuality Rate */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">{t.attendanceRate}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {metrics.attendanceRate}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Nominal
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-emerald-600 dark:text-emerald-400 font-mono">{metrics.attendanceBreakdown.present} on-time</span>
            <span>·</span>
            <span className="text-amber-600 dark:text-amber-400 font-mono">{metrics.lateToday} late</span>
          </div>
        </div>

        {/* KPI 3: Labor Run & Projected Daily Payroll */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              {lang === 'km' ? 'ប្រាក់បៀវត្សរ៍ប៉ាន់ស្មានថ្ងៃនេះ' : 'Daily Labor Expense'}
            </span>
            <DollarSign className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              ${estimatedPayrollToday.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-slate-400">est.</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="font-mono tabular-nums">{totalLoggedHours.toFixed(1)} hrs logged</span>
            <span>·</span>
            <span className="truncate">{projects.length} active projects</span>
          </div>
        </div>

        {/* KPI 4: Pending Action Items */}
        <div
          onClick={() => onNavigateTab('leave')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              {lang === 'km' ? 'សំណើសុំការអនុម័ត' : 'Approvals Queue'}
            </span>
            <Umbrella className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {pendingLeaves.length}
            </span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              {pendingLeaves.length > 0 ? 'Action required' : 'All clear'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="truncate">
              {pendingLeaves.length > 0
                ? `${pendingLeaves.length} leave requests awaiting review`
                : 'Zero unreviewed time-off claims'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </div>
        </div>
      </div>

      {/* 3. PENDING APPROVALS QUEUE (DIRECT ACTIONABLE WIDGET) */}
      {pendingLeaves.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                {lang === 'km' ? 'សំណើច្បាប់សម្រាកដែលរង់ចាំការអនុម័ត' : 'Pending Leave Authorization Queue'}
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('leave')}
              className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>{t.viewAll}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingLeaves.map(req => (
              <div
                key={req.id}
                className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {req.employeeName}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {req.days} {lang === 'km' ? 'ថ្ងៃ' : 'days'} ({req.type})
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>{req.startDate} → {req.endDate}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded border border-slate-100 dark:border-slate-800/80 italic">
                    "{req.reason}"
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleRejectLeave(req.id, req.employeeName)}
                    className="px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:border-rose-300 text-rose-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    <span>Decline</span>
                  </button>
                  <button
                    onClick={() => handleApproveLeave(req.id, req.employeeName)}
                    className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    <span>Approve</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. LIVE WORKFORCE ROSTER (HIGH-DENSITY OPERATIONAL MATRIX) */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        {/* Table Controls Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {lang === 'km' ? 'បញ្ជីវត្តមានជាក់ស្តែង និងស្ថានភាពការងារ' : 'Real-time Workforce Roster & Deployment'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'km'
                ? 'តាមដានស្ថានភាពបុគ្គលិកកំពុងបំពេញការងារ ម៉ោងចូល និងទីតាំង'
                : 'Live attendance activity, check-in timestamps, assigned work location, and hours logged'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Segmented Filter Control */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                onClick={() => setRosterFilter('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  rosterFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All ({employees.length})
              </button>
              <button
                onClick={() => setRosterFilter('working')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  rosterFilter === 'working'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                On Clock ({metrics.workingNow})
              </button>
              <button
                onClick={() => setRosterFilter('leave')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  rosterFilter === 'leave'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                On Leave ({metrics.onLeaveToday})
              </button>
              <button
                onClick={() => setRosterFilter('late')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  rosterFilter === 'late'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Late ({metrics.lateToday})
              </button>
            </div>

            {/* Quick Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={lang === 'km' ? 'ស្វែងរកបុគ្គលិក...' : 'Search staff...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-40 sm:w-52 pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* High-Density Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4">{lang === 'km' ? 'បុគ្គលិក' : 'Staff Member'}</th>
                <th className="py-2.5 px-4">{lang === 'km' ? 'ផ្នែក / តួនាទី' : 'Department & Role'}</th>
                <th className="py-2.5 px-4">{lang === 'km' ? 'ស្ថានភាពជាក់ស្តែង' : 'Live Status'}</th>
                <th className="py-2.5 px-4">{lang === 'km' ? 'ម៉ោងចូល / ម៉ោងធ្វើការ' : 'Time & Duration'}</th>
                <th className="py-2.5 px-4">{lang === 'km' ? 'ទីតាំង' : 'Location'}</th>
                <th className="py-2.5 px-4 text-right">{lang === 'km' ? 'សកម្មភាព' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
              {filteredRoster.map(item => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Staff Info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
                        {item.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {item.employeeCode} · ${item.hourlyRate}/hr
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Department & Role */}
                  <td className="py-3 px-4">
                    <div className="text-slate-800 dark:text-slate-200 font-medium">
                      {item.department}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {item.role}
                    </div>
                  </td>

                  {/* Live Status */}
                  <td className="py-3 px-4">
                    {item.liveStatus === 'working' ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Clocked In</span>
                      </span>
                    ) : item.liveStatus === 'leave' ? (
                      <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span>Approved Leave</span>
                      </span>
                    ) : item.liveStatus === 'completed' ? (
                      <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        <span>Shift Finished</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                        <span>Scheduled</span>
                      </span>
                    )}
                  </td>

                  {/* Time & Duration */}
                  <td className="py-3 px-4 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    <div>
                      {item.clockInTime}
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans">
                      {item.liveStatus === 'working' ? (
                        <span className="text-blue-600 dark:text-blue-400 font-mono font-medium">
                          {item.durationHours} hrs active
                        </span>
                      ) : (
                        <span>Planned 8.0 hrs</span>
                      )}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1 truncate max-w-xs">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{item.locationName}</span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onNavigateTab('attendance')}
                      className="px-2.5 py-1 rounded text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRoster.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    No workforce members match the active filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. SPLIT SECTION: DEPARTMENT CAPACITY & WEEKLY TRENDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Allocation & Budget Utilization */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {lang === 'km' ? 'ការបែងចែកកម្លាំងពលកម្មតាមនាយកដ្ឋាន' : 'Department Allocation & Labor Capacity'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Staff headcount, leadership, and operational budget status
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('departments')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Manage
            </button>
          </div>

          <div className="space-y-3">
            {departments.slice(0, 5).map(dept => {
              const deptStaff = employees.filter(e => e.department === dept.name);
              const headcount = deptStaff.length || dept.count;
              const percent = Math.min(100, Math.round((headcount / Math.max(1, employees.length)) * 100));

              return (
                <div key={dept.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900 dark:text-white">{dept.name}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 font-mono tabular-nums">{headcount} staff</span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      ${dept.budget.toLocaleString()} budget
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Attendance & Punctuality Velocity */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.weeklyTrend}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Average weekly attendance rate 91.2% · Zero unexcused absences
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="grid grid-cols-7 gap-2 items-end h-32 pt-2">
            {weeklyTrendData.map(d => (
              <div key={d.day} className="flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-mono tabular-nums text-slate-400">{d.percent}%</span>
                <div
                  className="w-full max-w-[24px] bg-slate-900 dark:bg-blue-600 hover:bg-blue-700 rounded-t transition-all"
                  style={{ height: `${d.percent}%` }}
                />
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {d.day}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>Peak Day: Wednesday (96%)</span>
            <span>Target: &gt;90% adherence</span>
          </div>
        </div>
      </div>

      {/* 6. QUICK OPERATIONS SHORTCUT BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigateTab('reports')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 text-left transition-colors flex items-center justify-between shadow-xs group"
        >
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">{t.exportReports}</div>
              <div className="text-[11px] text-slate-400">Payroll & Audit</div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={() => onNavigateTab('shifts')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 text-left transition-colors flex items-center justify-between shadow-xs group"
        >
          <div className="flex items-center gap-2.5">
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">{t.shiftSchedules}</div>
              <div className="text-[11px] text-slate-400">Weekly Rosters</div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={() => onNavigateTab('employees')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 text-left transition-colors flex items-center justify-between shadow-xs group"
        >
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-purple-600" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">{t.employees}</div>
              <div className="text-[11px] text-slate-400">Directory & Roles</div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={() => onNavigateTab('admin_hub')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-400 text-left transition-colors flex items-center justify-between shadow-xs group"
        >
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-amber-500" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">{t.adminHub}</div>
              <div className="text-[11px] text-slate-400">Security & Hub</div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 7. MANUAL ATTENDANCE PUNCH MODAL */}
      {isManualPunchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {lang === 'km' ? 'កត់ត្រាវត្តមានដោយដៃ' : 'Executive Attendance Punch'}
                </h3>
              </div>
              <button
                onClick={() => setIsManualPunchOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualPunchSubmit} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Employee
                </label>
                <select
                  value={punchEmpId}
                  onChange={e => setPunchEmpId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department} - {emp.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={punchDate}
                  onChange={e => setPunchDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Clock In
                  </label>
                  <input
                    type="text"
                    required
                    value={punchClockIn}
                    onChange={e => setPunchClockIn(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Clock Out
                  </label>
                  <input
                    type="text"
                    value={punchClockOut}
                    onChange={e => setPunchClockOut(e.target.value)}
                    placeholder="05:00 PM"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={punchStatus}
                    onChange={e => setPunchStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <option value="on_time">On Time</option>
                    <option value="late">Late</option>
                    <option value="overtime">Overtime</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={punchLocation}
                    onChange={e => setPunchLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsManualPunchOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
