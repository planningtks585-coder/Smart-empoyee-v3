export type Language = 'en' | 'km';

export interface Employee {
  id: string;
  name: string;
  email: string;
  employeeCode: string;
  role: string;
  department: string;
  avatar: string;
  hourlyRate: number;
  phone: string;
  joinDate: string;
}

export type ShiftType = 'morning' | 'evening';

export interface BreakRecord {
  id: string;
  type: 'short' | 'lunch';
  start: string;
  end: string | null;
  durationMinutes: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  location: string;
  shiftType?: ShiftType;
  breaks: BreakRecord[];
  totalMinutes: number;
  status: 'on_time' | 'late' | 'overtime';
  notes: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  assignedTo: string;
  completed: boolean;
  estimatedHours: number;
  loggedMinutes: number;
  billable: boolean;
  dueDate: string;
  priority?: 'urgent' | 'high' | 'medium' | 'low';
  status?: 'todo' | 'in_progress' | 'in_review' | 'completed';
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: 'active' | 'completed' | 'archived';
  budget: number;
  billableRate: number;
  dueDate: string;
  description: string;
  planOwnerId?: string;
  planOwnerName?: string;
  priority?: 'urgent' | 'high' | 'medium' | 'low';
}

export interface ShiftTimelineItem {
  id: string;
  label: string;
  time: string;
  type: 'clock_in' | 'short_break' | 'lunch_break' | 'clock_out';
  completed: boolean;
}

export interface ShiftItem {
  id: string;
  employeeId: string;
  date: string;
  dayName: string;
  dayNumber: number;
  role: string;
  startTime: string;
  endTime: string;
  hours: number;
  location: string;
  timeline: ShiftTimelineItem[];
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'Annual' | 'Sick' | 'Casual' | 'Emergency';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
}

export interface LocationSite {
  id: string;
  name: string;
  address: string;
  activeCount: number;
  radiusMeters: number;
}

export interface DepartmentItem {
  name: string;
  count: number;
  budget: number;
  lead: string;
}

export type Department = DepartmentItem;

export interface UserAccount {
  id: string;
  phone: string;
  password?: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user' | 'employee';
  employeeId?: string;
  shiftPreference?: 'morning' | 'evening' | 'flexible';
}

export interface Deal {
  id: string;
  title: string;
  client: string;
  contactPerson: string;
  phone: string;
  value: number;
  stage: 'lead' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost';
  assignedRep: string;
  expectedCloseDate: string;
  notes: string;
  createdAt: string;
}

export interface CianPunchState {
  clockedIn: boolean;
  clockInTime: string | null;
  currentLocation: string;
  shiftType?: ShiftType | null;
  onBreak: boolean;
  breakType: 'short' | 'lunch' | null;
  breakStartTime: string | null;
  breaksToday: BreakRecord[];
  todayMinutes: number;
}

export interface AppMetrics {
  totalEmployees: number;
  workingNow: number;
  presentToday: number;
  lateToday: number;
  onLeaveToday: number;
  attendanceRate: string;
  attendanceBreakdown: {
    present: number;
    late: number;
    absent: number;
    onLeave: number;
  };
}

export interface TelegramSettings {
  enabled: boolean;
  botToken: string;
  chatId: string;
  webhookUrl: string;
  notificationTypes: {
    taskUpdates: boolean;
    shiftReminders: boolean;
    attendancePunches: boolean;
    leaveRequests: boolean;
    dailyDigest: boolean;
  };
  lastPingStatus: 'healthy' | 'idle' | 'failed';
  lastPingAt: string | null;
  recentDispatches: Array<{
    id: string;
    event: string;
    message: string;
    timestamp: string;
    status: 'delivered' | 'simulated';
  }>;
}

export interface ShiftConfig {
  morningShift: {
    name: string;
    startTime: string;
    endTime: string;
    gracePeriodMinutes: number;
  };
  eveningShift: {
    name: string;
    startTime: string;
    endTime: string;
    gracePeriodMinutes: number;
  };
  autoReminders: boolean;
}

export interface RolePermission {
  module: string;
  label: string;
  admin: boolean;
  manager: boolean;
  user: boolean;
  description: string;
}

export interface AppState {
  company: {
    name: string;
    adminEmail: string;
    domain: string;
  };
  currentUser: Employee;
  cianPunchState: CianPunchState;
  metrics: AppMetrics;
  employees: Employee[];
  departments: DepartmentItem[];
  locations: LocationSite[];
  projects: Project[];
  tasks: Task[];
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  weeklyShifts: ShiftItem[];
  salesDeals: Deal[];
  telegramSettings?: TelegramSettings;
  shiftConfig?: ShiftConfig;
}

export type ActiveTab =
  | 'dashboard'
  | 'shifts'
  | 'clock'
  | 'projects'
  | 'sales'
  | 'employees'
  | 'attendance'
  | 'departments'
  | 'leave'
  | 'locations'
  | 'reports'
  | 'admin_hub'
  | 'settings';

export type UserRoleMode = 'admin' | 'manager' | 'user' | 'employee';

