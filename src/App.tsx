import React, { useState, useEffect } from 'react';
import {
  AppState,
  ActiveTab,
  UserRoleMode,
  CianPunchState,
  Project,
  Task,
  LeaveRequest,
  Employee,
  Deal,
  Language
} from './types';
import {
  fetchAppState,
  INITIAL_FALLBACK_STATE,
  clockInAPI,
  clockOutAPI,
  toggleBreakAPI,
  createProjectAPI,
  createTaskAPI,
  toggleTaskCompleteAPI,
  logTaskTimeAPI,
  setTaskTimeAPI,
  createLeaveAPI,
  updateLeaveStatusAPI,
  createEmployeeAPI,
  updateEmployeeAPI,
  deleteEmployeeAPI,
  createDealAPI,
  updateDealStageAPI,
  updateAttendanceAPI,
  addManualAttendanceAPI,
  deleteAttendanceAPI,
  deleteProjectAPI,
  deleteTaskAPI
} from './api/client';
import { Header } from './components/Header';
import { SidebarDrawer } from './components/SidebarDrawer';
import { DesktopSidebar } from './components/DesktopSidebar';
import { BottomNav } from './components/BottomNav';
import { ClockInOutScreen } from './components/ClockInOutScreen';
import { ShiftSchedulesScreen } from './components/ShiftSchedulesScreen';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ProjectsTasksScreen } from './components/ProjectsTasksScreen';
import { SalesScreen } from './components/SalesScreen';
import { ExportReportsScreen } from './components/ExportReportsScreen';
import { EmployeesScreen } from './components/EmployeesScreen';
import { AttendanceScreen } from './components/AttendanceScreen';
import { DepartmentsScreen } from './components/DepartmentsScreen';
import { LeaveScreen } from './components/LeaveScreen';
import { LocationsScreen } from './components/LocationsScreen';
import { LoginScreen } from './components/LoginScreen';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { AccountSettingsModal } from './components/AccountSettingsModal';
import { AdminManagementHub } from './components/AdminManagementHub';
import { AlertsSettingsModal } from './components/AlertsSettingsModal';
import { SystemSettingsScreen } from './components/SystemSettingsScreen';
import { OfflineIndicator } from './components/OfflineIndicator';
import { translations } from './i18n/translations';
import { Mic, Sparkles } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [roleMode, setRoleMode] = useState<UserRoleMode>('employee');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [theme, setTheme] = useState<'auto' | 'light' | 'dark'>('light');
  const [lang, setLang] = useState<Language>('en');

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        if (parsed.role === 'admin') setRoleMode('admin');
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Handle dark mode class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // Handle language and Khmer font on HTML root and body
  useEffect(() => {
    document.documentElement.lang = lang;
    if (lang === 'km') {
      document.documentElement.classList.add('font-khmer');
      document.body.classList.add('font-khmer');
    } else {
      document.documentElement.classList.remove('font-khmer');
      document.body.classList.remove('font-khmer');
    }
  }, [lang]);

  // Load state from backend on mount with resilient offline fallback
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await fetchAppState();
        if (mounted) setAppState(data || INITIAL_FALLBACK_STATE);
      } catch (err) {
        console.error('Failed to load initial state:', err);
        if (mounted) setAppState(INITIAL_FALLBACK_STATE);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    // Safety fallback timeout: never hang more than 1.2 seconds
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        setAppState(prev => prev || INITIAL_FALLBACK_STATE);
        setLoading(false);
      }
    }, 1200);

    load();

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  // Handlers for Clock In / Out
  const handleClockIn = async (location: string, notes: string) => {
    try {
      const res = await clockInAPI(location, notes);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          cianPunchState: res.cianPunchState,
          attendanceRecords: [res.record, ...prev.attendanceRecords],
          metrics: {
            ...prev.metrics,
            workingNow: prev.metrics.workingNow + 1,
            presentToday: prev.metrics.presentToday + 1
          }
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleClockOut = async (notes: string) => {
    try {
      const res = await clockOutAPI(notes);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          cianPunchState: res.cianPunchState,
          attendanceRecords: prev.attendanceRecords.map(r =>
            r.employeeId === 'emp_cian' && !r.clockOut ? res.record : r
          ),
          metrics: {
            ...prev.metrics,
            workingNow: Math.max(0, prev.metrics.workingNow - 1)
          }
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBreak = async (type: 'short' | 'lunch') => {
    try {
      const res = await toggleBreakAPI(type);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          cianPunchState: res.cianPunchState
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAttendance = async (id: string, data: any) => {
    try {
      const res = await updateAttendanceAPI(id, data);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          attendanceRecords: prev.attendanceRecords.map(r => (r.id === id ? res.record : r))
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddManualAttendance = async (data: any) => {
    try {
      const res = await addManualAttendanceAPI(data);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          attendanceRecords: [res.record, ...prev.attendanceRecords]
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Projects & Tasks Handlers
  const handleCreateProject = async (projData: Partial<Project>) => {
    try {
      const res = await createProjectAPI(projData);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          projects: [res.project, ...prev.projects]
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const res = await createTaskAPI(taskData);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: [res.task, ...prev.tasks]
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTaskComplete = async (taskId: string) => {
    try {
      const res = await toggleTaskCompleteAPI(taskId);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map(t => (t.id === taskId ? res.task : t))
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogTaskTime = async (taskId: string, minutes: number) => {
    try {
      const res = await logTaskTimeAPI(taskId, minutes);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map(t => (t.id === taskId ? res.task : t))
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetTaskTime = async (taskId: string, loggedMinutes: number) => {
    try {
      const res = await setTaskTimeAPI(taskId, loggedMinutes);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map(t => (t.id === taskId ? res.task : t))
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProjectAPI(projectId);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          projects: prev.projects.filter(p => p.id !== projectId),
          tasks: prev.tasks.filter(t => t.projectId !== projectId)
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTaskAPI(taskId);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.filter(t => t.id !== taskId)
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Sales Handlers
  const handleCreateDeal = async (dealData: Partial<Deal>) => {
    try {
      const res = await createDealAPI(dealData);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          salesDeals: res.deals || [res.deal, ...prev.salesDeals]
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateDealStage = async (dealId: string, stage: Deal['stage']) => {
    try {
      const res = await updateDealStageAPI(dealId, stage);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          salesDeals: prev.salesDeals.map(d => (d.id === dealId ? { ...d, stage } : d))
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Leave Handlers
  const handleCreateLeave = async (leaveData: Partial<LeaveRequest>) => {
    try {
      const res = await createLeaveAPI(leaveData);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          leaveRequests: [res.leave, ...prev.leaveRequests]
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLeaveStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await updateLeaveStatusAPI(id, status);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          leaveRequests: prev.leaveRequests.map(l => (l.id === id ? res.leave : l))
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Employees Handler
  const handleCreateEmployee = async (empData: Partial<Employee>) => {
    try {
      const res = await createEmployeeAPI(empData);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          employees: [...prev.employees, res.employee],
          metrics: {
            ...prev.metrics,
            totalEmployees: prev.metrics.totalEmployees + 1
          }
        };
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleUpdateEmployee = async (id: string, empData: Partial<Employee>) => {
    try {
      const res = await updateEmployeeAPI(id, empData);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          employees: prev.employees.map(e => (e.id === id ? res.employee : e))
        };
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await deleteEmployeeAPI(id);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          employees: prev.employees.filter(e => e.id !== id),
          metrics: {
            ...prev.metrics,
            totalEmployees: Math.max(0, prev.metrics.totalEmployees - 1)
          }
        };
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleDeleteAttendance = async (id: string) => {
    try {
      await deleteAttendanceAPI(id);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          attendanceRecords: prev.attendanceRecords.filter(r => r.id !== id)
        };
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Sign out handler
  const handleSignOut = () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    setCurrentUser(null);
  };

  const toggleLanguage = () => {
    setLang(l => (l === 'en' ? 'km' : 'en'));
  };

  if (loading || !appState) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center animate-pulse">
            <span className="text-white font-extrabold text-lg">ML</span>
          </div>
          <p className="text-sm font-semibold text-slate-200">Marketing Landmark</p>
          <p className="text-xs text-slate-400">Loading Workforce, Sales & AI Engine...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show LoginScreen
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'admin') setRoleMode('admin');
        }}
        lang={lang}
        onToggleLang={toggleLanguage}
      />
    );
  }

  const t = translations[lang];

  // Derive Screen Title
  let screenTitle = t.dashboard;
  if (activeTab === 'clock') screenTitle = t.clockInOut;
  else if (activeTab === 'shifts') screenTitle = t.shiftSchedules;
  else if (activeTab === 'projects') screenTitle = t.projectsTasks;
  else if (activeTab === 'sales') screenTitle = t.salesManagement;
  else if (activeTab === 'reports') screenTitle = t.exportReports;
  else if (activeTab === 'employees') screenTitle = t.employees;
  else if (activeTab === 'attendance') screenTitle = t.attendance;
  else if (activeTab === 'departments') screenTitle = t.departments;
  else if (activeTab === 'leave') screenTitle = t.leave;
  else if (activeTab === 'locations') screenTitle = t.locations;
  else if (activeTab === 'admin_hub') screenTitle = t.adminHub;
  else if (activeTab === 'settings') screenTitle = t.systemSettings || 'System Settings';

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'settings':
        return (
          <SystemSettingsScreen
            appState={appState}
            roleMode={roleMode}
            onRefreshState={async () => {
              try {
                const data = await fetchAppState();
                if (data) setAppState(data);
              } catch (e) {
                console.error(e);
              }
            }}
            lang={lang}
          />
        );
      case 'admin_hub':
        return (
          <AdminManagementHub
            appState={appState}
            onRefreshState={async () => {
              try {
                const data = await fetchAppState();
                setAppState(data);
              } catch (e) {
                console.error(e);
              }
            }}
            lang={lang}
          />
        );
      case 'dashboard':
        return roleMode === 'admin' ? (
          <AdminDashboard
            metrics={appState.metrics}
            recentAttendance={appState.attendanceRecords}
            employees={appState.employees}
            departments={appState.departments}
            leaveRequests={appState.leaveRequests}
            projects={appState.projects}
            weeklyShifts={appState.weeklyShifts}
            onUpdateLeaveStatus={handleUpdateLeaveStatus}
            onAddManualAttendance={handleAddManualAttendance}
            onRefreshState={async () => {
              try {
                const data = await fetchAppState();
                if (data) setAppState(data);
              } catch (e) {
                console.error(e);
              }
            }}
            onNavigateTab={setActiveTab}
            lang={lang}
          />
        ) : (
          <EmployeeDashboard
            punchState={appState.cianPunchState}
            onNavigateTab={setActiveTab}
            onRequestLeave={() => setActiveTab('leave')}
            lang={lang}
          />
        );
      case 'clock':
        // Admin must not clock in/out - redirect to Attendance Ledger
        if (roleMode === 'admin') {
          return (
            <AttendanceScreen
              records={appState.attendanceRecords}
              onUpdateRecord={handleUpdateAttendance}
              onAddRecord={handleAddManualAttendance}
              onDeleteRecord={handleDeleteAttendance}
              employees={appState.employees}
              departments={appState.departments}
              lang={lang}
            />
          );
        }
        return (
          <ClockInOutScreen
            punchState={appState.cianPunchState}
            attendanceHistory={appState.attendanceRecords}
            locations={appState.locations}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
            onToggleBreak={handleToggleBreak}
            onUpdateAttendance={handleUpdateAttendance}
            lang={lang}
          />
        );
      case 'shifts':
        return (
          <ShiftSchedulesScreen
            shifts={appState.weeklyShifts}
            onBackToDashboard={() => setActiveTab('dashboard')}
            lang={lang}
          />
        );
      case 'projects':
        return (
          <ProjectsTasksScreen
            projects={appState.projects}
            tasks={appState.tasks}
            employees={appState.employees}
            onCreateProject={handleCreateProject}
            onCreateTask={handleCreateTask}
            onToggleTaskComplete={handleToggleTaskComplete}
            onLogTaskTime={handleLogTaskTime}
            onSetTaskTime={handleSetTaskTime}
            onDeleteProject={handleDeleteProject}
            onDeleteTask={handleDeleteTask}
            lang={lang}
          />
        );
      case 'sales':
        return (
          <SalesScreen
            deals={appState.salesDeals || []}
            lang={lang}
            onCreateDeal={handleCreateDeal}
            onUpdateStage={handleUpdateDealStage}
          />
        );
      case 'reports':
        return (
          <ExportReportsScreen
            attendance={appState.attendanceRecords}
            employees={appState.employees}
            departments={appState.departments}
            projects={appState.projects}
            tasks={appState.tasks}
            shifts={appState.weeklyShifts}
            metrics={appState.metrics}
            lang={lang}
          />
        );
      case 'employees':
        return (
          <EmployeesScreen
            employees={appState.employees}
            onCreateEmployee={handleCreateEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            roleMode={roleMode}
            lang={lang}
          />
        );
      case 'attendance':
        return (
          <AttendanceScreen
            records={appState.attendanceRecords}
            onUpdateRecord={handleUpdateAttendance}
            onAddRecord={handleAddManualAttendance}
            onDeleteRecord={handleDeleteAttendance}
            employees={appState.employees}
            departments={appState.departments}
            lang={lang}
          />
        );
      case 'departments':
        return <DepartmentsScreen departments={appState.departments} lang={lang} />;
      case 'leave':
        return (
          <LeaveScreen
            requests={appState.leaveRequests}
            roleMode={roleMode}
            onRequestLeave={handleCreateLeave}
            onUpdateStatus={handleUpdateLeaveStatus}
            lang={lang}
          />
        );
      case 'locations':
        return <LocationsScreen locations={appState.locations} lang={lang} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col antialiased">
      {/* Permanent Fixed Desktop Sidebar for Full Width View */}
      <DesktopSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        roleMode={roleMode}
        theme={theme}
        onSetTheme={setTheme}
        lang={lang}
        onToggleLang={toggleLanguage}
        onOpenVoiceAssistant={() => setIsVoiceOpen(true)}
        onSignOut={handleSignOut}
        onOpenAccountSettings={() => setIsAccountSettingsOpen(true)}
        currentUser={currentUser}
      />

      {/* Main Content Area (Spans full width, indented on desktop) */}
      <div className="lg:pl-72 flex-1 flex flex-col w-full min-h-screen">
        {/* Global App Header */}
        <Header
          title={screenTitle}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          roleMode={roleMode}
          lang={lang}
          onToggleLang={toggleLanguage}
          onOpenVoiceAssistant={() => setIsVoiceOpen(true)}
          onSignOut={handleSignOut}
          onOpenAccountSettings={() => setIsAccountSettingsOpen(true)}
          currentUser={currentUser}
        />

        {/* Slide-out Menu Drawer for Mobile / Small screens */}
        <SidebarDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          roleMode={roleMode}
          theme={theme}
          onSetTheme={setTheme}
          lang={lang}
          onToggleLang={toggleLanguage}
          onOpenVoiceAssistant={() => setIsVoiceOpen(true)}
          onSignOut={handleSignOut}
          onOpenAccountSettings={() => setIsAccountSettingsOpen(true)}
          currentUser={currentUser}
        />

        {/* Screen Viewport with Full Width Content Layout */}
        <main className="flex-1 w-full bg-slate-50 dark:bg-slate-950 transition-colors pb-20 lg:pb-0">
          {renderActiveScreen()}
        </main>

        {/* Bottom Persistent Navigation Bar (Mobile only) */}
        <div className="lg:hidden">
          <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} lang={lang} roleMode={roleMode} />
        </div>
      </div>

      {/* Floating Action Button for Voice Assistant (Quick Access) */}
      <div className="fixed bottom-20 sm:bottom-8 right-4 sm:right-6 z-30">
        <button
          onClick={() => setIsVoiceOpen(true)}
          aria-label="Open Voice Assistant"
          className="w-13 h-13 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-500/35 hover:scale-105 active:scale-95 flex items-center justify-center transition-all group"
          title={t.voiceAssistant}
        >
          <Mic className="w-6 h-6 animate-pulse" />
          <span className="sr-only">{t.voiceAssistant}</span>
        </button>
      </div>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        lang={lang}
        onStateUpdated={(projects, tasks) => {
          setAppState(prev => (prev ? { ...prev, projects, tasks } : prev));
        }}
      />

      {/* Manage Account & Password Modal */}
      <AccountSettingsModal
        isOpen={isAccountSettingsOpen}
        onClose={() => setIsAccountSettingsOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updated) => {
          setCurrentUser(updated);
        }}
        lang={lang}
        roleMode={roleMode}
      />
    </div>
  );
}
