import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  KeyRound,
  Clock,
  Building,
  MapPin,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  Radio,
  RefreshCw,
  Search,
  Activity,
  Server,
  Lock,
  ChevronRight,
  Send,
  Eye,
  EyeOff,
  X,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { Language, AppState } from '../types';
import { translations } from '../i18n/translations';
import {
  fetchAdminOverviewAPI,
  fetchAuditLogsAPI,
  fetchAccountsAPI,
  createAdminAccountAPI,
  updateAdminAccountAPI,
  deleteAdminAccountAPI,
  updateAccountPasswordAPI,
  deleteAttendanceAPI,
  bulkApproveAttendanceAPI,
  addManualAttendanceAPI,
  updateAttendanceAPI,
  createShiftAPI,
  deleteShiftAPI,
  createDepartmentAPI,
  deleteDepartmentAPI,
  createLocationAPI,
  deleteLocationAPI,
  broadcastAnnouncementAPI
} from '../api/client';

interface AdminManagementHubProps {
  appState: AppState;
  onRefreshState: () => void;
  lang?: Language;
}

export const AdminManagementHub: React.FC<AdminManagementHubProps> = ({
  appState,
  onRefreshState,
  lang = 'en'
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'attendance' | 'shifts' | 'departments' | 'audits'>('overview');

  // Backend Overview & Audit State
  const [overview, setOverview] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'employee'>('all');
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'on_time' | 'late' | 'overtime'>('all');

  // Modals & Sub-forms
  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);
  const [isManualPunchOpen, setIsManualPunchOpen] = useState(false);
  const [isNewShiftOpen, setIsNewShiftOpen] = useState(false);
  const [isNewDeptOpen, setIsNewDeptOpen] = useState(false);
  const [isNewLocationOpen, setIsNewLocationOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [resetPassAccount, setResetPassAccount] = useState<any | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // Edit Attendance Modal State
  const [editingAttendance, setEditingAttendance] = useState<any | null>(null);
  const [editClockIn, setEditClockIn] = useState('');
  const [editClockOut, setEditClockOut] = useState('');
  const [editStatus, setEditStatus] = useState<'on_time' | 'late' | 'overtime'>('on_time');
  const [editHours, setEditHours] = useState('8');
  const [editMinutes, setEditMinutes] = useState('0');
  const [editNotes, setEditNotes] = useState('');

  // New Account Form State
  const [accName, setAccName] = useState('');
  const [accPhone, setAccPhone] = useState('');
  const [accPassword, setAccPassword] = useState('');
  const [accEmail, setAccEmail] = useState('');
  const [accRole, setAccRole] = useState<'employee' | 'admin'>('employee');
  const [accDept, setAccDept] = useState('Marketing');
  const [accRate, setAccRate] = useState(50);

  // Manual Punch Form State
  const [punchEmpId, setPunchEmpId] = useState(appState.employees[0]?.id || 'emp_cian');
  const [punchDate, setPunchDate] = useState(new Date().toISOString().split('T')[0]);
  const [punchClockIn, setPunchClockIn] = useState('09:00 AM');
  const [punchClockOut, setPunchClockOut] = useState('05:00 PM');
  const [punchLocation, setPunchLocation] = useState('Marketing Landmark HQ');
  const [punchStatus, setPunchStatus] = useState<'on_time' | 'late' | 'overtime'>('on_time');

  // New Shift Form State
  const [shiftEmpId, setShiftEmpId] = useState(appState.employees[0]?.id || 'emp_cian');
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [shiftDay, setShiftDay] = useState('Mon');
  const [shiftStart, setShiftStart] = useState('9:00 AM');
  const [shiftEnd, setShiftEnd] = useState('5:00 PM');
  const [shiftLoc, setShiftLoc] = useState('Marketing Landmark HQ');

  // New Dept Form State
  const [deptName, setDeptName] = useState('');
  const [deptBudget, setDeptBudget] = useState(60000);
  const [deptLead, setDeptLead] = useState('');

  // New Location Form State
  const [locName, setLocName] = useState('');
  const [locAddress, setLocAddress] = useState('');
  const [locRadius, setLocRadius] = useState(150);

  // Broadcast Message State
  const [broadcastMsg, setBroadcastMsg] = useState('');

  const loadData = async () => {
    try {
      const [over, logs, accs] = await Promise.all([
        fetchAdminOverviewAPI().catch(() => null),
        fetchAuditLogsAPI().catch(() => ({ logs: [] })),
        fetchAccountsAPI().catch(() => ({ accounts: [] }))
      ]);
      if (over) setOverview(over);
      if (logs) setAuditLogs(logs.logs || []);
      if (accs) setAccounts(accs.accounts || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerNotice = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Handlers
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAdminAccountAPI({
        name: accName,
        phone: accPhone,
        password: accPassword,
        role: accRole,
        email: accEmail,
        department: accDept,
        hourlyRate: accRate
      });
      triggerNotice('success', `Created account for ${accName}`);
      setIsNewAccountOpen(false);
      setAccName('');
      setAccPhone('');
      setAccPassword('');
      setAccEmail('');
      loadData();
      onRefreshState();
    } catch (err: any) {
      triggerNotice('error', err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = (id: string, name: string) => {
    setConfirmAction({
      title: 'Delete User Account',
      message: `Are you sure you want to permanently delete the account for ${name}?`,
      onConfirm: async () => {
        try {
          await deleteAdminAccountAPI(id);
          triggerNotice('success', `Account deleted for ${name}`);
          loadData();
          onRefreshState();
        } catch (err: any) {
          triggerNotice('error', err.message || 'Failed to delete account');
        }
      }
    });
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassAccount) return;
    try {
      await updateAccountPasswordAPI(resetPassAccount.id, newPasswordVal);
      triggerNotice('success', `Password for ${resetPassAccount.name} successfully updated.`);
      setResetPassAccount(null);
      setNewPasswordVal('');
    } catch (err: any) {
      triggerNotice('error', err.message || 'Failed to update password');
    }
  };

  const handleManualPunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const emp = appState.employees.find(e => e.id === punchEmpId);
      await addManualAttendanceAPI({
        employeeId: punchEmpId,
        employeeName: emp?.name || 'Staff',
        date: punchDate,
        clockIn: punchClockIn,
        clockOut: punchClockOut,
        location: punchLocation,
        status: punchStatus,
        notes: `Admin manual punch on ${punchDate}`
      });
      triggerNotice('success', `Logged attendance for ${emp?.name || 'staff'}`);
      setIsManualPunchOpen(false);
      onRefreshState();
      loadData();
    } catch (err: any) {
      triggerNotice('error', err.message || 'Failed to add attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditAttendance = (rec: any) => {
    setEditingAttendance(rec);
    setEditClockIn(rec.clockIn || '09:00 AM');
    setEditClockOut(rec.clockOut || '05:00 PM');
    const h = Math.floor((rec.totalMinutes || 0) / 60);
    const m = (rec.totalMinutes || 0) % 60;
    setEditHours(String(h > 0 ? h : 8));
    setEditMinutes(String(m));
    setEditStatus(rec.status || 'on_time');
    setEditNotes(rec.notes || '');
  };

  const handleSaveEditAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttendance) return;
    try {
      const totalMins = (parseInt(editHours, 10) || 0) * 60 + (parseInt(editMinutes, 10) || 0);
      await updateAttendanceAPI(editingAttendance.id, {
        clockIn: editClockIn,
        clockOut: editClockOut,
        status: editStatus,
        totalMinutes: totalMins,
        notes: editNotes
      });
      triggerNotice('success', 'Attendance record updated');
      setEditingAttendance(null);
      onRefreshState();
      loadData();
    } catch (err: any) {
      triggerNotice('error', err.message || 'Failed to update attendance');
    }
  };

  const handleDeleteAttendance = (id: string) => {
    setConfirmAction({
      title: 'Delete Attendance Punch',
      message: 'Are you sure you want to permanently delete this attendance punch record?',
      onConfirm: async () => {
        try {
          await deleteAttendanceAPI(id);
          triggerNotice('success', 'Attendance record removed');
          onRefreshState();
          loadData();
        } catch (err: any) {
          triggerNotice('error', err.message || 'Failed to delete attendance');
        }
      }
    });
  };

  const handleBulkApprove = async () => {
    try {
      const res = await bulkApproveAttendanceAPI();
      triggerNotice('success', `Bulk approved ${res.approvedCount} time logs.`);
      onRefreshState();
      loadData();
    } catch (err: any) {
      triggerNotice('error', err.message || 'Failed to bulk approve');
    }
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createShiftAPI({
        employeeId: shiftEmpId,
        date: shiftDate,
        dayName: shiftDay,
        startTime: shiftStart,
        endTime: shiftEnd,
        location: shiftLoc
      });
      triggerNotice('success', 'New shift allocated successfully');
      setIsNewShiftOpen(false);
      onRefreshState();
      loadData();
    } catch (err: any) {
      triggerNotice('error', err.message || 'Failed to create shift');
    }
  };

  const handleDeleteShift = (id: string) => {
    setConfirmAction({
      title: 'Delete Shift Schedule',
      message: 'Are you sure you want to delete this scheduled shift?',
      onConfirm: async () => {
        try {
          await deleteShiftAPI(id);
          triggerNotice('success', 'Shift deleted');
          onRefreshState();
          loadData();
        } catch (err: any) {
          triggerNotice('error', err.message || 'Failed to delete shift');
        }
      }
    });
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDepartmentAPI({
        name: deptName,
        budget: deptBudget,
        lead: deptLead || 'Department Lead'
      });
      triggerNotice('success', `Department ${deptName} created`);
      setIsNewDeptOpen(false);
      setDeptName('');
      onRefreshState();
      loadData();
    } catch (err: any) {
      triggerNotice('error', err.message || 'Failed to create department');
    }
  };

  const handleDeleteDept = (name: string) => {
    setConfirmAction({
      title: 'Delete Department',
      message: `Are you sure you want to delete department ${name}? This will remove department references.`,
      onConfirm: async () => {
        try {
          await deleteDepartmentAPI(name);
          triggerNotice('success', `Deleted department ${name}`);
          onRefreshState();
          loadData();
        } catch (err: any) {
          triggerNotice('error', err.message || 'Failed to delete department');
        }
      }
    });
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLocationAPI({
        name: locName,
        address: locAddress,
        radiusMeters: locRadius
      });
      triggerNotice('success', `Location site ${locName} added`);
      setIsNewLocationOpen(false);
      setLocName('');
      setLocAddress('');
      onRefreshState();
      loadData();
    } catch (err: any) {
      triggerNotice('error', err.message || 'Failed to add location');
    }
  };

  const handleDeleteLocation = (id: string, name: string) => {
    setConfirmAction({
      title: 'Delete Location Site',
      message: `Are you sure you want to delete work site ${name}?`,
      onConfirm: async () => {
        try {
          await deleteLocationAPI(id);
          triggerNotice('success', `Deleted site ${name}`);
          onRefreshState();
          loadData();
        } catch (err: any) {
          triggerNotice('error', err.message || 'Failed to delete location');
        }
      }
    });
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg) return;
    try {
      await broadcastAnnouncementAPI(broadcastMsg, 'high');
      triggerNotice('success', 'Announcement transmitted to all team devices.');
      setIsBroadcastOpen(false);
      setBroadcastMsg('');
      loadData();
    } catch (err: any) {
      triggerNotice('error', err.message || 'Failed to broadcast');
    }
  };

  const filteredAccounts = accounts.filter(a => {
    if (roleFilter !== 'all' && a.role !== roleFilter) return false;
    if (
      searchQuery &&
      !a.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !a.phone.includes(searchQuery) &&
      !a.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const filteredAttendance = appState.attendanceRecords.filter(r => {
    if (attendanceFilter !== 'all' && r.status !== attendanceFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col min-h-full px-4 sm:px-8 py-6 pb-24 max-w-7xl mx-auto w-full space-y-6">
      {/* 1. TOP HEADER & BREADCRUMBS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Administration</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-white">Security & Operations Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            {lang === 'km' ? 'មជ្ឈមណ្ឌលគ្រប់គ្រងប្រព័ន្ធ Back-End' : 'Administrative Operations & Governance'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Credential governance, attendance corrections, capacity scheduling, and real-time audit trail
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBroadcastOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <Radio className="w-3.5 h-3.5 text-blue-500" />
            <span>Broadcast Notice</span>
          </button>

          <button
            onClick={() => {
              loadData();
              onRefreshState();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-semibold shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Engine</span>
          </button>
        </div>
      </div>

      {/* Global Notice Alert */}
      {feedback && (
        <div
          className={`p-3 rounded-lg border text-xs font-medium flex items-center justify-between animate-in fade-in ${
            feedback.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              : 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. SUB-NAVIGATION TABS (CLEAN SEGMENTED CONTRACT) */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg transition-colors shrink-0 ${
            activeTab === 'overview'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-950/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>System Health</span>
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg transition-colors shrink-0 ${
            activeTab === 'accounts'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-950/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Accounts & Passwords</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg transition-colors shrink-0 ${
            activeTab === 'attendance'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-950/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Attendance Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('shifts')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg transition-colors shrink-0 ${
            activeTab === 'shifts'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-950/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Shift Allocation</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg transition-colors shrink-0 ${
            activeTab === 'departments'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-950/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Depts & Sites</span>
        </button>

        <button
          onClick={() => setActiveTab('audits')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg transition-colors shrink-0 ${
            activeTab === 'audits'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-950/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: SYSTEM HEALTH OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Server Status
              </div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Operational 100%</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Uptime: {overview?.system?.uptime || 'Active 24h+'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Runtime Engine
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                Node {overview?.system?.nodeVersion || 'v22.x'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Memory: {overview?.system?.memoryUsageMb || '48'} MB allocated
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                User Accounts
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {overview?.counts?.totalAccounts || accounts.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {overview?.counts?.adminCount || 1} Admins · {overview?.counts?.staffCount || 1} Staff
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Recorded Attendance
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {appState.attendanceRecords.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {appState.locations.length} geofence office sites
              </div>
            </div>
          </div>

          {/* Quick Operations Console */}
          <div className="p-5 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white">
                Administrative Operations Quick Command
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Execute workforce changes, verify employee attendance records, reset staff passwords, or assign new shift hours.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                onClick={() => setIsNewAccountOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Account</span>
              </button>

              <button
                onClick={() => setIsManualPunchOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Log Manual Punch</span>
              </button>

              <button
                onClick={handleBulkApprove}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bulk Approve Records</span>
              </button>

              <button
                onClick={() => setIsNewShiftOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Allocate Shift</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER ACCOUNTS & PASSWORDS */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search accounts by name, phone or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
                <button
                  onClick={() => setRoleFilter('all')}
                  className={`px-2 py-1 text-xs rounded font-medium ${
                    roleFilter === 'all'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setRoleFilter('admin')}
                  className={`px-2 py-1 text-xs rounded font-medium ${
                    roleFilter === 'admin'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Admin
                </button>
                <button
                  onClick={() => setRoleFilter('employee')}
                  className={`px-2 py-1 text-xs rounded font-medium ${
                    roleFilter === 'employee'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Staff
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsNewAccountOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Account</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">User</th>
                    <th className="py-2.5 px-4">Phone</th>
                    <th className="py-2.5 px-4">Email</th>
                    <th className="py-2.5 px-4">Role</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAccounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
                            {acc.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white">{acc.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {acc.phone}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 truncate max-w-xs">
                        {acc.email}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-700 dark:text-slate-300 capitalize font-medium">
                          {acc.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setResetPassAccount(acc);
                              setNewPasswordVal('');
                            }}
                            className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-[11px] font-semibold"
                            title="Reset Password"
                          >
                            Reset Password
                          </button>
                          <button
                            onClick={() => handleDeleteAccount(acc.id, acc.name)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAccounts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400 text-xs">
                        No accounts match the active search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE CORRECTIONS */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                onClick={() => setAttendanceFilter('all')}
                className={`px-2.5 py-1 text-xs rounded font-medium ${
                  attendanceFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                All ({appState.attendanceRecords.length})
              </button>
              <button
                onClick={() => setAttendanceFilter('on_time')}
                className={`px-2.5 py-1 text-xs rounded font-medium ${
                  attendanceFilter === 'on_time'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                On Time
              </button>
              <button
                onClick={() => setAttendanceFilter('late')}
                className={`px-2.5 py-1 text-xs rounded font-medium ${
                  attendanceFilter === 'late'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Late
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkApprove}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Bulk Approve</span>
              </button>
              <button
                onClick={() => setIsManualPunchOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manual Punch</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Staff Member</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">In / Out</th>
                    <th className="py-2.5 px-4">Duration</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums">
                  {filteredAttendance.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-sans font-semibold text-slate-900 dark:text-white">
                        {r.employeeName}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {r.date}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {r.clockIn} → {r.clockOut || (
                          <span className="text-emerald-500 font-semibold font-sans">Active</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">
                        {(r.totalMinutes / 60).toFixed(1)} hrs
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-600 dark:text-slate-300 capitalize">
                        {r.status.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditAttendance(r)}
                            className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-[11px] font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAttendance(r.id)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAttendance.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400 text-xs font-sans">
                        No attendance records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SHIFT SCHEDULER */}
      {activeTab === 'shifts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Allocated Weekly Shifts
              </h2>
              <p className="text-xs text-slate-500">
                Weekly scheduled operational hours across staff
              </p>
            </div>

            <button
              onClick={() => setIsNewShiftOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Shift</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {appState.weeklyShifts.map(s => {
              const emp = appState.employees.find(e => e.id === s.employeeId);
              return (
                <div
                  key={s.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shadow-xs space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {s.dayName} · {s.date}
                      </span>
                      <span className="font-mono text-slate-400">
                        {s.hours} hrs
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {emp?.name || 'Staff Member'}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{s.startTime} - {s.endTime}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{s.location}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={() => handleDeleteShift(s.id)}
                      className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: DEPARTMENTS & LOCATIONS */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Departments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>Departments</span>
                </h2>
                <p className="text-xs text-slate-500">Corporate units and operational budgets</p>
              </div>
              <button
                onClick={() => setIsNewDeptOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Dept</span>
              </button>
            </div>

            <div className="space-y-2">
              {appState.departments.map(d => (
                <div
                  key={d.name}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-xs">
                      {d.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Lead: {d.lead} · Budget: ${d.budget.toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDept(d.name)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Geofence Office Sites</span>
                </h2>
                <p className="text-xs text-slate-500">Clock-in radius and physical office sites</p>
              </div>
              <button
                onClick={() => setIsNewLocationOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Site</span>
              </button>
            </div>

            <div className="space-y-2">
              {appState.locations.map(loc => (
                <div
                  key={loc.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-xs"
                >
                  <div className="min-w-0 flex-1 mr-2">
                    <div className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                      {loc.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {loc.address} · Radius: {loc.radiusMeters}m
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteLocation(loc.id, loc.name)}
                    className="p-1 text-slate-400 hover:text-rose-500 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === 'audits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Enterprise Security & Audit Trail
              </h2>
              <p className="text-xs text-slate-500">
                Immutable event stream of system adjustments, credentials updates, and punches
              </p>
            </div>
            <button
              onClick={loadData}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-4">Action</th>
                    <th className="py-2.5 px-4">Actor</th>
                    <th className="py-2.5 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 dark:text-white uppercase text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-sans font-medium">
                        {log.performedBy}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-sans">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-400 text-xs font-sans">
                        No security audit logs recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE ACCOUNT */}
      {isNewAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Create New User Account
              </h3>
              <button onClick={() => setIsNewAccountOpen(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAccount} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={accName}
                  onChange={e => setAccName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={accPhone}
                    onChange={e => setAccPhone(e.target.value)}
                    placeholder="+855 12 345 678"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={accPassword}
                    onChange={e => setAccPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={accEmail}
                  onChange={e => setAccEmail(e.target.value)}
                  placeholder="name@marketinglandmark.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Role
                  </label>
                  <select
                    value={accRole}
                    onChange={e => setAccRole(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <option value="employee">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Dept
                  </label>
                  <select
                    value={accDept}
                    onChange={e => setAccDept(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    {appState.departments.map(d => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Rate ($/hr)
                  </label>
                  <input
                    type="number"
                    value={accRate}
                    onChange={e => setAccRate(Number(e.target.value))}
                    className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewAccountOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET PASSWORD */}
      {resetPassAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Reset Password: {resetPassAccount.name}
              </h3>
              <button onClick={() => setResetPassAccount(null)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-3">
              <div className="relative">
                <input
                  type={showPasswordText ? 'text' : 'password'}
                  required
                  placeholder="Enter new password"
                  value={newPasswordVal}
                  onChange={e => setNewPasswordVal(e.target.value)}
                  className="w-full px-3 py-2 pr-9 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordText(!showPasswordText)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setResetPassAccount(null)}
                  className="px-3 py-1.5 text-xs text-slate-500 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ATTENDANCE */}
      {editingAttendance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Edit Punch Record: {editingAttendance.employeeName}
              </h3>
              <button onClick={() => setEditingAttendance(null)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditAttendance} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Clock In
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
                    Clock Out
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
                  Correction Notes
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAttendance(null)}
                  className="px-3 py-1.5 text-xs text-slate-500 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Save Corrections
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BROADCAST NOTICE */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-blue-500" />
                <span>Broadcast Workforce Notice</span>
              </h3>
              <button onClick={() => setIsBroadcastOpen(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleBroadcast} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Message to all team members
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Please remember to log off-site project hours before 6 PM today."
                  value={broadcastMsg}
                  onChange={e => setBroadcastMsg(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBroadcastOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL PUNCH */}
      {isManualPunchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Log Manual Attendance Punch
              </h3>
              <button onClick={() => setIsManualPunchOpen(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleManualPunch} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Employee
                </label>
                <select
                  value={punchEmpId}
                  onChange={e => setPunchEmpId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  {appState.employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department} - {emp.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
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
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
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
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
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

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsManualPunchOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs"
                >
                  Save Punch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW SHIFT */}
      {isNewShiftOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Allocate New Shift
              </h3>
              <button onClick={() => setIsNewShiftOpen(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateShift} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Employee
                </label>
                <select
                  value={shiftEmpId}
                  onChange={e => setShiftEmpId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  {appState.employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={shiftDate}
                    onChange={e => setShiftDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Day Name
                  </label>
                  <select
                    value={shiftDay}
                    onChange={e => setShiftDay(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <option value="Mon">Monday</option>
                    <option value="Tue">Tuesday</option>
                    <option value="Wed">Wednesday</option>
                    <option value="Thu">Thursday</option>
                    <option value="Fri">Friday</option>
                    <option value="Sat">Saturday</option>
                    <option value="Sun">Sunday</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    required
                    value={shiftStart}
                    onChange={e => setShiftStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    required
                    value={shiftEnd}
                    onChange={e => setShiftEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Location Site
                </label>
                <select
                  value={shiftLoc}
                  onChange={e => setShiftLoc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  {appState.locations.map(l => (
                    <option key={l.id} value={l.name}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewShiftOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Schedule Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW DEPT */}
      {isNewDeptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Add New Department
              </h3>
              <button onClick={() => setIsNewDeptOpen(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateDept} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quality Assurance"
                  value={deptName}
                  onChange={e => setDeptName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Annual Budget ($)
                </label>
                <input
                  type="number"
                  value={deptBudget}
                  onChange={e => setDeptBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Lead / Manager Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kimleang Pich"
                  value={deptLead}
                  onChange={e => setDeptLead(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewDeptOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW LOCATION */}
      {isNewLocationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Add Geofence Office Site
              </h3>
              <button onClick={() => setIsNewLocationOpen(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateLocation} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Landmark Innovation Hub"
                  value={locName}
                  onChange={e => setLocName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Russian Blvd, Phnom Penh"
                  value={locAddress}
                  onChange={e => setLocAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Allowed Geofence Radius (Meters)
                </label>
                <input
                  type="number"
                  min="50"
                  max="2000"
                  value={locRadius}
                  onChange={e => setLocRadius(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewLocationOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  Add Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{confirmAction.title}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {confirmAction.message}
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const action = confirmAction.onConfirm;
                  setConfirmAction(null);
                  await action();
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
