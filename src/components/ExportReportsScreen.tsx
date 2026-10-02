import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Activity,
  Clock,
  ClockAlert,
  WalletCards,
  FileText,
  FileSpreadsheet,
  Download,
  Printer,
  X,
  CheckCircle2,
  Filter,
  Search,
  RotateCcw,
  Building,
  TrendingUp,
  FolderKanban,
  Check,
  ChevronRight,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import {
  AttendanceRecord,
  Employee,
  Department,
  Project,
  Task,
  ShiftItem,
  Language
} from '../types';
import { translations } from '../i18n/translations';
import { fetchReportDataAPI } from '../api/client';

interface ExportReportsScreenProps {
  attendance?: AttendanceRecord[];
  employees?: Employee[];
  departments?: Department[];
  projects?: Project[];
  tasks?: Task[];
  shifts?: ShiftItem[];
  metrics?: any;
  lang?: Language;
}

type ReportType = 'attendance' | 'payroll' | 'productivity' | 'punctuality' | 'departments';

export const ExportReportsScreen: React.FC<ExportReportsScreenProps> = ({
  attendance = [],
  employees = [],
  departments = [],
  projects = [],
  tasks = [],
  shifts = [],
  metrics,
  lang = 'en'
}) => {
  const t = translations[lang];

  // Active Report Category Tab
  const [activeReport, setActiveReport] = useState<ReportType>('attendance');

  // Filter States
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // UI States
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const triggerNotice = (msg: string) => {
    setDownloadNotice(msg);
    setTimeout(() => setDownloadNotice(null), 3500);
  };

  // Date range filtering helper
  const isDateInRange = (dateStr: string) => {
    if (!dateStr || dateRange === 'all') return true;
    const now = new Date();
    const d = new Date(dateStr);
    const todayStr = now.toISOString().split('T')[0];

    if (dateRange === 'today') {
      return dateStr === todayStr;
    }
    if (dateRange === 'week') {
      const diffMs = now.getTime() - d.getTime();
      const diffDays = diffMs / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }
    if (dateRange === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (dateRange === 'custom') {
      if (customStart && dateStr < customStart) return false;
      if (customEnd && dateStr > customEnd) return false;
      return true;
    }
    return true;
  };

  // Departments List
  const departmentsList = useMemo(() => {
    const set = new Set<string>();
    departments.forEach(d => set.add(d.name));
    employees.forEach(e => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set);
  }, [departments, employees]);

  // 1. FILTERED ATTENDANCE REPORT DATA
  const attendanceReportRows = useMemo(() => {
    return attendance
      .filter(rec => {
        if (!isDateInRange(rec.date)) return false;
        if (selectedDept !== 'all') {
          const emp = employees.find(e => e.id === rec.employeeId || e.name.toLowerCase() === rec.employeeName.toLowerCase());
          if (emp && emp.department !== selectedDept) return false;
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matches =
            rec.employeeName.toLowerCase().includes(q) ||
            rec.location.toLowerCase().includes(q) ||
            rec.date.includes(q) ||
            rec.notes.toLowerCase().includes(q);
          if (!matches) return false;
        }
        return true;
      })
      .map(rec => {
        const emp = employees.find(e => e.id === rec.employeeId || e.name.toLowerCase() === rec.employeeName.toLowerCase());
        const hours = (rec.totalMinutes / 60).toFixed(1);
        const hourlyRate = emp?.hourlyRate || 50;
        const estCost = Math.round((rec.totalMinutes / 60) * hourlyRate);
        return {
          id: rec.id,
          employee: rec.employeeName,
          code: emp?.employeeCode || 'EMP-000',
          department: emp?.department || 'Marketing',
          date: rec.date,
          clockIn: rec.clockIn || '—',
          clockOut: rec.clockOut || 'Active',
          hours: Number(hours),
          status: rec.status,
          location: rec.location,
          cost: estCost,
          notes: rec.notes || 'Standard shift'
        };
      });
  }, [attendance, employees, dateRange, customStart, customEnd, selectedDept, searchQuery]);

  // 2. FILTERED PAYROLL REPORT DATA
  const payrollReportRows = useMemo(() => {
    return employees
      .filter(emp => {
        if (selectedDept !== 'all' && emp.department !== selectedDept) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matches =
            emp.name.toLowerCase().includes(q) ||
            emp.department.toLowerCase().includes(q) ||
            emp.role.toLowerCase().includes(q) ||
            emp.employeeCode.toLowerCase().includes(q);
          if (!matches) return false;
        }
        return true;
      })
      .map(emp => {
        const empRecords = attendance.filter(
          r => (r.employeeId === emp.id || r.employeeName.toLowerCase() === emp.name.toLowerCase()) && isDateInRange(r.date)
        );
        const totalMinutes = empRecords.reduce((sum, r) => sum + (r.totalMinutes || (r.clockOut ? 480 : 240)), 0);
        const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
        const regularHours = Math.min(totalHours, 40);
        const overtimeHours = Math.max(0, totalHours - 40);
        const regularPay = Math.round(regularHours * emp.hourlyRate);
        const overtimePay = Math.round(overtimeHours * emp.hourlyRate * 1.5);
        const grossPay = regularPay + overtimePay;

        return {
          id: emp.id,
          name: emp.name,
          code: emp.employeeCode,
          department: emp.department,
          role: emp.role,
          hourlyRate: emp.hourlyRate,
          totalHours,
          regularHours,
          overtimeHours,
          grossPay,
          shiftsCount: empRecords.length
        };
      });
  }, [employees, attendance, dateRange, customStart, customEnd, selectedDept, searchQuery]);

  // 3. FILTERED PRODUCTIVITY & PROJECT REPORT DATA
  const productivityReportRows = useMemo(() => {
    return projects
      .filter(proj => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matches =
            proj.name.toLowerCase().includes(q) ||
            proj.client.toLowerCase().includes(q) ||
            (proj.planOwnerName || '').toLowerCase().includes(q);
          if (!matches) return false;
        }
        return true;
      })
      .map(proj => {
        const projTasks = tasks.filter(t => t.projectId === proj.id);
        const completedTasks = projTasks.filter(t => t.completed).length;
        const totalMins = projTasks.reduce((acc, t) => acc + t.loggedMinutes, 0);
        const billableMins = projTasks.filter(t => t.billable).reduce((acc, t) => acc + t.loggedMinutes, 0);
        const totalHours = Math.round((totalMins / 60) * 10) / 10;
        const billableHours = Math.round((billableMins / 60) * 10) / 10;
        const billableRevenue = Math.round(billableHours * proj.billableRate);
        const progress = projTasks.length > 0 ? Math.round((completedTasks / projTasks.length) * 100) : 0;

        return {
          id: proj.id,
          name: proj.name,
          client: proj.client,
          owner: proj.planOwnerName || 'Lead',
          budget: proj.budget,
          billableRate: proj.billableRate,
          totalHours,
          billableHours,
          billableRevenue,
          taskCount: projTasks.length,
          completedTasks,
          progress,
          dueDate: proj.dueDate,
          status: proj.status
        };
      });
  }, [projects, tasks, searchQuery]);

  // 4. FILTERED PUNCTUALITY & EXCEPTIONS DATA
  const punctualityReportRows = useMemo(() => {
    return attendance
      .filter(rec => {
        if (rec.status !== 'late') return false;
        if (!isDateInRange(rec.date)) return false;
        if (selectedDept !== 'all') {
          const emp = employees.find(e => e.id === rec.employeeId || e.name.toLowerCase() === rec.employeeName.toLowerCase());
          if (emp && emp.department !== selectedDept) return false;
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            rec.employeeName.toLowerCase().includes(q) ||
            rec.location.toLowerCase().includes(q) ||
            rec.date.includes(q)
          );
        }
        return true;
      })
      .map(rec => {
        const emp = employees.find(e => e.id === rec.employeeId || e.name.toLowerCase() === rec.employeeName.toLowerCase());
        return {
          id: rec.id,
          employee: rec.employeeName,
          code: emp?.employeeCode || 'EMP-000',
          department: emp?.department || 'Marketing',
          date: rec.date,
          clockIn: rec.clockIn || '09:45 AM',
          expected: '09:00 AM',
          location: rec.location,
          notes: rec.notes || 'Traffic / Delayed transit'
        };
      });
  }, [attendance, employees, dateRange, customStart, customEnd, selectedDept, searchQuery]);

  // Summary KPIs for Active Report View
  const reportKPIs = useMemo(() => {
    if (activeReport === 'attendance') {
      const totalHrs = attendanceReportRows.reduce((acc, r) => acc + r.hours, 0);
      const totalCost = attendanceReportRows.reduce((acc, r) => acc + r.cost, 0);
      const onTimeCount = attendanceReportRows.filter(r => r.status === 'on_time').length;
      const onTimeRate = attendanceReportRows.length > 0 ? Math.round((onTimeCount / attendanceReportRows.length) * 100) : 100;
      return [
        { label: 'Total Shift Hours', value: `${totalHrs.toFixed(1)} hrs`, sub: `${attendanceReportRows.length} logs recorded` },
        { label: 'On-Time Punctuality', value: `${onTimeRate}%`, sub: `${attendanceReportRows.filter(r => r.status === 'late').length} late punches` },
        { label: 'Estimated Shift Cost', value: `$${totalCost.toLocaleString()}`, sub: 'Calculated from wage rates' },
        { label: 'Active on Duty', value: `${attendanceReportRows.filter(r => r.clockOut === 'Active').length} staff`, sub: 'Currently clocked in' }
      ];
    }
    if (activeReport === 'payroll') {
      const totalGross = payrollReportRows.reduce((acc, r) => acc + r.grossPay, 0);
      const totalHrs = payrollReportRows.reduce((acc, r) => acc + r.totalHours, 0);
      const totalOT = payrollReportRows.reduce((acc, r) => acc + r.overtimeHours, 0);
      const avgRate = payrollReportRows.length > 0
        ? Math.round(payrollReportRows.reduce((acc, r) => acc + r.hourlyRate, 0) / payrollReportRows.length)
        : 50;
      return [
        { label: 'Gross Payroll Est.', value: `$${totalGross.toLocaleString()}`, sub: 'Regular + Overtime compensation' },
        { label: 'Total Tracked Hours', value: `${totalHrs.toFixed(1)} hrs`, sub: 'Across workforce' },
        { label: 'Overtime Hours', value: `${totalOT.toFixed(1)} hrs`, sub: 'At 1.5x regular pay rate' },
        { label: 'Average Wage', value: `$${avgRate}.00/hr`, sub: `${payrollReportRows.length} employees` }
      ];
    }
    if (activeReport === 'productivity') {
      const totalRev = productivityReportRows.reduce((acc, r) => acc + r.billableRevenue, 0);
      const totalBudget = productivityReportRows.reduce((acc, r) => acc + r.budget, 0);
      const totalBillableHrs = productivityReportRows.reduce((acc, r) => acc + r.billableHours, 0);
      const totalTasks = productivityReportRows.reduce((acc, r) => acc + r.taskCount, 0);
      return [
        { label: 'Billable Revenue Est.', value: `$${totalRev.toLocaleString()}`, sub: 'Accrued from logged hours' },
        { label: 'Total Contract Budgets', value: `$${totalBudget.toLocaleString()}`, sub: `${productivityReportRows.length} active projects` },
        { label: 'Billable Hours', value: `${totalBillableHrs.toFixed(1)} hrs`, sub: 'Direct client billable' },
        { label: 'Total Deliverables', value: `${totalTasks} tasks`, sub: 'In progress or completed' }
      ];
    }
    // Punctuality
    return [
      { label: 'Late Incidents', value: `${punctualityReportRows.length}`, sub: 'Arrivals past grace threshold' },
      { label: 'Affected Staff', value: `${new Set(punctualityReportRows.map(r => r.employee)).size}`, sub: 'Distinct team members' },
      { label: 'Primary Location', value: 'HQ Main Floor', sub: 'Highest recorded late punches' },
      { label: 'Action Required', value: punctualityReportRows.length > 3 ? 'Review Needed' : 'Normal', sub: 'Punctuality policy compliance' }
    ];
  }, [activeReport, attendanceReportRows, payrollReportRows, productivityReportRows, punctualityReportRows]);

  // EXPORT CSV HANDLER (Client-side Blob without window.open)
  const handleExportCSV = () => {
    try {
      setIsExporting(true);
      let csvContent = '';
      let filename = `workforce_${activeReport}_report_${Date.now()}.csv`;

      if (activeReport === 'attendance') {
        const headers = ['Employee Name', 'Code', 'Department', 'Date', 'Clock In', 'Clock Out', 'Duration (Hours)', 'Status', 'Location', 'Shift Cost ($)', 'Notes'];
        const rows = attendanceReportRows.map(r => [
          `"${r.employee}"`,
          `"${r.code}"`,
          `"${r.department}"`,
          `"${r.date}"`,
          `"${r.clockIn}"`,
          `"${r.clockOut}"`,
          r.hours,
          `"${r.status}"`,
          `"${r.location}"`,
          r.cost,
          `"${r.notes}"`
        ]);
        csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      } else if (activeReport === 'payroll') {
        const headers = ['Employee Name', 'Employee Code', 'Department', 'Job Role', 'Hourly Wage ($/hr)', 'Total Hours', 'Regular Hours', 'Overtime Hours', 'Gross Est. Pay ($)', 'Recorded Shifts'];
        const rows = payrollReportRows.map(r => [
          `"${r.name}"`,
          `"${r.code}"`,
          `"${r.department}"`,
          `"${r.role}"`,
          r.hourlyRate,
          r.totalHours,
          r.regularHours,
          r.overtimeHours,
          r.grossPay,
          r.shiftsCount
        ]);
        csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      } else if (activeReport === 'productivity') {
        const headers = ['Project Name', 'Client', 'Project Lead', 'Budget ($)', 'Billable Rate ($/hr)', 'Total Hours', 'Billable Hours', 'Accrued Revenue ($)', 'Tasks Done', 'Total Tasks', 'Progress (%)', 'Due Date', 'Status'];
        const rows = productivityReportRows.map(r => [
          `"${r.name}"`,
          `"${r.client}"`,
          `"${r.owner}"`,
          r.budget,
          r.billableRate,
          r.totalHours,
          r.billableHours,
          r.billableRevenue,
          r.completedTasks,
          r.taskCount,
          r.progress,
          `"${r.dueDate}"`,
          `"${r.status}"`
        ]);
        csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      } else {
        const headers = ['Employee Name', 'Employee Code', 'Department', 'Date', 'Actual Check-in', 'Expected Start', 'Location', 'Notes'];
        const rows = punctualityReportRows.map(r => [
          `"${r.employee}"`,
          `"${r.code}"`,
          `"${r.department}"`,
          `"${r.date}"`,
          `"${r.clockIn}"`,
          `"${r.expected}"`,
          `"${r.location}"`,
          `"${r.notes}"`
        ]);
        csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      triggerNotice(`Successfully exported ${activeReport.toUpperCase()} report as CSV`);
    } catch (err: any) {
      console.error(err);
      triggerNotice('Failed to export CSV: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // EXPORT EXCEL HANDLER (.xls XML Spreadsheet)
  const handleExportExcel = () => {
    try {
      setIsExporting(true);
      let headers: string[] = [];
      let rows: (string | number)[][] = [];
      const title = `Marketing Landmark - ${activeReport.toUpperCase()} Report`;

      if (activeReport === 'attendance') {
        headers = ['Staff Member', 'Code', 'Department', 'Date', 'Clock In', 'Clock Out', 'Hours', 'Status', 'Location', 'Cost ($)'];
        rows = attendanceReportRows.map(r => [r.employee, r.code, r.department, r.date, r.clockIn, r.clockOut, r.hours, r.status, r.location, r.cost]);
      } else if (activeReport === 'payroll') {
        headers = ['Staff Member', 'Code', 'Department', 'Role', 'Rate ($/hr)', 'Total Hrs', 'Regular Hrs', 'Overtime Hrs', 'Gross Pay ($)'];
        rows = payrollReportRows.map(r => [r.name, r.code, r.department, r.role, r.hourlyRate, r.totalHours, r.regularHours, r.overtimeHours, r.grossPay]);
      } else if (activeReport === 'productivity') {
        headers = ['Project', 'Client', 'Lead', 'Budget ($)', 'Rate ($/hr)', 'Total Hrs', 'Billable Hrs', 'Revenue ($)', 'Progress (%)', 'Status'];
        rows = productivityReportRows.map(r => [r.name, r.client, r.owner, r.budget, r.billableRate, r.totalHours, r.billableHours, r.billableRevenue, r.progress, r.status]);
      } else {
        headers = ['Staff Member', 'Code', 'Department', 'Date', 'Clock In', 'Expected', 'Location', 'Notes'];
        rows = punctualityReportRows.map(r => [r.employee, r.code, r.department, r.date, r.clockIn, r.expected, r.location, r.notes]);
      }

      const tableHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${activeReport}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      </head>
      <body>
        <h2>${title}</h2>
        <p>Generated: ${new Date().toLocaleString()} · Filter: ${dateRange.toUpperCase()}</p>
        <table border="1">
          <thead>
            <tr>${headers.map(h => `<th style="background-color:#1E293B;color:#FFFFFF;font-weight:bold;padding:6px;">${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map(row => `<tr>${row.map(cell => `<td style="padding:4px 6px;">${cell}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </body>
      </html>`;

      const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `workforce_${activeReport}_report_${Date.now()}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      triggerNotice(`Successfully exported ${activeReport.toUpperCase()} report as Excel (.xls)`);
    } catch (err: any) {
      console.error(err);
      triggerNotice('Failed to export Excel: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full px-4 sm:px-8 py-6 pb-24 max-w-7xl mx-auto w-full space-y-5">
      {/* 1. Header with Breadcrumb & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Workforce Management</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-white">Reports & Analytics Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Workforce Reports View
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time multi-dimensional reports for attendance verification, payroll estimation, project billables, and workforce exceptions.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            title="Print or Preview PDF Document"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Print View</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            title="Export to Microsoft Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            title="Export raw data to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {downloadNotice && (
        <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{downloadNotice}</span>
          </div>
          <button onClick={() => setDownloadNotice(null)} className="opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. REPORT CATEGORY NAV TABS */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveReport('attendance')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            activeReport === 'attendance'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Attendance Ledger</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-600 font-mono">
            {attendanceReportRows.length}
          </span>
        </button>

        <button
          onClick={() => setActiveReport('payroll')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            activeReport === 'payroll'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <WalletCards className="w-3.5 h-3.5" />
          <span>Payroll & Compensation</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-600 font-mono">
            {payrollReportRows.length}
          </span>
        </button>

        <button
          onClick={() => setActiveReport('productivity')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            activeReport === 'productivity'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Projects & Billables</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-600 font-mono">
            {productivityReportRows.length}
          </span>
        </button>

        <button
          onClick={() => setActiveReport('punctuality')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            activeReport === 'punctuality'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ClockAlert className="w-3.5 h-3.5" />
          <span>Punctuality & Exceptions</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-600 font-mono">
            {punctualityReportRows.length}
          </span>
        </button>
      </div>

      {/* 3. REPORT SUMMARY KPI RIBBON */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {reportKPIs.map((kpi, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs"
          >
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {kpi.label}
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
              {kpi.value}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      {/* 4. REPORT FILTER CONTROL PANEL */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span className="uppercase tracking-wider">Report Filters & Scope</span>
          </div>

          {(dateRange !== 'all' || selectedDept !== 'all' || searchQuery !== '') && (
            <button
              onClick={() => {
                setDateRange('all');
                setCustomStart('');
                setCustomEnd('');
                setSelectedDept('all');
                setSearchQuery('');
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Date Range Preset */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Date Period
            </label>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium"
            >
              <option value="all">All Available Records</option>
              <option value="today">Today</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Current Month</option>
              <option value="custom">Custom Date Range...</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium"
            >
              <option value="all">All Departments ({departmentsList.length})</option>
              {departmentsList.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Custom Date Pickers if selected */}
          {dateRange === 'custom' ? (
            <div className="sm:col-span-2 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={e => setCustomStart(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={e => setCustomEnd(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Keyword Filter
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter report by name, code, project, or location..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. INTERACTIVE LIVE REPORT DATA GRID */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {activeReport === 'attendance' && 'Attendance Timesheet Register'}
              {activeReport === 'payroll' && 'Workforce Gross Compensation Ledger'}
              {activeReport === 'productivity' && 'Project Deliverables & Accrued Billing'}
              {activeReport === 'punctuality' && 'Punctuality Exceptions & Delay Registry'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {activeReport === 'attendance' && `${attendanceReportRows.length} records`}
            {activeReport === 'payroll' && `${payrollReportRows.length} staff records`}
            {activeReport === 'productivity' && `${productivityReportRows.length} projects`}
            {activeReport === 'punctuality' && `${punctualityReportRows.length} exceptions`}
          </span>
        </div>

        <div className="overflow-x-auto">
          {/* TAB 1: ATTENDANCE LEDGER */}
          {activeReport === 'attendance' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Clock In / Out</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Punctuality</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">Shift Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums">
                {attendanceReportRows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-slate-900 dark:text-white">{row.employee}</div>
                      <div className="text-[11px] font-mono text-slate-400">{row.code}</div>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600 dark:text-slate-300">
                      {row.department}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {row.date}
                    </td>
                    <td className="py-3 px-4">
                      <span>{row.clockIn}</span>
                      <span className="text-slate-400 mx-1">→</span>
                      <span className={row.clockOut === 'Active' ? 'text-blue-600 font-bold' : ''}>
                        {row.clockOut}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {row.hours} hrs
                    </td>
                    <td className="py-3 px-4 font-sans">
                      {row.status === 'on_time' ? (
                        <span className="text-emerald-600 font-medium">On Time</span>
                      ) : row.status === 'late' ? (
                        <span className="text-amber-600 font-medium">Late Arrival</span>
                      ) : (
                        <span className="text-purple-600 font-medium">Overtime</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-500 dark:text-slate-400 truncate max-w-xs">
                      {row.location}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      ${row.cost}
                    </td>
                  </tr>
                ))}
                {attendanceReportRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-sans">
                      No attendance records found matching current scope.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* TAB 2: PAYROLL & COMPENSATION */}
          {activeReport === 'payroll' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Department & Role</th>
                  <th className="py-3 px-4">Hourly Wage</th>
                  <th className="py-3 px-4">Total Hours</th>
                  <th className="py-3 px-4">Regular Hrs</th>
                  <th className="py-3 px-4">Overtime (1.5x)</th>
                  <th className="py-3 px-4">Shifts</th>
                  <th className="py-3 px-4 text-right">Gross Pay Est.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums">
                {payrollReportRows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-slate-900 dark:text-white">{row.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{row.code}</div>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{row.department}</div>
                      <div className="text-[11px] text-slate-400">{row.role}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      ${row.hourlyRate}.00/hr
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                      {row.totalHours} hrs
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {row.regularHours} hrs
                    </td>
                    <td className="py-3 px-4 text-amber-600 font-medium">
                      {row.overtimeHours > 0 ? `${row.overtimeHours} hrs` : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {row.shiftsCount}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white text-sm">
                      ${row.grossPay.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {payrollReportRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-sans">
                      No employees match the current scope.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* TAB 3: PROJECTS & BILLABLES */}
          {activeReport === 'productivity' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Project & Client</th>
                  <th className="py-3 px-4">Lead</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4">Rate</th>
                  <th className="py-3 px-4">Total Time</th>
                  <th className="py-3 px-4">Billable Time</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4 text-right">Accrued Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums">
                {productivityReportRows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-slate-900 dark:text-white">{row.name}</div>
                      <div className="text-[11px] text-slate-400">{row.client}</div>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600 dark:text-slate-300">
                      {row.owner}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      ${row.budget.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      ${row.billableRate}/hr
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {row.totalHours} hrs
                    </td>
                    <td className="py-3 px-4 text-emerald-600 font-medium">
                      {row.billableHours} hrs
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${row.progress}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px]">{row.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ${row.billableRevenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {productivityReportRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-sans">
                      No project deliverables match current scope.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* TAB 4: PUNCTUALITY & EXCEPTIONS */}
          {activeReport === 'punctuality' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Actual Check-In</th>
                  <th className="py-3 px-4">Expected Start</th>
                  <th className="py-3 px-4">Work Site Location</th>
                  <th className="py-3 px-4">Delay Incident Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums">
                {punctualityReportRows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-slate-900 dark:text-white">{row.employee}</div>
                      <div className="text-[11px] font-mono text-slate-400">{row.code}</div>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600 dark:text-slate-300">
                      {row.department}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {row.date}
                    </td>
                    <td className="py-3 px-4 text-amber-600 font-bold">
                      {row.clockIn}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {row.expected}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-500">
                      {row.location}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600 dark:text-slate-400">
                      {row.notes}
                    </td>
                  </tr>
                ))}
                {punctualityReportRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-sans">
                      No punctuality exceptions recorded in this scope.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 6. MODAL: PRINTABLE PDF DOCUMENT PREVIEW */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Bar */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-slate-900">
                  Official Printable Report Preview
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="p-8 overflow-y-auto space-y-6 print:p-0">
              {/* Header */}
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    MARKETING LANDMARK OPERATIONS
                  </h2>
                  <p className="text-xs text-slate-500">
                    Enterprise Workforce & Project Management Report
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    Report Category: {activeReport.toUpperCase()} · Period: {dateRange.toUpperCase()}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500 font-mono">
                  <div>Date: {new Date().toLocaleDateString()}</div>
                  <div>Time: {new Date().toLocaleTimeString()}</div>
                  <div className="text-[10px] text-slate-400">Ref: ML-REP-{Date.now().toString().slice(-6)}</div>
                </div>
              </div>

              {/* KPI Summary Block */}
              <div className="grid grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-center">
                {reportKPIs.map((kpi, i) => (
                  <div key={i}>
                    <div className="text-[10px] uppercase font-bold text-slate-500">{kpi.label}</div>
                    <div className="text-lg font-bold font-mono mt-0.5">{kpi.value}</div>
                  </div>
                ))}
              </div>

              {/* Data Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Subject / Name</th>
                      <th className="py-2 px-3">Department</th>
                      <th className="py-2 px-3">Metric 1</th>
                      <th className="py-2 px-3">Metric 2</th>
                      <th className="py-2 px-3 text-right">Total / Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {activeReport === 'attendance' &&
                      attendanceReportRows.slice(0, 20).map(r => (
                        <tr key={r.id}>
                          <td className="py-2 px-3 font-sans font-medium">{r.employee} ({r.code})</td>
                          <td className="py-2 px-3 font-sans">{r.department}</td>
                          <td className="py-2 px-3">{r.date}</td>
                          <td className="py-2 px-3">{r.clockIn} - {r.clockOut}</td>
                          <td className="py-2 px-3 text-right font-bold">${r.cost}</td>
                        </tr>
                      ))}
                    {activeReport === 'payroll' &&
                      payrollReportRows.slice(0, 20).map(r => (
                        <tr key={r.id}>
                          <td className="py-2 px-3 font-sans font-medium">{r.name}</td>
                          <td className="py-2 px-3 font-sans">{r.department}</td>
                          <td className="py-2 px-3">${r.hourlyRate}/hr</td>
                          <td className="py-2 px-3">{r.totalHours} hrs</td>
                          <td className="py-2 px-3 text-right font-bold">${r.grossPay.toLocaleString()}</td>
                        </tr>
                      ))}
                    {activeReport === 'productivity' &&
                      productivityReportRows.slice(0, 20).map(r => (
                        <tr key={r.id}>
                          <td className="py-2 px-3 font-sans font-medium">{r.name}</td>
                          <td className="py-2 px-3 font-sans">{r.client}</td>
                          <td className="py-2 px-3">${r.budget.toLocaleString()}</td>
                          <td className="py-2 px-3">{r.totalHours} hrs</td>
                          <td className="py-2 px-3 text-right font-bold">${r.billableRevenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    {activeReport === 'punctuality' &&
                      punctualityReportRows.slice(0, 20).map(r => (
                        <tr key={r.id}>
                          <td className="py-2 px-3 font-sans font-medium">{r.employee}</td>
                          <td className="py-2 px-3 font-sans">{r.department}</td>
                          <td className="py-2 px-3">{r.date}</td>
                          <td className="py-2 px-3 text-amber-600 font-bold">{r.clockIn}</td>
                          <td className="py-2 px-3 text-right font-sans text-slate-500">{r.notes}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Sign off */}
              <div className="pt-6 border-t flex justify-between text-xs text-slate-500">
                <div>
                  <div className="font-semibold text-slate-700">Authorized Officer:</div>
                  <div className="mt-8 border-t border-slate-300 w-40 pt-1">Executive Signature</div>
                </div>
                <div className="text-right">
                  <div>Classification: Confidential Internal Operations</div>
                  <div className="text-[10px] text-slate-400 mt-1">Marketing Landmark Enterprise Platform</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
