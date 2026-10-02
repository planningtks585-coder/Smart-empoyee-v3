import {
  Employee,
  AttendanceRecord,
  Task,
  Project,
  ShiftItem,
  LeaveRequest,
  Department,
  LocationSite,
  Deal,
  TelegramSettings,
  UserAccount,
  ShiftConfig,
  RolePermission
} from '../types';

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  targetId?: string;
  details: string;
  timestamp: string;
}

export interface AppDatabaseSchema {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  projects: Project[];
  tasks: Task[];
  shifts: ShiftItem[];
  leaveRequests: LeaveRequest[];
  departments: Department[];
  locations: LocationSite[];
  deals: Deal[];
  userAccounts: UserAccount[];
  shiftConfig: ShiftConfig;
  rolePermissions: RolePermission[];
  telegramSettings: TelegramSettings;
  auditLogs: AuditLog[];
  metadata: {
    initializedAt: string;
    lastSavedAt: string;
    version: string;
  };
}

export interface SystemMetrics {
  uptimeSeconds: number;
  totalRequests: number;
  activeSessions: number;
  requestsByMethod: Record<string, number>;
  statusCodes: Record<string, number>;
  averageLatencyMs: number;
  memoryUsage: {
    rssMb: number;
    heapUsedMb: number;
    heapTotalMb: number;
  };
  recordCounts: {
    employees: number;
    attendance: number;
    projects: number;
    tasks: number;
    shifts: number;
    leaves: number;
    deals: number;
    accounts: number;
  };
}

export interface TestSuiteResult {
  suiteName: string;
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  durationMs: number;
  tests: Array<{
    name: string;
    passed: boolean;
    durationMs: number;
    error?: string;
  }>;
}
