import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppDatabaseSchema, AuditLog } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'database.json');
const BACKUP_PATH = path.join(DATA_DIR, 'database.backup.json');

// Default initial database seed
const INITIAL_DATABASE: AppDatabaseSchema = {
  employees: [
    {
      id: 'emp_cian',
      name: 'Cian',
      email: 'cian@marketinglandmark.com',
      employeeCode: 'EMP-9823419082341',
      role: 'Senior Ads Specialist',
      department: 'Marketing',
      avatar: 'C',
      hourlyRate: 55,
      phone: '+855 12 888 999',
      joinDate: '2024-01-15'
    },
    {
      id: 'emp_sarah',
      name: 'Sarah Jenkins',
      email: 'sarah.j@marketinglandmark.com',
      employeeCode: 'EMP-9823419082342',
      role: 'Growth Marketing Lead',
      department: 'Marketing',
      avatar: 'S',
      hourlyRate: 65,
      phone: '+855 98 777 666',
      joinDate: '2023-06-01'
    },
    {
      id: 'emp_marcus',
      name: 'Marcus Vance',
      email: 'marcus.v@marketinglandmark.com',
      employeeCode: 'EMP-9823419082343',
      role: 'Performance Analyst',
      department: 'Marketing',
      avatar: 'M',
      hourlyRate: 48,
      phone: '+855 10 333 444',
      joinDate: '2024-03-10'
    },
    {
      id: 'emp_elena',
      name: 'Elena Rostova',
      email: 'elena.r@marketinglandmark.com',
      employeeCode: 'EMP-9823419082344',
      role: 'SEO & Content Strategist',
      department: 'Marketing',
      avatar: 'E',
      hourlyRate: 50,
      phone: '+855 77 222 111',
      joinDate: '2024-02-20'
    }
  ],
  attendanceRecords: [
    {
      id: 'att_1',
      employeeId: 'emp_cian',
      employeeName: 'Cian',
      date: '2026-10-02',
      clockIn: '09:00 AM',
      clockOut: null,
      location: 'Phnom Penh Main Landmark Hub',
      shiftType: 'morning',
      breaks: [],
      totalMinutes: 240,
      status: 'on_time',
      notes: 'Morning campaign launch sprint'
    },
    {
      id: 'att_2',
      employeeId: 'emp_sarah',
      employeeName: 'Sarah Jenkins',
      date: '2026-10-02',
      clockIn: '08:45 AM',
      clockOut: null,
      location: 'Phnom Penh Main Landmark Hub',
      shiftType: 'morning',
      breaks: [],
      totalMinutes: 255,
      status: 'on_time',
      notes: 'Executive strategy review'
    },
    {
      id: 'att_3',
      employeeId: 'emp_marcus',
      employeeName: 'Marcus Vance',
      date: '2026-10-01',
      clockIn: '09:20 AM',
      clockOut: '05:30 PM',
      location: 'Phnom Penh Main Landmark Hub',
      shiftType: 'morning',
      breaks: [
        {
          id: 'brk_1',
          type: 'lunch',
          start: '12:30 PM',
          end: '01:30 PM',
          durationMinutes: 60
        }
      ],
      totalMinutes: 430,
      status: 'late',
      notes: 'Traffic on Norodom Blvd'
    },
    {
      id: 'att_4',
      employeeId: 'emp_elena',
      employeeName: 'Elena Rostova',
      date: '2026-10-01',
      clockIn: '08:30 AM',
      clockOut: '06:15 PM',
      location: 'Phnom Penh Main Landmark Hub',
      shiftType: 'morning',
      breaks: [],
      totalMinutes: 525,
      status: 'overtime',
      notes: 'Q4 SEO content push'
    }
  ],
  projects: [
    {
      id: 'proj_apex',
      name: 'Apex Brand Refresh',
      client: 'Apex Global',
      status: 'active',
      budget: 18000,
      billableRate: 95,
      dueDate: '2026-10-25',
      description: 'Full visual identity revamp and multi-channel marketing deployment.',
      planOwnerId: 'emp_sarah',
      planOwnerName: 'Sarah Jenkins',
      priority: 'high'
    },
    {
      id: 'proj_nexus',
      name: 'Nexus Q4 Acquisition Funnel',
      client: 'Nexus Technologies',
      status: 'active',
      budget: 25000,
      billableRate: 110,
      dueDate: '2026-11-15',
      description: 'Omni-channel paid performance media campaign & funnel optimization.',
      planOwnerId: 'emp_cian',
      planOwnerName: 'Cian',
      priority: 'urgent'
    },
    {
      id: 'proj_zenith',
      name: 'Zenith Organic Growth & SEO',
      client: 'Zenith Ventures',
      status: 'active',
      budget: 12000,
      billableRate: 85,
      dueDate: '2026-12-01',
      description: 'Technical SEO site architecture and editorial calendar execution.',
      planOwnerId: 'emp_elena',
      planOwnerName: 'Elena Rostova',
      priority: 'medium'
    }
  ],
  tasks: [
    {
      id: 'task_1',
      projectId: 'proj_apex',
      title: 'Finalize brand guidelines deck',
      assignedTo: 'emp_sarah',
      completed: true,
      estimatedHours: 8,
      loggedMinutes: 480,
      billable: true,
      dueDate: '2026-10-05',
      priority: 'high',
      status: 'completed'
    },
    {
      id: 'task_2',
      projectId: 'proj_apex',
      title: 'Design display ads batch 1',
      assignedTo: 'emp_cian',
      completed: false,
      estimatedHours: 12,
      loggedMinutes: 360,
      billable: true,
      dueDate: '2026-10-12',
      priority: 'medium',
      status: 'in_progress'
    },
    {
      id: 'task_3',
      projectId: 'proj_nexus',
      title: 'Setup Google Tag Manager attribution',
      assignedTo: 'emp_cian',
      completed: false,
      estimatedHours: 6,
      loggedMinutes: 180,
      billable: true,
      dueDate: '2026-10-08',
      priority: 'urgent',
      status: 'in_progress'
    },
    {
      id: 'task_4',
      projectId: 'proj_nexus',
      title: 'Launch TikTok Spark ads campaign',
      assignedTo: 'emp_marcus',
      completed: false,
      estimatedHours: 10,
      loggedMinutes: 0,
      billable: true,
      dueDate: '2026-10-15',
      priority: 'high',
      status: 'todo'
    },
    {
      id: 'task_5',
      projectId: 'proj_zenith',
      title: 'Conduct core web vitals speed audit',
      assignedTo: 'emp_elena',
      completed: false,
      estimatedHours: 5,
      loggedMinutes: 120,
      billable: true,
      dueDate: '2026-10-10',
      priority: 'medium',
      status: 'in_progress'
    }
  ],
  shifts: [
    {
      id: 'shift_mon',
      employeeId: 'emp_cian',
      date: '2026-10-05',
      dayName: 'Mon',
      dayNumber: 5,
      role: 'Senior Ads Specialist',
      startTime: '8:30 AM',
      endTime: '5:30 PM',
      hours: 8,
      location: 'Marketing Landmark Hub',
      timeline: [
        { id: 't1', label: 'Clock In', time: '8:30 AM', type: 'clock_in', completed: true },
        { id: 't2', label: 'Short Break', time: '10:30 AM', type: 'short_break', completed: true },
        { id: 't3', label: 'Lunch Break', time: '12:30 PM', type: 'lunch_break', completed: false },
        { id: 't4', label: 'Clock Out', time: '5:30 PM', type: 'clock_out', completed: false }
      ]
    },
    {
      id: 'shift_tue',
      employeeId: 'emp_cian',
      date: '2026-10-06',
      dayName: 'Tue',
      dayNumber: 6,
      role: 'Senior Ads Specialist',
      startTime: '8:30 AM',
      endTime: '5:30 PM',
      hours: 8,
      location: 'Marketing Landmark Hub',
      timeline: [
        { id: 't1', label: 'Clock In', time: '8:30 AM', type: 'clock_in', completed: false },
        { id: 't2', label: 'Short Break', time: '10:30 AM', type: 'short_break', completed: false },
        { id: 't3', label: 'Lunch Break', time: '12:30 PM', type: 'lunch_break', completed: false },
        { id: 't4', label: 'Clock Out', time: '5:30 PM', type: 'clock_out', completed: false }
      ]
    },
    {
      id: 'shift_wed',
      employeeId: 'emp_cian',
      date: '2026-10-07',
      dayName: 'Wed',
      dayNumber: 7,
      role: 'Senior Ads Specialist',
      startTime: '8:30 AM',
      endTime: '5:30 PM',
      hours: 8,
      location: 'Marketing Landmark Hub',
      timeline: [
        { id: 't1', label: 'Clock In', time: '8:30 AM', type: 'clock_in', completed: false },
        { id: 't2', label: 'Short Break', time: '10:30 AM', type: 'short_break', completed: false },
        { id: 't3', label: 'Lunch Break', time: '12:30 PM', type: 'lunch_break', completed: false },
        { id: 't4', label: 'Clock Out', time: '5:30 PM', type: 'clock_out', completed: false }
      ]
    }
  ],
  leaveRequests: [
    {
      id: 'leave_1',
      employeeId: 'emp_marcus',
      employeeName: 'Marcus Vance',
      type: 'Annual',
      startDate: '2026-10-18',
      endDate: '2026-10-20',
      days: 3,
      reason: 'Family event in Siem Reap',
      status: 'pending',
      appliedAt: '2026-10-01'
    },
    {
      id: 'leave_2',
      employeeId: 'emp_elena',
      employeeName: 'Elena Rostova',
      type: 'Sick',
      startDate: '2026-09-22',
      endDate: '2026-09-23',
      days: 2,
      reason: 'Seasonal flu & recovery',
      status: 'approved',
      appliedAt: '2026-09-21'
    }
  ],
  departments: [
    { name: 'Marketing', lead: 'Sarah Jenkins', count: 14, budget: 120000 },
    { name: 'Creative & Design', lead: 'Alex Chen', count: 8, budget: 85000 },
    { name: 'Sales & BD', lead: 'Visal Sok', count: 6, budget: 95000 },
    { name: 'Operations & Tech', lead: 'Cian', count: 5, budget: 70000 }
  ],
  locations: [
    { id: 'loc_main', name: 'Phnom Penh Main Landmark Hub', address: 'Monivong Blvd, Sangkat Boeung Keng Kang 1', activeCount: 22, radiusMeters: 100 },
    { id: 'loc_cre', name: 'Landmark Media Studio', address: 'Toul Kork Creative Arts Center', activeCount: 6, radiusMeters: 75 },
    { id: 'loc_rem', name: 'Remote / Field Client Locations', address: 'On-demand Client Offices & Events', activeCount: 5, radiusMeters: 500 }
  ],
  deals: [
    {
      id: 'deal_1',
      title: 'Enterprise Q4 Omnichannel Marketing Retainer',
      client: 'Apex Global Industries',
      contactPerson: 'David Miller',
      phone: '+855 12 333 444',
      value: 45000,
      stage: 'proposal',
      assignedRep: 'Visal Sok',
      expectedCloseDate: '2026-10-25',
      notes: 'Executive presentation scheduled for next Tuesday.',
      createdAt: '2026-09-28'
    },
    {
      id: 'deal_2',
      title: 'Digital Ad Buying & Analytics Implementation',
      client: 'Nexus Technologies',
      contactPerson: 'Sophia Chen',
      phone: '+855 10 999 888',
      value: 28000,
      stage: 'negotiation',
      assignedRep: 'Visal Sok',
      expectedCloseDate: '2026-10-15',
      notes: 'Finalizing SLA and tracking attribution models.',
      createdAt: '2026-09-30'
    },
    {
      id: 'deal_3',
      title: 'Brand Refresh & SEO Strategy Package',
      client: 'Zenith Ventures',
      contactPerson: 'Kenji Sato',
      phone: '+855 78 555 666',
      value: 18500,
      stage: 'won',
      assignedRep: 'Sarah Jenkins',
      expectedCloseDate: '2026-10-01',
      notes: 'Contract signed; kicked off project Apex.',
      createdAt: '2026-09-15'
    }
  ],
  userAccounts: [
    {
      id: 'user_cian',
      phone: '+855 12 888 999',
      password: 'password123',
      name: 'Cian',
      email: 'cian@marketinglandmark.com',
      role: 'employee',
      employeeId: 'emp_cian'
    },
    {
      id: 'user_sarah',
      phone: '+855 98 777 666',
      password: 'admin123',
      name: 'Sarah Jenkins',
      email: 'admin@marketinglandmark.com',
      role: 'admin',
      employeeId: 'emp_sarah'
    },
    {
      id: 'user_marcus',
      phone: '+855 10 333 444',
      password: 'password123',
      name: 'Marcus Vance',
      email: 'marcus.v@marketinglandmark.com',
      role: 'manager',
      employeeId: 'emp_marcus'
    },
    {
      id: 'user_elena',
      phone: '+855 77 222 111',
      password: 'password123',
      name: 'Elena Rostova',
      email: 'elena.r@marketinglandmark.com',
      role: 'user',
      employeeId: 'emp_elena'
    }
  ],
  shiftConfig: {
    morningShift: {
      name: 'Morning Shift',
      startTime: '08:30 AM',
      endTime: '05:30 PM',
      gracePeriodMinutes: 15
    },
    eveningShift: {
      name: 'Evening Shift',
      startTime: '01:30 PM',
      endTime: '09:30 PM',
      gracePeriodMinutes: 15
    },
    autoReminders: true
  },
  rolePermissions: [
    {
      module: 'perm_attendance',
      label: 'Time & Attendance Tracking',
      description: 'Clock in/out punches, break tracking, and personal timesheet view',
      admin: true,
      manager: true,
      user: true
    },
    {
      module: 'perm_projects_view',
      label: 'View Projects & Tasks',
      description: 'Access project treeview, task schedules, and logged hours',
      admin: true,
      manager: true,
      user: true
    },
    {
      module: 'perm_projects_manage',
      label: 'Create & Edit Projects',
      description: 'Create client projects, set budgets, assign tasks, delete entries',
      admin: true,
      manager: true,
      user: false
    },
    {
      module: 'perm_leave_approval',
      label: 'Leave Approval Authority',
      description: 'Approve or reject staff leave requests and balance allocations',
      admin: true,
      manager: true,
      user: false
    },
    {
      module: 'perm_reports_export',
      label: 'Export Payroll & Timesheet Reports',
      description: 'Download CSV and JSON financial payroll, overtime, and attendance files',
      admin: true,
      manager: true,
      user: false
    },
    {
      module: 'perm_system_config',
      label: 'System & Telegram Configuration',
      description: 'Configure Telegram webhook, bot token, system shifts, and user roles',
      admin: true,
      manager: false,
      user: false
    },
    {
      module: 'perm_voice_assistant',
      label: 'Voice Assistant Project Ops',
      description: 'Use speech-to-text Gemini AI commands for tasks & shifts',
      admin: true,
      manager: true,
      user: true
    }
  ],
  telegramSettings: {
    enabled: true,
    botToken: '6892419082:AAF39qKLZ9_0xmN83-J12L0-aP_marketing',
    chatId: '@marketinglandmark_ops',
    webhookUrl: 'https://api.telegram.org/bot6892419082:AAF39qKLZ9_0xmN83-J12L0-aP_marketing/setWebhook',
    notificationTypes: {
      taskUpdates: true,
      shiftReminders: true,
      attendancePunches: true,
      leaveRequests: true,
      dailyDigest: true
    },
    recentDispatches: [
      {
        id: 'disp_1',
        event: 'Clock-In Alert',
        message: 'Marcus Vance punched in at 09:20 AM (Late: 20 mins)',
        status: 'delivered',
        timestamp: '2026-10-01T09:20:15Z'
      },
      {
        id: 'disp_2',
        event: 'Task Finished',
        message: 'Sarah Jenkins completed task "Finalize brand guidelines deck"',
        status: 'delivered',
        timestamp: '2026-10-01T16:45:00Z'
      }
    ],
    lastPingStatus: 'healthy',
    lastPingAt: '2026-10-02T01:00:00Z'
  },
  auditLogs: [
    {
      id: 'log_1',
      action: 'SYSTEM_BOOT',
      performedBy: 'system',
      details: 'Workforce Backend Engine initialized with persistent storage',
      timestamp: new Date().toISOString()
    }
  ],
  metadata: {
    initializedAt: new Date().toISOString(),
    lastSavedAt: new Date().toISOString(),
    version: '2.0.0-fullstack'
  }
};

class DatabaseEngine {
  private data: AppDatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;
  private isSaving = false;

  constructor() {
    this.data = this.loadDatabase();
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): AppDatabaseSchema {
    this.ensureDataDir();
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        // Merge with defaults to guarantee all schema properties are present
        return {
          ...INITIAL_DATABASE,
          ...parsed,
          metadata: {
            ...INITIAL_DATABASE.metadata,
            ...(parsed.metadata || {}),
            lastLoadedAt: new Date().toISOString()
          }
        };
      }
    } catch (err) {
      console.error('[DB] Failed to load existing database. Restoring from backup/defaults:', err);
      if (fs.existsSync(BACKUP_PATH)) {
        try {
          const backupRaw = fs.readFileSync(BACKUP_PATH, 'utf-8');
          return JSON.parse(backupRaw);
        } catch (backupErr) {
          console.error('[DB] Backup restoration failed:', backupErr);
        }
      }
    }

    // Fresh initialization
    const fresh = JSON.parse(JSON.stringify(INITIAL_DATABASE));
    this.saveSync(fresh);
    return fresh;
  }

  private saveSync(data: AppDatabaseSchema): void {
    this.ensureDataDir();
    try {
      const json = JSON.stringify(data, null, 2);
      const tempPath = `${DB_PATH}.tmp`;
      fs.writeFileSync(tempPath, json, 'utf-8');
      fs.renameSync(tempPath, DB_PATH);
      // Periodic backup
      fs.copyFileSync(DB_PATH, BACKUP_PATH);
    } catch (err) {
      console.error('[DB] Error writing database to disk:', err);
    }
  }

  public scheduleSave(): void {
    this.data.metadata.lastSavedAt = new Date().toISOString();
    if (this.saveTimeout) return;
    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = null;
      this.saveSync(this.data);
    }, 400); // 400ms debounce
  }

  public getRaw(): AppDatabaseSchema {
    return this.data;
  }

  public logAudit(action: string, performedBy: string, details: string, targetId?: string): void {
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      action,
      performedBy,
      targetId,
      details,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs.length = 500; // Cap log history
    }
    this.scheduleSave();
  }

  // Generic collection helpers
  public getCollection<K extends keyof AppDatabaseSchema>(key: K): AppDatabaseSchema[K] {
    return this.data[key];
  }
}

export const db = new DatabaseEngine();
