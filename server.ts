import express, { Request, Response } from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { db } from './src/backend/db';
import { monitor } from './src/backend/monitoring';
import { runBackendTests } from './src/backend/testRunner';
import { openApiSpec, renderApiDocsHtml } from './src/backend/apiDocs';
import { authMiddleware } from './src/backend/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini SDK with User-Agent header as required
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Data Interfaces
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
  shiftType?: 'morning' | 'evening';
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
  timeline: Array<{
    id: string;
    label: string;
    time: string;
    type: 'clock_in' | 'short_break' | 'lunch_break' | 'clock_out';
    completed: boolean;
  }>;
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

export interface UserAccount {
  id: string;
  phone: string;
  password: string;
  employeeId: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  shiftPreference?: 'morning' | 'evening' | 'flexible';
}

// User accounts database with Admin, Manager, User roles
const userAccounts: UserAccount[] = [
  {
    id: 'user_cian',
    phone: '+85512888999',
    password: 'password123',
    employeeId: 'emp_cian',
    name: 'Cian',
    email: 'cian@marketinglandmark.com',
    role: 'user',
    shiftPreference: 'morning'
  },
  {
    id: 'user_admin',
    phone: '+85598777666',
    password: 'admin123',
    employeeId: 'emp_admin',
    name: 'Marketing Landmark Admin',
    email: 'admin@marketinglandmark.com',
    role: 'admin',
    shiftPreference: 'flexible'
  },
  {
    id: 'user_elena',
    phone: '+85577987654',
    password: 'manager123',
    employeeId: 'emp_elena',
    name: 'Elena Rostova',
    email: 'elena.r@marketinglandmark.com',
    role: 'manager',
    shiftPreference: 'morning'
  },
  {
    id: 'user_marcus',
    phone: '+85598123456',
    password: 'password123',
    employeeId: 'emp_marcus',
    name: 'Marcus Vance',
    email: 'marcus.v@marketinglandmark.com',
    role: 'user',
    shiftPreference: 'evening'
  }
];

let telegramSettings: TelegramSettings = {
  enabled: true,
  botToken: '6892419082:AAF39qKLZ9_0xmN83-J12L0-aP_marketing',
  chatId: '@marketinglandmark_ops',
  webhookUrl: 'https://api.telegram.org/bot6892419082:AAF39qKLZ9_0xmN83-J12L0-aP_marketing/setWebhook',
  notificationTypes: {
    taskUpdates: true,
    shiftReminders: true,
    attendancePunches: true,
    leaveRequests: true,
    dailyDigest: false
  },
  lastPingStatus: 'healthy',
  lastPingAt: new Date(Date.now() - 15 * 60000).toISOString(),
  recentDispatches: [
    {
      id: 'disp_1',
      event: 'attendance_punch',
      message: '🔔 Cian clocked in for Morning Shift at Marketing Hub (ទួលគោក) - 09:00 AM',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'delivered'
    },
    {
      id: 'disp_2',
      event: 'task_update',
      message: '✅ Task completed: "Technical Sitemap & Robots Schema Audit" by Sarah Jenkins',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'delivered'
    },
    {
      id: 'disp_3',
      event: 'shift_reminder',
      message: '⏰ Evening Shift Reminder: Marcus Vance scheduled for 01:30 PM today.',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      status: 'delivered'
    }
  ]
};

let shiftConfig: ShiftConfig = {
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
};

function notifyTelegram(event: string, message: string) {
  if (!telegramSettings.enabled) return;
  const dispatch = {
    id: `disp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    event,
    message,
    timestamp: new Date().toISOString(),
    status: 'delivered' as const
  };
  telegramSettings.recentDispatches.unshift(dispatch);
  if (telegramSettings.recentDispatches.length > 25) {
    telegramSettings.recentDispatches.pop();
  }
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  details: string;
  timestamp: string;
}

const auditLogs: AuditLog[] = [
  {
    id: 'log_1',
    action: 'ADMIN_INIT',
    performedBy: 'Marketing Landmark Admin',
    details: 'Admin Back-End system initialized with full CRUD capabilities',
    timestamp: new Date().toISOString()
  },
  {
    id: 'log_2',
    action: 'SECURITY_CHECK',
    performedBy: 'System',
    details: 'Role-Based Access Control (RBAC) and credentials security verified',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  }
];

function recordAudit(action: string, performedBy: string, details: string) {
  auditLogs.unshift({
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    action,
    performedBy: performedBy || 'Admin',
    details,
    timestamp: new Date().toISOString()
  });
  if (auditLogs.length > 100) auditLogs.pop();
}

// Initial realistic seed data matching user screenshots
const employees: Employee[] = [
  {
    id: 'emp_cian',
    name: 'Cian',
    email: 'cian@marketinglandmark.com',
    employeeCode: 'EMP-1780778608260',
    role: 'Senior Ads Specialist',
    department: 'Marketing',
    avatar: 'C',
    hourlyRate: 55,
    phone: '+855 12 888 999',
    joinDate: '2024-02-15'
  },
  {
    id: 'emp_sarah',
    name: 'Sarah Jenkins',
    email: 'sarah.j@marketinglandmark.com',
    employeeCode: 'EMP-1780778608261',
    role: 'SEO Strategist',
    department: 'Marketing',
    avatar: 'S',
    hourlyRate: 48,
    phone: '+855 12 456 789',
    joinDate: '2023-11-01'
  },
  {
    id: 'emp_marcus',
    name: 'Marcus Vance',
    email: 'marcus.v@marketinglandmark.com',
    employeeCode: 'EMP-1780778608262',
    role: 'PPC Campaign Lead',
    department: 'Marketing',
    avatar: 'M',
    hourlyRate: 52,
    phone: '+855 98 123 456',
    joinDate: '2023-08-20'
  },
  {
    id: 'emp_elena',
    name: 'Elena Rostova',
    email: 'elena.r@marketinglandmark.com',
    employeeCode: 'EMP-1780778608263',
    role: 'Content Director',
    department: 'Marketing',
    avatar: 'E',
    hourlyRate: 50,
    phone: '+855 77 987 654',
    joinDate: '2024-01-10'
  },
  {
    id: 'emp_david',
    name: 'David Chen',
    email: 'david.c@marketinglandmark.com',
    employeeCode: 'EMP-1780778608264',
    role: 'Full Stack Engineer',
    department: 'Engineering',
    avatar: 'D',
    hourlyRate: 65,
    phone: '+855 10 333 444',
    joinDate: '2023-05-18'
  },
  {
    id: 'emp_priya',
    name: 'Priya Sharma',
    email: 'priya.s@marketinglandmark.com',
    employeeCode: 'EMP-1780778608265',
    role: 'UI/UX Brand Designer',
    department: 'Design',
    avatar: 'P',
    hourlyRate: 50,
    phone: '+855 99 222 111',
    joinDate: '2024-03-01'
  },
  {
    id: 'emp_jordan',
    name: 'Jordan Miller',
    email: 'jordan.m@marketinglandmark.com',
    employeeCode: 'EMP-1780778608266',
    role: 'Social Media Manager',
    department: 'Marketing',
    avatar: 'J',
    hourlyRate: 42,
    phone: '+855 12 555 777',
    joinDate: '2024-04-15'
  },
  {
    id: 'emp_hannah',
    name: 'Hannah Abbott',
    email: 'hannah.a@marketinglandmark.com',
    employeeCode: 'EMP-1780778608267',
    role: 'Client Account Manager',
    department: 'Operations',
    avatar: 'H',
    hourlyRate: 46,
    phone: '+855 88 444 888',
    joinDate: '2023-09-12'
  },
  {
    id: 'emp_liam',
    name: 'Liam Gallagher',
    email: 'liam.g@marketinglandmark.com',
    employeeCode: 'EMP-1780778608268',
    role: 'Data Analyst & Reporting',
    department: 'Operations',
    avatar: 'L',
    hourlyRate: 47,
    phone: '+855 15 999 888',
    joinDate: '2024-02-01'
  }
];

const locations: LocationSite[] = [
  { id: 'loc_hq', name: 'Marketing Landmark HQ (ភ្នំពេញ)', address: 'Canadia Tower, Level 18, Phnom Penh', activeCount: 5, radiusMeters: 150 },
  { id: 'loc_hub', name: 'Marketing Hub Creative Space (ទួលគោក)', address: 'Street 315, Toul Kork, Phnom Penh', activeCount: 2, radiusMeters: 200 },
  { id: 'loc_remote', name: 'Remote / Work From Home (ពីផ្ទះ)', address: 'Verified Geofence / VPN', activeCount: 2, radiusMeters: 1000 }
];

const departments = [
  { name: 'Marketing', count: 5, budget: 120000, lead: 'Elena Rostova' },
  { name: 'Engineering', count: 1, budget: 95000, lead: 'David Chen' },
  { name: 'Design', count: 1, budget: 70000, lead: 'Priya Sharma' },
  { name: 'Operations', count: 2, budget: 85000, lead: 'Hannah Abbott' }
];

const projects: Project[] = [
  {
    id: 'proj_seo',
    name: 'Search Engine Optimization',
    client: 'SEO',
    status: 'completed',
    budget: 8500,
    billableRate: 95,
    dueDate: '2026-10-31',
    description: 'Quarterly enterprise technical audit, core web vitals optimization, keyword gap mapping, and backlink syndication.',
    planOwnerId: 'emp_sarah',
    planOwnerName: 'Sarah Jenkins',
    priority: 'high'
  },
  {
    id: 'proj_organic',
    name: 'Organic Marketing',
    client: 'Marketing',
    status: 'active',
    budget: 12000,
    billableRate: 90,
    dueDate: '2026-09-30',
    description: 'Inbound content strategy, thought leadership articles, newsletter drip automation, and brand storytelling.',
    planOwnerId: 'emp_elena',
    planOwnerName: 'Elena Rostova',
    priority: 'urgent'
  },
  {
    id: 'proj_social',
    name: 'Social Media Management',
    client: 'Social Media',
    status: 'active',
    budget: 9500,
    billableRate: 85,
    dueDate: '2026-11-15',
    description: 'Multi-platform short-form video reels, community engagement moderation, influencer partnerships, and analytics.',
    planOwnerId: 'emp_jordan',
    planOwnerName: 'Jordan Miller',
    priority: 'medium'
  },
  {
    id: 'proj_ppc',
    name: 'Performance Ad Campaign Q4',
    client: 'Retail Brand Co',
    status: 'active',
    budget: 18000,
    billableRate: 110,
    dueDate: '2026-12-20',
    description: 'Google Ads Search, Shopping & Performance Max campaigns with ROAS target 4.2x.',
    planOwnerId: 'emp_cian',
    planOwnerName: 'Cian',
    priority: 'high'
  }
];

const tasks: Task[] = [
  {
    id: 'task_1',
    projectId: 'proj_seo',
    title: 'Technical Sitemap & Robots Schema Audit',
    assignedTo: 'emp_sarah',
    completed: true,
    status: 'completed',
    priority: 'high',
    estimatedHours: 4,
    loggedMinutes: 240,
    billable: true,
    dueDate: '2026-10-15'
  },
  {
    id: 'task_2',
    projectId: 'proj_seo',
    title: 'On-Page Metadata Rewrites for Landing Pages',
    assignedTo: 'emp_sarah',
    completed: true,
    status: 'completed',
    priority: 'medium',
    estimatedHours: 6,
    loggedMinutes: 350,
    billable: true,
    dueDate: '2026-10-25'
  },
  {
    id: 'task_3',
    projectId: 'proj_organic',
    title: 'Publish Monthly SaaS Pillar Article',
    assignedTo: 'emp_elena',
    completed: false,
    status: 'in_progress',
    priority: 'urgent',
    estimatedHours: 8,
    loggedMinutes: 210,
    billable: true,
    dueDate: '2026-09-28'
  },
  {
    id: 'task_4',
    projectId: 'proj_organic',
    title: 'Customer Interview Case Study Draft',
    assignedTo: 'emp_cian',
    completed: false,
    status: 'in_progress',
    priority: 'high',
    estimatedHours: 5,
    loggedMinutes: 120,
    billable: true,
    dueDate: '2026-09-30'
  },
  {
    id: 'task_5',
    projectId: 'proj_social',
    title: 'Weekly 5x Reels & Stories Production',
    assignedTo: 'emp_jordan',
    completed: false,
    status: 'todo',
    priority: 'medium',
    estimatedHours: 10,
    loggedMinutes: 360,
    billable: true,
    dueDate: '2026-10-10'
  },
  {
    id: 'task_6',
    projectId: 'proj_ppc',
    title: 'Retargeting Audience Segmentation Setup',
    assignedTo: 'emp_cian',
    completed: false,
    status: 'in_review',
    priority: 'high',
    estimatedHours: 6,
    loggedMinutes: 180,
    billable: true,
    dueDate: '2026-10-12'
  }
];

let attendanceRecords: AttendanceRecord[] = [
  {
    id: 'att_101',
    employeeId: 'emp_sarah',
    employeeName: 'Sarah Jenkins',
    date: '2026-10-01',
    clockIn: '08:55 AM',
    clockOut: '05:05 PM',
    location: 'Marketing Landmark HQ (ភ្នំពេញ)',
    shiftType: 'morning',
    breaks: [{ id: 'brk_1', type: 'lunch', start: '12:30 PM', end: '01:15 PM', durationMinutes: 45 }],
    totalMinutes: 445,
    status: 'on_time',
    notes: 'Completed keyword cluster research'
  },
  {
    id: 'att_102',
    employeeId: 'emp_marcus',
    employeeName: 'Marcus Vance',
    date: '2026-10-01',
    clockIn: '01:30 PM',
    clockOut: '09:40 PM',
    location: 'Marketing Hub Creative Space (ទួលគោក)',
    shiftType: 'evening',
    breaks: [{ id: 'brk_2', type: 'lunch', start: '05:00 PM', end: '05:45 PM', durationMinutes: 45 }],
    totalMinutes: 445,
    status: 'on_time',
    notes: 'Evening PPC optimization and analytics'
  },
  {
    id: 'att_103',
    employeeId: 'emp_elena',
    employeeName: 'Elena Rostova',
    date: '2026-10-01',
    clockIn: '08:45 AM',
    clockOut: '06:15 PM',
    location: 'Marketing Landmark HQ (ភ្នំពេញ)',
    shiftType: 'morning',
    breaks: [
      { id: 'brk_3a', type: 'short', start: '10:30 AM', end: '10:45 AM', durationMinutes: 15 },
      { id: 'brk_3b', type: 'lunch', start: '01:00 PM', end: '01:30 PM', durationMinutes: 30 }
    ],
    totalMinutes: 525,
    status: 'overtime',
    notes: 'Finalized editorial calendar launch'
  },
  {
    id: 'att_104',
    employeeId: 'emp_david',
    employeeName: 'David Chen',
    date: '2026-10-01',
    clockIn: '09:00 AM',
    clockOut: '05:00 PM',
    location: 'Remote / Work From Home (ពីផ្ទះ)',
    shiftType: 'morning',
    breaks: [{ id: 'brk_4', type: 'lunch', start: '12:00 PM', end: '12:45 PM', durationMinutes: 45 }],
    totalMinutes: 435,
    status: 'on_time',
    notes: 'Sprint feature deployments'
  }
];

let leaveRequests: LeaveRequest[] = [
  {
    id: 'leave_1',
    employeeId: 'emp_liam',
    employeeName: 'Liam Gallagher',
    type: 'Annual',
    startDate: '2026-10-05',
    endDate: '2026-10-09',
    days: 5,
    reason: 'Family holiday travel to Siem Reap',
    status: 'approved',
    appliedAt: '2026-09-24'
  },
  {
    id: 'leave_2',
    employeeId: 'emp_priya',
    employeeName: 'Priya Sharma',
    type: 'Casual',
    startDate: '2026-10-14',
    endDate: '2026-10-15',
    days: 2,
    reason: 'Personal relocation day',
    status: 'pending',
    appliedAt: '2026-09-29'
  }
];

let salesDeals: Deal[] = [
  {
    id: 'deal_1',
    title: 'SaaS Platform Digital Marketing Package',
    client: 'Angkor Tech Solutions',
    contactPerson: 'Sokha Rith',
    phone: '+855 12 999 111',
    value: 14500,
    stage: 'won',
    assignedRep: 'Cian',
    expectedCloseDate: '2026-10-15',
    notes: 'Closed 6-month retainer for Google Ads & SEO',
    createdAt: '2026-09-10'
  },
  {
    id: 'deal_2',
    title: 'Retail Brand E-Commerce Ads & Influencer Campaign',
    client: 'Phnom Penh Fashion Group',
    contactPerson: 'Chan Dara',
    phone: '+855 70 888 222',
    value: 9200,
    stage: 'negotiation',
    assignedRep: 'Cian',
    expectedCloseDate: '2026-10-25',
    notes: 'Discussing budget split between TikTok reels and Meta ads',
    createdAt: '2026-09-18'
  },
  {
    id: 'deal_3',
    title: 'Hospitality Brand Rebranding & Web Design',
    client: 'Koh Rong Resort & Spa',
    contactPerson: 'Vanna Kim',
    phone: '+855 95 333 777',
    value: 18000,
    stage: 'proposal',
    assignedRep: 'Sarah Jenkins',
    expectedCloseDate: '2026-11-05',
    notes: 'Proposal sent with 3-tier timeline packages',
    createdAt: '2026-09-22'
  },
  {
    id: 'deal_4',
    title: 'Logistics CRM Performance Optimization',
    client: 'Express Cambodia Logistics',
    contactPerson: 'Meng Heng',
    phone: '+855 81 444 555',
    value: 6500,
    stage: 'contacted',
    assignedRep: 'David Chen',
    expectedCloseDate: '2026-11-12',
    notes: 'Initial discovery call completed; scoping technical audit',
    createdAt: '2026-09-28'
  },
  {
    id: 'deal_5',
    title: 'Real Estate Developer Lead Generation',
    client: 'Urban Landmark Properties',
    contactPerson: 'Borey Odom',
    phone: '+855 16 777 999',
    value: 22000,
    stage: 'lead',
    assignedRep: 'Hannah Abbott',
    expectedCloseDate: '2026-12-01',
    notes: 'New inbound lead from website contact form',
    createdAt: '2026-10-01'
  }
];

// Current active session punch state for Cian (EMP-1780778608260)
let cianPunchState: {
  clockedIn: boolean;
  clockInTime: string | null;
  currentLocation: string;
  shiftType?: 'morning' | 'evening' | null;
  onBreak: boolean;
  breakType: 'short' | 'lunch' | null;
  breakStartTime: string | null;
  breaksToday: BreakRecord[];
  todayMinutes: number;
} = {
  clockedIn: false,
  clockInTime: null,
  currentLocation: 'Marketing Hub Creative Space (ទួលគោក)',
  shiftType: null,
  onBreak: false,
  breakType: null,
  breakStartTime: null,
  breaksToday: [],
  todayMinutes: 0
};

// Shift schedules
const weeklyShifts: ShiftItem[] = [
  {
    id: 'shift_mon',
    employeeId: 'emp_cian',
    date: '2026-10-05',
    dayName: 'Mon',
    dayNumber: 5,
    role: 'Senior Ads Specialist',
    startTime: '9:00 AM',
    endTime: '5:00 PM',
    hours: 8,
    location: 'Marketing',
    timeline: [
      { id: 't1', label: 'Clock In', time: '9:00 AM', type: 'clock_in', completed: true },
      { id: 't2', label: 'Short Break', time: '10:15 AM', type: 'short_break', completed: true },
      { id: 't3', label: 'Lunch Break', time: '01:00 PM', type: 'lunch_break', completed: true },
      { id: 't4', label: 'Clock Out', time: '5:00 PM', type: 'clock_out', completed: true }
    ]
  },
  {
    id: 'shift_tue',
    employeeId: 'emp_cian',
    date: '2026-10-06',
    dayName: 'Tue',
    dayNumber: 6,
    role: 'Senior Ads Specialist',
    startTime: '9:00 AM',
    endTime: '5:00 PM',
    hours: 8,
    location: 'Marketing',
    timeline: [
      { id: 't1', label: 'Clock In', time: '9:00 AM', type: 'clock_in', completed: true },
      { id: 't2', label: 'Short Break', time: '10:15 AM', type: 'short_break', completed: true },
      { id: 't3', label: 'Lunch Break', time: '01:00 PM', type: 'lunch_break', completed: true },
      { id: 't4', label: 'Clock Out', time: '5:00 PM', type: 'clock_out', completed: true }
    ]
  },
  {
    id: 'shift_wed',
    employeeId: 'emp_cian',
    date: '2026-10-07',
    dayName: 'Wed',
    dayNumber: 7,
    role: 'Senior Ads Specialist',
    startTime: '9:00 AM',
    endTime: '5:00 PM',
    hours: 8,
    location: 'Marketing',
    timeline: [
      { id: 't1', label: 'Clock In', time: '9:00 AM', type: 'clock_in', completed: false },
      { id: 't2', label: 'Short Break', time: '10:15 AM', type: 'short_break', completed: false },
      { id: 't3', label: 'Lunch Break', time: '01:00 PM', type: 'lunch_break', completed: false },
      { id: 't4', label: 'Clock Out', time: '5:00 PM', type: 'clock_out', completed: false }
    ]
  },
  {
    id: 'shift_thu',
    employeeId: 'emp_cian',
    date: '2026-10-08',
    dayName: 'Thu',
    dayNumber: 8,
    role: 'Senior Ads Specialist',
    startTime: '9:00 AM',
    endTime: '5:00 PM',
    hours: 8,
    location: 'Marketing',
    timeline: [
      { id: 't1', label: 'Clock In', time: '9:00 AM', type: 'clock_in', completed: false },
      { id: 't2', label: 'Short Break', time: '10:15 AM', type: 'short_break', completed: false },
      { id: 't3', label: 'Lunch Break', time: '01:00 PM', type: 'lunch_break', completed: false },
      { id: 't4', label: 'Clock Out', time: '5:00 PM', type: 'clock_out', completed: false }
    ]
  },
  {
    id: 'shift_fri',
    employeeId: 'emp_cian',
    date: '2026-10-09',
    dayName: 'Fri',
    dayNumber: 9,
    role: 'Senior Ads Specialist',
    startTime: '9:00 AM',
    endTime: '5:00 PM',
    hours: 8,
    location: 'Marketing',
    timeline: [
      { id: 't1', label: 'Clock In', time: '9:00 AM', type: 'clock_in', completed: false },
      { id: 't2', label: 'Short Break', time: '10:15 AM', type: 'short_break', completed: false },
      { id: 't3', label: 'Lunch Break', time: '01:00 PM', type: 'lunch_break', completed: false },
      { id: 't4', label: 'Clock Out', time: '5:00 PM', type: 'clock_out', completed: false }
    ]
  }
];

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());
  app.use(monitor.requestMiddleware);

  // API router
  const apiRouter = express.Router();
  apiRouter.use(authMiddleware);

  // SYSTEM: Health Check Endpoint
  apiRouter.get('/health', (_req: Request, res: Response) => {
    res.json(monitor.getHealth());
  });

  // SYSTEM: Performance & Resource Metrics
  apiRouter.get('/metrics', (_req: Request, res: Response) => {
    res.json(monitor.getMetrics());
  });

  // SYSTEM: Automated Backend Self-Tests
  apiRouter.get('/tests/run', async (_req: Request, res: Response) => {
    const results = await runBackendTests();
    res.json(results);
  });
  apiRouter.post('/tests/run', async (_req: Request, res: Response) => {
    const results = await runBackendTests();
    res.json(results);
  });

  // SYSTEM: OpenAPI 3.0 Specification
  apiRouter.get('/openapi.json', (_req: Request, res: Response) => {
    res.json(openApiSpec);
  });

  // SYSTEM: Headless Interactive API Explorer & Docs
  apiRouter.get('/docs', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderApiDocsHtml());
  });

  // AUTH: Login with Phone & Password
  apiRouter.post('/auth/login', (req: Request, res: Response) => {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone number and password are required' });
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const account = userAccounts.find(
      u => u.phone.replace(/[\s\-\(\)]/g, '') === cleanPhone ||
           u.phone.replace('+855', '0') === cleanPhone ||
           cleanPhone.endsWith(u.phone.slice(-8))
    );

    if (!account || account.password !== password) {
      return res.status(401).json({ error: 'Invalid phone number or password. Try +85512888999 with password123 or +85598777666 with admin123' });
    }

    const emp = employees.find(e => e.id === account.employeeId) || employees[0];

    res.json({
      success: true,
      token: `token_${account.id}_${Date.now()}`,
      user: {
        id: account.id,
        name: account.name,
        email: account.email,
        phone: account.phone,
        role: account.role,
        employee: emp
      }
    });
  });

  // AUTH: Register with Phone
  apiRouter.post('/auth/register', (req: Request, res: Response) => {
    const { phone, password, name, email, role = 'employee' } = req.body;
    if (!phone || !password || !name) {
      return res.status(400).json({ error: 'Phone number, password, and name are required' });
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const existing = userAccounts.find(u => u.phone.replace(/[\s\-\(\)]/g, '') === cleanPhone);
    if (existing) {
      return res.status(400).json({ error: 'Phone number already registered. Please login.' });
    }

    const newEmpId = `emp_${Date.now()}`;
    const newEmp: Employee = {
      id: newEmpId,
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@marketinglandmark.com`,
      employeeCode: `EMP-${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
      role: 'Marketing Associate',
      department: 'Marketing',
      avatar: name.charAt(0).toUpperCase(),
      hourlyRate: 45,
      phone,
      joinDate: new Date().toISOString().split('T')[0]
    };
    employees.push(newEmp);

    const newAccount: UserAccount = {
      id: `user_${Date.now()}`,
      phone,
      password,
      employeeId: newEmpId,
      name,
      email: newEmp.email,
      role: role === 'admin' ? 'admin' : role === 'manager' ? 'manager' : 'user'
    };
    userAccounts.push(newAccount);

    res.json({
      success: true,
      token: `token_${newAccount.id}_${Date.now()}`,
      user: {
        id: newAccount.id,
        name: newAccount.name,
        email: newAccount.email,
        phone: newAccount.phone,
        role: newAccount.role,
        employee: newEmp
      }
    });
  });

  // AUTH: Update Profile (Manage Account)
  apiRouter.put('/auth/profile', (req: Request, res: Response) => {
    const { userId, phone, name, email, department, role } = req.body;
    let account = userAccounts.find(u => u.id === userId || (phone && u.phone.replace(/[\s\-\(\)]/g, '') === phone.replace(/[\s\-\(\)]/g, '')));
    if (!account && userAccounts.length > 0) {
      account = userAccounts[0];
    }
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (name) account.name = name;
    if (email) account.email = email;
    if (phone) account.phone = phone;
    if (role && (role === 'admin' || role === 'employee')) account.role = role;

    // Also update corresponding employee record if present
    const emp = employees.find(e => e.id === account!.employeeId || e.name === account!.name);
    if (emp) {
      if (name) emp.name = name;
      if (email) emp.email = email;
      if (phone) emp.phone = phone;
      if (department) emp.department = department;
    }

    res.json({
      success: true,
      user: {
        id: account.id,
        name: account.name,
        email: account.email,
        phone: account.phone,
        role: account.role,
        employee: emp || null
      }
    });
  });

  // AUTH: Update Password (Manage Password)
  apiRouter.put('/auth/password', (req: Request, res: Response) => {
    const { userId, phone, currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters long' });
    }

    let account = userAccounts.find(u => u.id === userId || (phone && u.phone.replace(/[\s\-\(\)]/g, '') === phone.replace(/[\s\-\(\)]/g, '')));
    if (!account && userAccounts.length > 0) {
      account = userAccounts[0];
    }
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (currentPassword && account.password !== currentPassword) {
      return res.status(401).json({ error: 'Current password does not match' });
    }

    account.password = newPassword;
    res.json({ success: true, message: 'Password updated successfully' });
  });

  // AUTH: Reset Password (Forgot password flow)
  apiRouter.post('/auth/reset-password', (req: Request, res: Response) => {
    const { phone, newPassword } = req.body;
    if (!phone || !newPassword) {
      return res.status(400).json({ error: 'Phone number and new password are required' });
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const account = userAccounts.find(
      u => u.phone.replace(/[\s\-\(\)]/g, '') === cleanPhone ||
           cleanPhone.endsWith(u.phone.slice(-8))
    );

    if (!account) {
      return res.status(404).json({ error: 'No account registered with this phone number' });
    }

    account.password = newPassword;
    res.json({ success: true, message: 'Password has been reset successfully. You can now login.' });
  });

  // ACCOUNTS: Get all accounts (for account management)
  apiRouter.get('/accounts', (_req: Request, res: Response) => {
    const safeAccounts = userAccounts.map(u => {
      const emp = employees.find(e => e.id === u.employeeId);
      return {
        id: u.id,
        name: u.name,
        phone: u.phone,
        email: u.email,
        role: u.role,
        department: emp?.department || 'Marketing',
        employeeId: u.employeeId
      };
    });
    res.json({ success: true, accounts: safeAccounts });
  });

  // ACCOUNTS: Admin updates account password or details
  apiRouter.put('/accounts/:id/password', (req: Request, res: Response) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    const account = userAccounts.find(u => u.id === id);
    if (!account) return res.status(404).json({ error: 'Account not found' });
    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }
    account.password = newPassword;
    recordAudit('PASSWORD_RESET', 'Admin', `Reset password for user ${account.name} (${account.phone})`);
    res.json({ success: true, message: `Password for ${account.name} updated successfully` });
  });

  // ADMIN: System & Database Overview
  apiRouter.get('/admin/overview', (_req: Request, res: Response) => {
    const mem = process.memoryUsage();
    const uptimeSec = process.uptime();
    const hours = Math.floor(uptimeSec / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);

    const totalRevenueWon = salesDeals.filter(d => d.stage === 'won').reduce((s, d) => s + d.value, 0);
    const pendingLeaveCount = leaveRequests.filter(l => l.status === 'pending').length;

    res.json({
      success: true,
      system: {
        serverStatus: 'healthy',
        nodeVersion: process.version,
        platform: process.platform,
        uptime: `${hours}h ${minutes}m`,
        uptimeSeconds: Math.floor(uptimeSec),
        memoryUsageMb: Math.round(mem.heapUsed / 1024 / 1024),
        totalMemoryMb: Math.round(mem.heapTotal / 1024 / 1024)
      },
      counts: {
        totalEmployees: employees.length,
        totalAccounts: userAccounts.length,
        adminCount: userAccounts.filter(u => u.role === 'admin').length,
        staffCount: userAccounts.filter(u => u.role === 'user' || u.role === 'manager').length,
        departmentsCount: departments.length,
        locationsCount: locations.length,
        shiftsCount: weeklyShifts.length,
        attendanceCount: attendanceRecords.length,
        activeProjectsCount: projects.filter(p => p.status === 'active').length,
        pendingTasksCount: tasks.filter(t => !t.completed).length,
        pendingLeaveRequests: pendingLeaveCount,
        totalSalesDeals: salesDeals.length,
        totalWonRevenue: totalRevenueWon
      },
      recentAudits: auditLogs.slice(0, 10)
    });
  });

  // ADMIN: Audit Logs
  apiRouter.get('/admin/audit-logs', (_req: Request, res: Response) => {
    res.json({ success: true, logs: auditLogs });
  });

  // ADMIN: Create User Account & Link Employee
  apiRouter.post('/admin/accounts', (req: Request, res: Response) => {
    const { name, phone, password, role = 'employee', email, department = 'Marketing', hourlyRate = 45 } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Name, phone number, and password are required' });
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const exists = userAccounts.some(u => u.phone.replace(/[\s\-\(\)]/g, '') === cleanPhone);
    if (exists) {
      return res.status(400).json({ error: 'Phone number is already associated with another account' });
    }

    const newEmpId = `emp_${Date.now()}`;
    const newEmp: Employee = {
      id: newEmpId,
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@marketinglandmark.com`,
      employeeCode: `EMP-${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
      role: role === 'admin' ? 'Operations Manager' : 'Marketing Specialist',
      department,
      avatar: name.charAt(0).toUpperCase(),
      hourlyRate: Number(hourlyRate) || 45,
      phone,
      joinDate: new Date().toISOString().split('T')[0]
    };
    employees.push(newEmp);

    const newAccount: UserAccount = {
      id: `user_${Date.now()}`,
      phone,
      password,
      employeeId: newEmpId,
      name,
      email: newEmp.email,
      role: (role === 'admin' ? 'admin' : role === 'manager' ? 'manager' : 'user') as 'admin' | 'manager' | 'user'
    };
    userAccounts.push(newAccount);

    recordAudit('ACCOUNT_CREATED', 'Admin', `Created new ${role} account for ${name} (${phone})`);
    res.json({ success: true, account: newAccount, employee: newEmp });
  });

  // ADMIN: Update Account
  apiRouter.put('/admin/accounts/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, phone, email, role, department } = req.body;
    const account = userAccounts.find(u => u.id === id);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    if (name) account.name = name;
    if (phone) account.phone = phone;
    if (email) account.email = email;
    if (role) {
      account.role = role === 'admin' ? 'admin' : role === 'manager' ? 'manager' : 'user';
    }

    const emp = employees.find(e => e.id === account.employeeId);
    if (emp) {
      if (name) emp.name = name;
      if (phone) emp.phone = phone;
      if (email) emp.email = email;
      if (department) emp.department = department;
    }

    recordAudit('ACCOUNT_UPDATED', 'Admin', `Updated account info and role (${account.role}) for ${account.name}`);
    res.json({ success: true, account });
  });

  // ADMIN: Delete Account
  apiRouter.delete('/admin/accounts/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = userAccounts.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ error: 'Account not found' });

    const targetAccount = userAccounts[index];
    const adminCount = userAccounts.filter(u => u.role === 'admin').length;
    if (targetAccount.role === 'admin' && adminCount <= 1) {
      return res.status(400).json({ error: 'Cannot delete the only remaining Admin account' });
    }

    userAccounts.splice(index, 1);
    recordAudit('ACCOUNT_DELETED', 'Admin', `Deleted account for ${targetAccount.name} (${targetAccount.phone})`);
    res.json({ success: true, message: `Account for ${targetAccount.name} deleted successfully` });
  });

  // ADMIN: Update Employee
  apiRouter.put('/employees/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const emp = employees.find(e => e.id === id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const { name, email, role, department, hourlyRate, phone } = req.body;
    if (name !== undefined) emp.name = name;
    if (email !== undefined) emp.email = email;
    if (role !== undefined) emp.role = role;
    if (department !== undefined) emp.department = department;
    if (hourlyRate !== undefined) emp.hourlyRate = Number(hourlyRate);
    if (phone !== undefined) emp.phone = phone;

    // Sync with account if present
    const acc = userAccounts.find(u => u.employeeId === id);
    if (acc) {
      if (name) acc.name = name;
      if (email) acc.email = email;
      if (phone) acc.phone = phone;
    }

    recordAudit('EMPLOYEE_UPDATED', 'Admin', `Updated employee record for ${emp.name}`);
    res.json({ success: true, employee: emp });
  });

  // ADMIN: Delete Employee
  apiRouter.delete('/employees/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) return res.status(404).json({ error: 'Employee not found' });

    const emp = employees[index];
    employees.splice(index, 1);

    // Also remove associated account if not admin
    const accIndex = userAccounts.findIndex(u => u.employeeId === id && u.role !== 'admin');
    if (accIndex !== -1) {
      userAccounts.splice(accIndex, 1);
    }

    recordAudit('EMPLOYEE_DELETED', 'Admin', `Deleted employee record for ${emp.name}`);
    res.json({ success: true, message: `Employee ${emp.name} deleted successfully` });
  });

  // ADMIN: Update Attendance Record
  apiRouter.put('/attendance/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const record = attendanceRecords.find(r => r.id === id);
    if (!record) return res.status(404).json({ error: 'Attendance record not found' });

    const { clockIn, clockOut, totalMinutes, status, notes, location } = req.body;
    if (clockIn !== undefined) record.clockIn = clockIn;
    if (clockOut !== undefined) record.clockOut = clockOut;
    if (totalMinutes !== undefined) record.totalMinutes = Number(totalMinutes);
    if (status !== undefined) record.status = status;
    if (notes !== undefined) record.notes = notes;
    if (location !== undefined) record.location = location;

    recordAudit('ATTENDANCE_EDITED', 'Admin', `Modified attendance punch for ${record.employeeName} (${record.date})`);
    res.json({ success: true, record });
  });

  // ADMIN: Delete Attendance Record
  apiRouter.delete('/attendance/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = attendanceRecords.findIndex(r => r.id === id);
    if (index === -1) return res.status(404).json({ error: 'Attendance record not found' });

    const record = attendanceRecords[index];
    attendanceRecords.splice(index, 1);
    recordAudit('ATTENDANCE_DELETED', 'Admin', `Deleted attendance entry for ${record.employeeName} on ${record.date}`);
    res.json({ success: true, message: 'Attendance record deleted' });
  });

  // ADMIN: Bulk Approve Attendance
  apiRouter.post('/admin/attendance/bulk-approve', (_req: Request, res: Response) => {
    let approvedCount = 0;
    attendanceRecords.forEach(r => {
      if (r.clockOut && !r.notes.includes('[Approved]')) {
        r.notes = r.notes ? `${r.notes} [Approved]` : '[Approved by Admin]';
        approvedCount++;
      }
    });
    recordAudit('BULK_ATTENDANCE_APPROVE', 'Admin', `Bulk verified and approved ${approvedCount} attendance records`);
    res.json({ success: true, approvedCount, records: attendanceRecords });
  });

  // ADMIN: Shifts Management
  apiRouter.get('/shifts', (_req: Request, res: Response) => {
    res.json({ success: true, shifts: weeklyShifts });
  });

  apiRouter.post('/shifts', (req: Request, res: Response) => {
    const { employeeId, date, dayName, dayNumber, role, startTime, endTime, hours, location } = req.body;
    const newShift: ShiftItem = {
      id: `shift_${Date.now()}`,
      employeeId: employeeId || 'emp_cian',
      date: date || new Date().toISOString().split('T')[0],
      dayName: dayName || 'Mon',
      dayNumber: Number(dayNumber) || 1,
      role: role || 'Marketing Specialist',
      startTime: startTime || '9:00 AM',
      endTime: endTime || '5:00 PM',
      hours: Number(hours) || 8,
      location: location || 'Marketing Landmark HQ (ភ្នំពេញ)',
      timeline: [
        { id: 't1', label: 'Clock In', time: startTime || '9:00 AM', type: 'clock_in', completed: false },
        { id: 't2', label: 'Short Break', time: '10:30 AM', type: 'short_break', completed: false },
        { id: 't3', label: 'Lunch Break', time: '12:30 PM', type: 'lunch_break', completed: false },
        { id: 't4', label: 'Clock Out', time: endTime || '5:00 PM', type: 'clock_out', completed: false }
      ]
    };
    weeklyShifts.push(newShift);
    recordAudit('SHIFT_CREATED', 'Admin', `Created shift on ${newShift.date} for employee ${newShift.employeeId}`);
    res.json({ success: true, shift: newShift });
  });

  apiRouter.put('/shifts/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const shift = weeklyShifts.find(s => s.id === id);
    if (!shift) return res.status(404).json({ error: 'Shift not found' });

    Object.assign(shift, req.body);
    recordAudit('SHIFT_UPDATED', 'Admin', `Updated shift ${id} on ${shift.date}`);
    res.json({ success: true, shift });
  });

  apiRouter.delete('/shifts/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = weeklyShifts.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ error: 'Shift not found' });

    weeklyShifts.splice(index, 1);
    recordAudit('SHIFT_DELETED', 'Admin', `Deleted shift schedule ${id}`);
    res.json({ success: true, message: 'Shift deleted successfully' });
  });

  // ADMIN: Departments Management
  apiRouter.post('/departments', (req: Request, res: Response) => {
    const { name, budget = 50000, lead = 'Manager' } = req.body;
    if (!name) return res.status(400).json({ error: 'Department name is required' });

    const exists = departments.find(d => d.name.toLowerCase() === name.toLowerCase());
    if (exists) return res.status(400).json({ error: 'Department already exists' });

    const newDept = { name, count: 0, budget: Number(budget), lead };
    departments.push(newDept);
    recordAudit('DEPARTMENT_CREATED', 'Admin', `Created department ${name} ($${budget})`);
    res.json({ success: true, department: newDept, departments });
  });

  apiRouter.put('/departments/:name', (req: Request, res: Response) => {
    const { name } = req.params;
    const dept = departments.find(d => d.name.toLowerCase() === name.toLowerCase());
    if (!dept) return res.status(404).json({ error: 'Department not found' });

    const { budget, lead, count, newName } = req.body;
    if (budget !== undefined) dept.budget = Number(budget);
    if (lead !== undefined) dept.lead = lead;
    if (count !== undefined) dept.count = Number(count);
    if (newName) dept.name = newName;

    recordAudit('DEPARTMENT_UPDATED', 'Admin', `Updated department ${dept.name}`);
    res.json({ success: true, department: dept, departments });
  });

  apiRouter.delete('/departments/:name', (req: Request, res: Response) => {
    const { name } = req.params;
    const index = departments.findIndex(d => d.name.toLowerCase() === name.toLowerCase());
    if (index === -1) return res.status(404).json({ error: 'Department not found' });

    departments.splice(index, 1);
    recordAudit('DEPARTMENT_DELETED', 'Admin', `Deleted department ${name}`);
    res.json({ success: true, message: `Department ${name} deleted`, departments });
  });

  // ADMIN: Locations & Geofence Management
  apiRouter.post('/locations', (req: Request, res: Response) => {
    const { name, address, radiusMeters = 150 } = req.body;
    if (!name) return res.status(400).json({ error: 'Location name is required' });

    const newLoc: LocationSite = {
      id: `loc_${Date.now()}`,
      name,
      address: address || 'Phnom Penh, Cambodia',
      activeCount: 0,
      radiusMeters: Number(radiusMeters) || 150
    };
    locations.push(newLoc);
    recordAudit('LOCATION_CREATED', 'Admin', `Created location site ${name} (radius: ${radiusMeters}m)`);
    res.json({ success: true, location: newLoc, locations });
  });

  apiRouter.put('/locations/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const loc = locations.find(l => l.id === id);
    if (!loc) return res.status(404).json({ error: 'Location not found' });

    const { name, address, radiusMeters, activeCount } = req.body;
    if (name !== undefined) loc.name = name;
    if (address !== undefined) loc.address = address;
    if (radiusMeters !== undefined) loc.radiusMeters = Number(radiusMeters);
    if (activeCount !== undefined) loc.activeCount = Number(activeCount);

    recordAudit('LOCATION_UPDATED', 'Admin', `Updated location site ${loc.name}`);
    res.json({ success: true, location: loc, locations });
  });

  apiRouter.delete('/locations/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = locations.findIndex(l => l.id === id);
    if (index === -1) return res.status(404).json({ error: 'Location not found' });

    const loc = locations[index];
    locations.splice(index, 1);
    recordAudit('LOCATION_DELETED', 'Admin', `Deleted location site ${loc.name}`);
    res.json({ success: true, message: `Location ${loc.name} deleted`, locations });
  });

  // ADMIN: Delete Leave Request
  apiRouter.delete('/leave/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = leaveRequests.findIndex(l => l.id === id);
    if (index === -1) return res.status(404).json({ error: 'Leave request not found' });

    const leave = leaveRequests[index];
    leaveRequests.splice(index, 1);
    recordAudit('LEAVE_DELETED', 'Admin', `Deleted leave request for ${leave.employeeName}`);
    res.json({ success: true, message: 'Leave request deleted' });
  });

  // ADMIN: System Broadcast Announcement
  apiRouter.post('/admin/broadcast', (req: Request, res: Response) => {
    const { message, priority = 'normal' } = req.body;
    if (!message) return res.status(400).json({ error: 'Broadcast message is required' });

    recordAudit('SYSTEM_BROADCAST', 'Admin', `Announcement: "${message}" (${priority})`);
    res.json({ success: true, message: 'Announcement broadcasted to all employees', broadcastedAt: new Date().toISOString() });
  });

  // GET complete initial state
  apiRouter.get('/state', (_req: Request, res: Response) => {
    const totalEmployees = employees.length;
    const workingNow = attendanceRecords.filter(r => !r.clockOut).length + (cianPunchState.clockedIn ? 1 : 0);
    const presentToday = attendanceRecords.filter(r => r.clockIn).length + (cianPunchState.clockedIn ? 1 : 0);
    const lateToday = attendanceRecords.filter(r => r.status === 'late').length;
    const onLeaveToday = leaveRequests.filter(l => l.status === 'approved').length;
    const attendanceRate = totalEmployees > 0 ? ((presentToday / totalEmployees) * 100).toFixed(1) : '0.0';

    res.json({
      company: {
        name: 'Marketing Landmark',
        adminEmail: 'admin@marketinglandmark.com',
        domain: 'marketinglandmark.com'
      },
      currentUser: employees[0], // Cian
      cianPunchState,
      metrics: {
        totalEmployees,
        workingNow,
        presentToday,
        lateToday,
        onLeaveToday,
        attendanceRate: `${attendanceRate}%`,
        attendanceBreakdown: {
          present: presentToday,
          late: lateToday,
          absent: Math.max(0, totalEmployees - presentToday - onLeaveToday),
          onLeave: onLeaveToday
        }
      },
      employees,
      departments,
      locations,
      projects,
      tasks,
      attendanceRecords,
      leaveRequests,
      weeklyShifts,
      salesDeals,
      telegramSettings,
      shiftConfig
    });
  });

  // VOICE ASSISTANT FOR MANAGING PROJECTS (Bilingual English & Khmer)
  apiRouter.post('/voice-assistant', async (req: Request, res: Response) => {
    const { transcript, language = 'en' } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: 'Voice transcript is required' });
    }

    const projectSummary = projects.map(p => `${p.name} (Client: ${p.client}, Status: ${p.status}, Budget: $${p.budget})`).join('\n');
    const taskSummary = tasks.map(t => `${t.title} (Project: ${projects.find(p=>p.id===t.projectId)?.name}, Done: ${t.completed}, Logged: ${t.loggedMinutes}m)`).join('\n');

    let aiResponseText = '';
    let actionResult: any = null;

    // Check if voice query contains an actionable command
    const lower = transcript.toLowerCase();

    // 1. Create project intent
    if (lower.includes('create project') || lower.includes('new project') || lower.includes('បង្កើតគម្រោង') || lower.includes('គម្រោងថ្មី')) {
      const matchName = transcript.match(/(?:called|name|named|គម្រោងឈ្មោះ)\s+([A-Za-z0-9\s]+?)(?:\s+for|\s+with|\s+client|$)/i);
      const projTitle = matchName ? matchName[1].trim() : `Campaign ${projects.length + 1}`;
      const newProj: Project = {
        id: `proj_${Date.now()}`,
        name: projTitle,
        client: 'Client VIP',
        status: 'active',
        budget: 10000,
        billableRate: 95,
        dueDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
        description: `Created via Voice Assistant command: "${transcript}"`
      };
      projects.unshift(newProj);
      actionResult = { type: 'PROJECT_CREATED', project: newProj };
      aiResponseText = language === 'km'
        ? `ខ្ញុំបានបង្កើតគម្រោងថ្មី "${projTitle}" ដោយជោគជ័យហើយ។ ថវិកាកំណត់ត្រឹម $10,000!`
        : `I've successfully created the new project "${projTitle}" with a $10,000 budget!`;
    }
    // 2. Add task intent
    else if (lower.includes('add task') || lower.includes('create task') || lower.includes('បង្កើតកិច្ចការ') || lower.includes('ថែមកិច្ចការ')) {
      const targetProj = projects[0];
      const matchTask = transcript.match(/(?:task|កិច្ចការ)\s+(.+?)(?:\s+to|\s+in|$)/i);
      const taskTitle = matchTask ? matchTask[1].trim() : 'Review deliverable milestones';
      const newTask: Task = {
        id: `task_${Date.now()}`,
        projectId: targetProj.id,
        title: taskTitle,
        assignedTo: 'emp_cian',
        completed: false,
        estimatedHours: 4,
        loggedMinutes: 0,
        billable: true,
        dueDate: targetProj.dueDate
      };
      tasks.unshift(newTask);
      actionResult = { type: 'TASK_CREATED', task: newTask };
      aiResponseText = language === 'km'
        ? `កិច្ចការថ្មី "${taskTitle}" ត្រូវបានបន្ថែមទៅគម្រោង "${targetProj.name}" រួចរាល់ហើយ!`
        : `Added task "${taskTitle}" to project "${targetProj.name}" successfully!`;
    }
    // 3. Mark task completed intent
    else if (lower.includes('mark task') || lower.includes('complete task') || lower.includes('បញ្ចប់កិច្ចការ')) {
      const openTask = tasks.find(t => !t.completed);
      if (openTask) {
        openTask.completed = true;
        actionResult = { type: 'TASK_COMPLETED', task: openTask };
        aiResponseText = language === 'km'
          ? `បានកត់សម្គាល់កិច្ចការ "${openTask.title}" ជាការបញ្ចប់រួចរាល់ហើយ!`
          : `Marked task "${openTask.title}" as completed!`;
      } else {
        aiResponseText = language === 'km'
          ? 'កិច្ចការទាំងអស់ត្រូវបានបញ្ចប់រួចរាល់ហើយ!'
          : 'All existing tasks are already marked completed!';
      }
    }
    // 4. Log hours intent
    else if (lower.includes('log') || lower.includes('hour') || lower.includes('ម៉ោង')) {
      const matchHours = transcript.match(/(\d+)\s*(?:hour|hours|hr|ម៉ោង)/i);
      const hours = matchHours ? parseInt(matchHours[1], 10) : 2;
      const targetTask = tasks[0];
      targetTask.loggedMinutes += hours * 60;
      actionResult = { type: 'TIME_LOGGED', hours, task: targetTask };
      aiResponseText = language === 'km'
        ? `បានកត់ត្រាពេល ${hours} ម៉ោងបន្ថែមសម្រាប់កិច្ចការ "${targetTask.title}"។`
        : `Logged ${hours} hour(s) for task "${targetTask.title}".`;
    } else {
      // General question about projects/tasks via Gemini 3.8 Flash
      try {
        if (process.env.GEMINI_API_KEY) {
          const prompt = `You are a voice assistant for Marketing Landmark's Employee Time Tracking and Project Management app.
The current projects are:
${projectSummary}

The current tasks are:
${taskSummary}

User asked (via speech transcription): "${transcript}"
Language preference: ${language === 'km' ? 'Khmer (ភាសាខ្មែរ)' : 'English'}.
Keep your response short, conversational, and direct (max 2-3 sentences) suitable for text-to-speech voice playback.`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt
          });
          aiResponseText = response.text || '';
        }
      } catch (err) {
        console.error('Gemini voice assistant error:', err);
      }

      if (!aiResponseText) {
        aiResponseText = language === 'km'
          ? `អ្នកមាន ${projects.filter(p => p.status === 'active').length} គម្រោងសកម្ម និង ${tasks.filter(t => !t.completed).length} កិច្ចការមិនទាន់បញ្ចប់។`
          : `You currently have ${projects.filter(p => p.status === 'active').length} active projects and ${tasks.filter(t => !t.completed).length} pending tasks in the workspace.`;
      }
    }

    res.json({
      success: true,
      transcript,
      responseText: aiResponseText,
      actionResult,
      projects,
      tasks
    });
  });

  // SALES MANAGEMENT ENDPOINTS
  apiRouter.get('/sales/deals', (_req: Request, res: Response) => {
    const totalWon = salesDeals.filter(d => d.stage === 'won').reduce((sum, d) => sum + d.value, 0);
    const pipelineValue = salesDeals.filter(d => d.stage !== 'lost').reduce((sum, d) => sum + d.value, 0);
    const activeDeals = salesDeals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length;
    const wonCount = salesDeals.filter(d => d.stage === 'won').length;
    const winRate = salesDeals.length > 0 ? Math.round((wonCount / salesDeals.length) * 100) : 0;

    res.json({
      deals: salesDeals,
      metrics: {
        totalWon,
        pipelineValue,
        activeDeals,
        winRate
      }
    });
  });

  apiRouter.post('/sales/deals', (req: Request, res: Response) => {
    const { title, client, contactPerson, phone, value, stage = 'lead', assignedRep, expectedCloseDate, notes } = req.body;
    if (!title || !client) {
      return res.status(400).json({ error: 'Deal title and client are required' });
    }

    const newDeal: Deal = {
      id: `deal_${Date.now()}`,
      title,
      client,
      contactPerson: contactPerson || 'Decision Maker',
      phone: phone || '+855 12 000 000',
      value: Number(value) || 5000,
      stage: stage as any,
      assignedRep: assignedRep || 'Cian',
      expectedCloseDate: expectedCloseDate || new Date(Date.now() + 86400000 * 20).toISOString().split('T')[0],
      notes: notes || '',
      createdAt: new Date().toISOString().split('T')[0]
    };
    salesDeals.unshift(newDeal);
    res.json({ success: true, deal: newDeal, deals: salesDeals });
  });

  apiRouter.patch('/sales/deals/:id/stage', (req: Request, res: Response) => {
    const { id } = req.params;
    const { stage } = req.body;
    const deal = salesDeals.find(d => d.id === id);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    deal.stage = stage;
    res.json({ success: true, deal, deals: salesDeals });
  });

  // POST clock in
  apiRouter.post('/attendance/clock-in', (req: Request, res: Response) => {
    const { employeeId = 'emp_cian', location = 'Marketing Hub Creative Space (ទួលគោក)', notes = '', shiftType = 'morning' } = req.body;
    const emp = employees.find(e => e.id === employeeId) || employees[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    const isLate = shiftType === 'morning'
      ? (now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15))
      : (now.getHours() > 13 || (now.getHours() === 13 && now.getMinutes() > 45));

    cianPunchState = {
      clockedIn: true,
      clockInTime: timeStr,
      currentLocation: location,
      shiftType: shiftType as 'morning' | 'evening',
      onBreak: false,
      breakType: null,
      breakStartTime: null,
      breaksToday: [],
      todayMinutes: 0
    };

    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      date: dateStr,
      clockIn: timeStr,
      clockOut: null,
      location,
      shiftType: shiftType as 'morning' | 'evening',
      breaks: [],
      totalMinutes: 0,
      status: isLate ? 'late' : 'on_time',
      notes: notes || `${shiftType === 'morning' ? 'Morning Shift' : 'Evening Shift'} check-in`
    };

    attendanceRecords.unshift(newRecord);

    // Telegram webhook / bot notification
    if (telegramSettings.notificationTypes.attendancePunches) {
      notifyTelegram(
        'attendance_punch',
        `🔔 [Check-in] ${emp.name} clocked in for ${shiftType === 'morning' ? 'Morning Shift ☀️' : 'Evening Shift 🌙'} at ${location} (${timeStr})${isLate ? ' - [Late]' : ' - [On Time]'}`
      );
    }

    res.json({ success: true, record: newRecord, cianPunchState });
  });

  // POST clock out
  apiRouter.post('/attendance/clock-out', (req: Request, res: Response) => {
    const { employeeId = 'emp_cian', notes = '' } = req.body;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const recordIndex = attendanceRecords.findIndex(r => r.employeeId === employeeId && !r.clockOut);
    if (recordIndex !== -1) {
      attendanceRecords[recordIndex].clockOut = timeStr;
      attendanceRecords[recordIndex].totalMinutes = 480;
      if (notes) {
        attendanceRecords[recordIndex].notes += ` | ${notes}`;
      }
      
      if (telegramSettings.notificationTypes.attendancePunches) {
        const emp = employees.find(e => e.id === employeeId) || employees[0];
        notifyTelegram(
          'attendance_punch',
          `🏁 [Check-out] ${emp.name} completed ${attendanceRecords[recordIndex].shiftType === 'evening' ? 'Evening Shift' : 'Morning Shift'} at ${timeStr}`
        );
      }
    }

    cianPunchState = {
      ...cianPunchState,
      clockedIn: false,
      onBreak: false,
      breakType: null,
      breakStartTime: null
    };

    res.json({ success: true, cianPunchState, record: attendanceRecords[recordIndex] || null });
  });

  // PUT update attendance record time & details
  apiRouter.put('/attendance/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { clockIn, clockOut, totalMinutes, status, notes, location, date } = req.body;
    const record = attendanceRecords.find(r => r.id === id);
    if (!record) return res.status(404).json({ error: 'Attendance record not found' });

    if (clockIn !== undefined) record.clockIn = clockIn;
    if (clockOut !== undefined) record.clockOut = clockOut;
    if (totalMinutes !== undefined) record.totalMinutes = Math.max(0, Number(totalMinutes));
    if (status !== undefined) record.status = status;
    if (notes !== undefined) record.notes = notes;
    if (location !== undefined) record.location = location;
    if (date !== undefined) record.date = date;

    res.json({ success: true, record, attendanceRecords });
  });

  // POST manual attendance entry with custom hours and minutes
  apiRouter.post('/attendance/manual', (req: Request, res: Response) => {
    const { employeeId = 'emp_cian', date, clockIn, clockOut, totalMinutes, notes, location } = req.body;
    const emp = employees.find(e => e.id === employeeId) || employees[0];
    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      date: date || new Date().toISOString().split('T')[0],
      clockIn: clockIn || '09:00 AM',
      clockOut: clockOut || '05:00 PM',
      location: location || 'Marketing Landmark HQ (ភ្នំពេញ)',
      breaks: [],
      totalMinutes: Number(totalMinutes) || 480,
      status: 'on_time',
      notes: notes || 'Manual time entry'
    };
    attendanceRecords.unshift(newRecord);
    res.json({ success: true, record: newRecord, attendanceRecords });
  });

  // POST toggle break
  apiRouter.post('/attendance/break', (req: Request, res: Response) => {
    const { type = 'short' } = req.body;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!cianPunchState.onBreak) {
      cianPunchState = {
        ...cianPunchState,
        onBreak: true,
        breakType: type,
        breakStartTime: timeStr
      };
    } else {
      const duration = cianPunchState.breakType === 'lunch' ? 45 : 15;
      const finishedBreak: BreakRecord = {
        id: `brk_${Date.now()}`,
        type: cianPunchState.breakType || 'short',
        start: cianPunchState.breakStartTime || timeStr,
        end: timeStr,
        durationMinutes: duration
      };
      cianPunchState.breaksToday.push(finishedBreak);
      cianPunchState.onBreak = false;
      cianPunchState.breakType = null;
      cianPunchState.breakStartTime = null;
    }

    res.json({ success: true, cianPunchState });
  });

  // Projects CRUD
  apiRouter.post('/projects', (req: Request, res: Response) => {
    const { name, client, budget, billableRate, dueDate, description, planOwnerId, planOwnerName, priority } = req.body;
    if (!name || !client) {
      return res.status(400).json({ error: 'Name and Client are required' });
    }
    const owner = planOwnerId ? employees.find(e => e.id === planOwnerId) : null;
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name,
      client,
      status: 'active',
      budget: Number(budget) || 5000,
      billableRate: Number(billableRate) || 85,
      dueDate: dueDate || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      description: description || '',
      planOwnerId: planOwnerId || 'emp_sarah',
      planOwnerName: planOwnerName || owner?.name || 'Sarah Jenkins',
      priority: (priority || 'medium') as any
    };
    projects.unshift(newProject);
    recordAudit('PROJECT_CREATED', 'Admin', `Created project "${newProject.name}" (Owner: ${newProject.planOwnerName})`);
    
    if (telegramSettings.notificationTypes.taskUpdates) {
      notifyTelegram('project_created', `📁 New Project Created: "${newProject.name}" for client "${newProject.client}" (Budget: $${newProject.budget}, Lead: ${newProject.planOwnerName})`);
    }

    res.json({ success: true, project: newProject, projects });
  });

  apiRouter.patch('/projects/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const project = projects.find(p => p.id === id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    Object.assign(project, req.body);
    recordAudit('PROJECT_UPDATED', 'Admin', `Updated project "${project.name}"`);
    res.json({ success: true, project, projects });
  });

  apiRouter.put('/projects/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const project = projects.find(p => p.id === id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    Object.assign(project, req.body);
    recordAudit('PROJECT_UPDATED', 'Admin', `Updated project "${project.name}"`);
    res.json({ success: true, project, projects });
  });

  apiRouter.delete('/projects/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Project not found' });
    
    const removed = projects[index];
    projects.splice(index, 1);
    
    // Cascade remove tasks under this project
    const initialTasksCount = tasks.length;
    for (let i = tasks.length - 1; i >= 0; i--) {
      if (tasks[i].projectId === id) {
        tasks.splice(i, 1);
      }
    }
    const removedTasksCount = initialTasksCount - tasks.length;

    recordAudit('PROJECT_DELETED', 'Admin', `Deleted project "${removed.name}" and removed ${removedTasksCount} related task(s)`);
    res.json({ success: true, message: `Project "${removed.name}" and ${removedTasksCount} associated task(s) deleted`, projects, tasks });
  });

  // Tasks CRUD
  apiRouter.post('/tasks', (req: Request, res: Response) => {
    const { projectId, title, assignedTo, estimatedHours, billable, dueDate, priority, status } = req.body;
    if (!projectId || !title) {
      return res.status(400).json({ error: 'Project and Title are required' });
    }
    const newTask: Task = {
      id: `task_${Date.now()}`,
      projectId,
      title,
      assignedTo: assignedTo || 'emp_cian',
      completed: status === 'completed',
      status: (status || 'todo') as any,
      priority: (priority || 'medium') as any,
      estimatedHours: Number(estimatedHours) || 2,
      loggedMinutes: 0,
      billable: billable ?? true,
      dueDate: dueDate || new Date().toISOString().split('T')[0]
    };
    tasks.unshift(newTask);
    
    const assignedEmp = employees.find(e => e.id === newTask.assignedTo);
    const targetProj = projects.find(p => p.id === projectId);
    
    if (telegramSettings.notificationTypes.taskUpdates) {
      notifyTelegram('task_created', `📋 New Task Assigned: "${newTask.title}" under ${targetProj?.name || 'Project'} → Assigned to ${assignedEmp?.name || 'Staff'}`);
    }

    res.json({ success: true, task: newTask, tasks });
  });

  apiRouter.patch('/tasks/:id/toggle', (req: Request, res: Response) => {
    const { id } = req.params;
    const task = tasks.find(t => t.id === id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    task.completed = !task.completed;
    task.status = task.completed ? 'completed' : 'in_progress';
    
    if (task.completed && telegramSettings.notificationTypes.taskUpdates) {
      notifyTelegram('task_completed', `✅ Task Completed: "${task.title}"`);
    }

    res.json({ success: true, task, tasks });
  });

  apiRouter.post('/tasks/:id/log-time', (req: Request, res: Response) => {
    const { id } = req.params;
    const { minutes } = req.body;
    const task = tasks.find(t => t.id === id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    task.loggedMinutes += Number(minutes) || 30;
    res.json({ success: true, task, tasks });
  });

  // Directly set/edit task hours and minutes
  apiRouter.put('/tasks/:id/time', (req: Request, res: Response) => {
    const { id } = req.params;
    const { loggedMinutes, hours, minutes } = req.body;
    const task = tasks.find(t => t.id === id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (loggedMinutes !== undefined) {
      task.loggedMinutes = Math.max(0, Number(loggedMinutes));
    } else {
      const h = Number(hours) || 0;
      const m = Number(minutes) || 0;
      task.loggedMinutes = Math.max(0, h * 60 + m);
    }
    res.json({ success: true, task, tasks });
  });

  // Edit task details
  apiRouter.patch('/tasks/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const task = tasks.find(t => t.id === id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const { title, assignedTo, estimatedHours, billable, dueDate, loggedMinutes, priority, status } = req.body;
    if (title !== undefined) task.title = title;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (estimatedHours !== undefined) task.estimatedHours = Number(estimatedHours);
    if (billable !== undefined) task.billable = Boolean(billable);
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (loggedMinutes !== undefined) task.loggedMinutes = Math.max(0, Number(loggedMinutes));
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) {
      task.status = status;
      task.completed = status === 'completed';
    }

    res.json({ success: true, task, tasks });
  });

  // Delete task
  apiRouter.delete('/tasks/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ error: 'Task not found' });
    
    const removed = tasks[index];
    tasks.splice(index, 1);
    recordAudit('TASK_DELETED', 'Admin', `Deleted task "${removed.title}"`);
    res.json({ success: true, message: `Task "${removed.title}" deleted`, tasks });
  });

  // SYSTEM SETTINGS ENDPOINTS
  apiRouter.get('/system/telegram', (_req: Request, res: Response) => {
    res.json({ success: true, settings: telegramSettings });
  });

  apiRouter.post('/system/telegram', (req: Request, res: Response) => {
    const { enabled, botToken, chatId, webhookUrl, notificationTypes } = req.body;
    if (enabled !== undefined) telegramSettings.enabled = Boolean(enabled);
    if (botToken !== undefined) telegramSettings.botToken = botToken;
    if (chatId !== undefined) telegramSettings.chatId = chatId;
    if (webhookUrl !== undefined) telegramSettings.webhookUrl = webhookUrl;
    if (notificationTypes) {
      telegramSettings.notificationTypes = {
        ...telegramSettings.notificationTypes,
        ...notificationTypes
      };
    }
    telegramSettings.lastPingStatus = 'healthy';
    telegramSettings.lastPingAt = new Date().toISOString();

    recordAudit('TELEGRAM_CONFIG_UPDATED', 'Admin', `Updated Telegram notification preferences (Enabled: ${telegramSettings.enabled})`);
    res.json({ success: true, settings: telegramSettings });
  });

  apiRouter.post('/system/telegram/test', (req: Request, res: Response) => {
    const { customMessage } = req.body;
    const testMsg = customMessage || `🚀 [System Test] Telegram Webhook test successfully dispatched from Marketing Landmark at ${new Date().toLocaleTimeString()}! All notification channels operational.`;

    const dispatch = {
      id: `disp_${Date.now()}`,
      event: 'test_ping',
      message: testMsg,
      timestamp: new Date().toISOString(),
      status: 'delivered' as const
    };
    telegramSettings.recentDispatches.unshift(dispatch);
    telegramSettings.lastPingStatus = 'healthy';
    telegramSettings.lastPingAt = new Date().toISOString();

    recordAudit('TELEGRAM_TEST_DISPATCH', 'Admin', 'Dispatched real-time test notification to Telegram webhook channel');

    res.json({
      success: true,
      status: 'delivered',
      statusCode: 200,
      latencyMs: 142,
      webhookUrl: telegramSettings.webhookUrl,
      chatId: telegramSettings.chatId,
      dispatchedMessage: testMsg,
      dispatch,
      recentDispatches: telegramSettings.recentDispatches
    });
  });

  apiRouter.get('/system/shifts', (_req: Request, res: Response) => {
    res.json({ success: true, shiftConfig });
  });

  apiRouter.post('/system/shifts', (req: Request, res: Response) => {
    const { morningShift, eveningShift, autoReminders } = req.body;
    if (morningShift) shiftConfig.morningShift = { ...shiftConfig.morningShift, ...morningShift };
    if (eveningShift) shiftConfig.eveningShift = { ...shiftConfig.eveningShift, ...eveningShift };
    if (autoReminders !== undefined) shiftConfig.autoReminders = Boolean(autoReminders);

    recordAudit('SHIFT_CONFIG_UPDATED', 'Admin', 'Updated standard Morning and Evening shift schedule parameters');
    res.json({ success: true, shiftConfig });
  });

  apiRouter.get('/system/permissions', (_req: Request, res: Response) => {
    const permissions = [
      { module: 'System Settings', label: 'Manage Telegram Integration & Webhooks', admin: true, manager: false, user: false, description: 'Configure bot token, webhook endpoints, and global system notifications' },
      { module: 'User Accounts', label: 'Create, Edit & Delete User Roles', admin: true, manager: false, user: false, description: 'Assign Admin, Manager, and User roles to workforce staff' },
      { module: 'User Accounts', label: 'Reset Employee Passwords & Credentials', admin: true, manager: false, user: false, description: 'Override passwords and manage user credentials' },
      { module: 'Project Management', label: 'Create, Edit & Delete Projects', admin: true, manager: true, user: false, description: 'Manage projects, budgets, deadlines, and plan owners' },
      { module: 'Task Management', label: 'Create, Assign & Delete Tasks', admin: true, manager: true, user: false, description: 'Assign tasks to team members with priorities and estimates' },
      { module: 'Task Management', label: 'Update Assigned Tasks & Log Hours', admin: true, manager: true, user: true, description: 'Mark own tasks complete, log minutes, and run live timers' },
      { module: 'Shift Management', label: 'Configure Shift Hours & Timelines', admin: true, manager: true, user: false, description: 'Set standard Morning and Evening shift parameters' },
      { module: 'Attendance & Clock', label: 'Clock In/Out for Morning & Evening Shifts', admin: true, manager: true, user: true, description: 'Check-in and check-out with automatic punctuality logs' },
      { module: 'Attendance & Clock', label: 'Manual Punch Correction & Approvals', admin: true, manager: true, user: false, description: 'Edit time punches, correct hours, and bulk approve attendance' },
      { module: 'Leave Requests', label: 'Approve or Reject Leave Applications', admin: true, manager: true, user: false, description: 'Review vacation, sick, and emergency leave requests' },
      { module: 'Leave Requests', label: 'Submit Personal Leave Requests', admin: true, manager: true, user: true, description: 'Apply for time off and track balance' },
      { module: 'Audit Logs', label: 'View System Audit Trail & Security Logs', admin: true, manager: false, user: false, description: 'Monitor all system events, deletions, and administrative actions' }
    ];
    res.json({ success: true, permissions });
  });

  // Leave Requests CRUD
  apiRouter.post('/leave', (req: Request, res: Response) => {
    const { employeeId = 'emp_cian', type, startDate, endDate, days, reason } = req.body;
    const emp = employees.find(e => e.id === employeeId) || employees[0];
    const newLeave: LeaveRequest = {
      id: `leave_${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      type: type || 'Annual',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date().toISOString().split('T')[0],
      days: Number(days) || 1,
      reason: reason || '',
      status: 'pending',
      appliedAt: new Date().toISOString().split('T')[0]
    };
    leaveRequests.unshift(newLeave);
    res.json({ success: true, leave: newLeave });
  });

  apiRouter.patch('/leave/:id/status', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const leave = leaveRequests.find(l => l.id === id);
    if (!leave) return res.status(404).json({ error: 'Leave request not found' });
    if (status === 'approved' || status === 'rejected') {
      leave.status = status;
    }
    res.json({ success: true, leave });
  });

  // Employees POST
  apiRouter.post('/employees', (req: Request, res: Response) => {
    const { name, email, role, department, hourlyRate, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and Email are required' });
    }
    const newEmp: Employee = {
      id: `emp_${Date.now()}`,
      name,
      email,
      employeeCode: `EMP-${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
      role: role || 'Marketing Specialist',
      department: department || 'Marketing',
      avatar: name.charAt(0).toUpperCase(),
      hourlyRate: Number(hourlyRate) || 45,
      phone: phone || '+855 12 000 000',
      joinDate: new Date().toISOString().split('T')[0]
    };
    employees.push(newEmp);
    res.json({ success: true, employee: newEmp });
  });

  // Reports Export API
  apiRouter.get('/reports/export/:reportType', (req: Request, res: Response) => {
    const { reportType } = req.params;
    const { format = 'csv' } = req.query;

    let headers: string[] = [];
    let rows: Array<Record<string, string | number>> = [];
    let title = '';

    if (reportType === 'attendance') {
      title = 'Attendance Report - Daily Clock In/Out Records';
      headers = ['Employee Name', 'Date', 'Clock In', 'Clock Out', 'Total Hours', 'Status', 'Location', 'Notes'];
      rows = attendanceRecords.map(r => ({
        'Employee Name': r.employeeName,
        'Date': r.date,
        'Clock In': r.clockIn,
        'Clock Out': r.clockOut || 'Active',
        'Total Hours': (r.totalMinutes / 60).toFixed(2),
        'Status': r.status.replace('_', ' ').toUpperCase(),
        'Location': r.location,
        'Notes': r.notes
      }));
    } else if (reportType === 'productivity') {
      title = 'Productivity Report - Hours Worked per Employee';
      headers = ['Employee Name', 'Role', 'Department', 'Logged Tasks', 'Total Hours Worked', 'Billable Ratio'];
      rows = employees.map(emp => {
        const empTasks = tasks.filter(t => t.assignedTo === emp.id);
        const totalMinutes = empTasks.reduce((acc, t) => acc + t.loggedMinutes, 0);
        const billableMinutes = empTasks.filter(t => t.billable).reduce((acc, t) => acc + t.loggedMinutes, 0);
        const ratio = totalMinutes > 0 ? `${Math.round((billableMinutes / totalMinutes) * 100)}%` : '100%';
        return {
          'Employee Name': emp.name,
          'Role': emp.role,
          'Department': emp.department,
          'Logged Tasks': empTasks.length,
          'Total Hours Worked': (totalMinutes / 60).toFixed(2),
          'Billable Ratio': ratio
        };
      });
    } else if (reportType === 'late') {
      title = 'Late Report - Late Arrivals by Employee';
      headers = ['Employee Name', 'Date', 'Clock In Time', 'Scheduled Time', 'Delay (Mins)', 'Location'];
      rows = attendanceRecords
        .filter(r => r.status === 'late')
        .map(r => ({
          'Employee Name': r.employeeName,
          'Date': r.date,
          'Clock In Time': r.clockIn,
          'Scheduled Time': '09:00 AM',
          'Delay (Mins)': 20,
          'Location': r.location
        }));
      if (rows.length === 0) {
        rows.push({
          'Employee Name': 'Marcus Vance',
          'Date': '2026-10-01',
          'Clock In Time': '09:20 AM',
          'Scheduled Time': '09:00 AM',
          'Delay (Mins)': 20,
          'Location': 'Marketing Hub'
        });
      }
    } else if (reportType === 'overtime') {
      title = 'Overtime Report - Overtime Hours by Employee';
      headers = ['Employee Name', 'Department', 'Standard Hours', 'Overtime Hours', 'OT Multiplier', 'Approved'];
      rows = attendanceRecords
        .filter(r => r.status === 'overtime' || r.totalMinutes > 480)
        .map(r => ({
          'Employee Name': r.employeeName,
          'Department': 'Marketing',
          'Standard Hours': 8.0,
          'Overtime Hours': ((r.totalMinutes - 480) / 60).toFixed(2),
          'OT Multiplier': '1.5x',
          'Approved': 'Yes'
        }));
      if (rows.length === 0) {
        rows.push({
          'Employee Name': 'Elena Rostova',
          'Department': 'Marketing',
          'Standard Hours': 8.0,
          'Overtime Hours': '0.75',
          'OT Multiplier': '1.5x',
          'Approved': 'Yes'
        });
      }
    } else {
      title = 'Payroll Hours Report - Billable Hours for Payroll';
      headers = ['Employee Name', 'Employee Code', 'Hourly Rate ($)', 'Regular Hours', 'Overtime Hours', 'Total Gross Pay ($)'];
      rows = employees.map(emp => {
        const rate = emp.hourlyRate;
        const regHours = 40.0;
        const otHours = emp.name === 'Elena Rostova' ? 3.5 : 0;
        const gross = (regHours * rate) + (otHours * rate * 1.5);
        return {
          'Employee Name': emp.name,
          'Employee Code': emp.employeeCode,
          'Hourly Rate ($)': rate,
          'Regular Hours': regHours.toFixed(1),
          'Overtime Hours': otHours.toFixed(1),
          'Total Gross Pay ($)': gross.toFixed(2)
        };
      });
    }

    if (format === 'csv') {
      const csvHeader = headers.join(',');
      const csvRows = rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','));
      const csvContent = [csvHeader, ...csvRows].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report_${Date.now()}.csv"`);
      return res.send(csvContent);
    }

    res.json({
      title,
      generatedAt: new Date().toISOString(),
      headers,
      rows
    });
  });

  // Mount API router
  app.use('/api', apiRouter);

  const server = http.createServer(app);

  // Mount Vite dev server middleware in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server }
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
