import { AppState, Project, Task, LeaveRequest, Employee, Deal } from '../types';

export const INITIAL_FALLBACK_STATE: AppState = {
  company: {
    name: 'Marketing Landmark',
    adminEmail: 'admin@marketinglandmark.com',
    domain: 'marketinglandmark.com'
  },
  currentUser: {
    id: 'emp_cian',
    name: 'Cian',
    email: 'cian@marketinglandmark.com',
    employeeCode: 'EMP-1780778608260',
    role: 'Senior Ads Specialist',
    department: 'Marketing',
    avatar: 'C',
    hourlyRate: 55,
    phone: '+855 12 888 999',
    joinDate: '2023-04-15'
  },
  cianPunchState: {
    clockedIn: true,
    clockInTime: '09:00 AM',
    currentLocation: 'Marketing Hub Creative Space (ទួលគោក)',
    onBreak: false,
    breakType: null,
    breakStartTime: null,
    breaksToday: [],
    todayMinutes: 240
  },
  metrics: {
    totalEmployees: 9,
    workingNow: 6,
    presentToday: 8,
    lateToday: 1,
    onLeaveToday: 1,
    attendanceRate: '88.9%',
    attendanceBreakdown: {
      present: 8,
      late: 1,
      absent: 0,
      onLeave: 1
    }
  },
  employees: [
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
      joinDate: '2023-04-15'
    },
    {
      id: 'emp_admin',
      name: 'Marketing Landmark Admin',
      email: 'admin@marketinglandmark.com',
      employeeCode: 'EMP-1780778608261',
      role: 'Operations Director',
      department: 'Operations',
      avatar: 'M',
      hourlyRate: 75,
      phone: '+855 98 777 666',
      joinDate: '2022-01-10'
    },
    {
      id: 'emp_marcus',
      name: 'Marcus Vance',
      email: 'marcus.v@marketinglandmark.com',
      employeeCode: 'EMP-1780778608262',
      role: 'Performance Lead',
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
  ],
  departments: [
    { name: 'Marketing', count: 5, budget: 120000, lead: 'Elena Rostova' },
    { name: 'Engineering', count: 1, budget: 95000, lead: 'David Chen' },
    { name: 'Design', count: 1, budget: 70000, lead: 'Priya Sharma' },
    { name: 'Operations', count: 2, budget: 85000, lead: 'Hannah Abbott' }
  ],
  locations: [
    { id: 'loc_hq', name: 'Marketing Landmark HQ (ភ្នំពេញ)', address: 'Canadia Tower, Level 18, Phnom Penh', activeCount: 5, radiusMeters: 150 },
    { id: 'loc_hub', name: 'Marketing Hub Creative Space (ទួលគោក)', address: 'Street 315, Toul Kork, Phnom Penh', activeCount: 2, radiusMeters: 200 },
    { id: 'loc_remote', name: 'Remote / Work From Home (ពីផ្ទះ)', address: 'Verified Geofence / VPN', activeCount: 2, radiusMeters: 1000 }
  ],
  projects: [
    {
      id: 'proj_seo',
      name: 'Search Engine Optimization',
      client: 'SEO',
      status: 'active',
      budget: 8500,
      billableRate: 95,
      dueDate: '2026-10-31',
      description: 'Quarterly enterprise technical audit, core web vitals optimization, keyword gap mapping, and backlink syndication.'
    },
    {
      id: 'proj_meta',
      name: 'Paid Media & TikTok Performance',
      client: 'Phnom Penh Fashion Group',
      status: 'active',
      budget: 14000,
      billableRate: 110,
      dueDate: '2026-11-15',
      description: 'End-to-end ROAS scaling across Meta Ads Manager, TikTok Spark Ads, creative testing framework and tracking.'
    },
    {
      id: 'proj_rebrand',
      name: 'Hospitality Brand Rebrand & Web',
      client: 'Koh Rong Resort & Spa',
      status: 'active',
      budget: 18000,
      billableRate: 120,
      dueDate: '2026-11-05',
      description: 'Full visual identity revamp, bilingual CMS web design, multi-currency booking engine integrations.'
    }
  ],
  tasks: [
    {
      id: 'task_audit',
      projectId: 'proj_seo',
      title: 'Technical Core Web Vitals Audit & Schema Mapping',
      assignedTo: 'emp_cian',
      completed: true,
      estimatedHours: 4,
      loggedMinutes: 240,
      billable: true,
      dueDate: '2026-10-10'
    },
    {
      id: 'task_ads',
      projectId: 'proj_meta',
      title: 'Targeting Matrix & Creative Iterations Batch 3',
      assignedTo: 'emp_cian',
      completed: false,
      estimatedHours: 6,
      loggedMinutes: 180,
      billable: true,
      dueDate: '2026-10-18'
    },
    {
      id: 'task_landing',
      projectId: 'proj_rebrand',
      title: 'Responsive High-Converting Landing Page Design in Figma',
      assignedTo: 'emp_priya',
      completed: false,
      estimatedHours: 8,
      loggedMinutes: 120,
      billable: true,
      dueDate: '2026-10-22'
    },
    {
      id: 'task_copy',
      projectId: 'proj_seo',
      title: 'Bilingual Copywriting & Meta Title Optimization',
      assignedTo: 'emp_elena',
      completed: true,
      estimatedHours: 3,
      loggedMinutes: 180,
      billable: true,
      dueDate: '2026-10-08'
    }
  ],
  attendanceRecords: [
    {
      id: 'att_cian_today',
      employeeId: 'emp_cian',
      employeeName: 'Cian',
      date: '2026-10-02',
      clockIn: '09:00 AM',
      clockOut: null,
      location: 'Marketing Hub Creative Space (ទួលគោក)',
      breaks: [],
      totalMinutes: 240,
      status: 'on_time',
      notes: 'Creative Sprint & Client Presentation'
    },
    {
      id: 'att_elena_today',
      employeeId: 'emp_elena',
      employeeName: 'Elena Rostova',
      date: '2026-10-02',
      clockIn: '08:55 AM',
      clockOut: '05:30 PM',
      location: 'Marketing Landmark HQ (ភ្នំពេញ)',
      breaks: [{ id: 'b1', type: 'lunch', start: '12:30 PM', end: '01:30 PM', durationMinutes: 60 }],
      totalMinutes: 515,
      status: 'overtime',
      notes: 'Reviewing campaign deliverables and client pitch deck'
    },
    {
      id: 'att_david_today',
      employeeId: 'emp_david',
      employeeName: 'David Chen',
      date: '2026-10-02',
      clockIn: '09:02 AM',
      clockOut: '05:00 PM',
      location: 'Remote / Work From Home (ពីផ្ទះ)',
      breaks: [],
      totalMinutes: 478,
      status: 'on_time',
      notes: 'Full-stack platform feature deployment and bug fixes'
    },
    {
      id: 'att_marcus_today',
      employeeId: 'emp_marcus',
      employeeName: 'Marcus Vance',
      date: '2026-10-02',
      clockIn: '09:20 AM',
      clockOut: '05:00 PM',
      location: 'Marketing Landmark HQ (ភ្នំពេញ)',
      breaks: [],
      totalMinutes: 460,
      status: 'late',
      notes: 'Traffic delay on Monivong Blvd'
    }
  ],
  leaveRequests: [
    {
      id: 'leave_jordan',
      employeeId: 'emp_jordan',
      employeeName: 'Jordan Miller',
      type: 'Annual',
      startDate: '2026-10-12',
      endDate: '2026-10-14',
      days: 3,
      reason: 'Family holiday visit to Siem Reap',
      status: 'approved',
      appliedAt: '2026-10-01'
    }
  ],
  weeklyShifts: [
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
      location: 'Marketing Landmark HQ (ភ្នំពេញ)',
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
      location: 'Marketing Hub Creative Space (ទួលគោក)',
      timeline: [
        { id: 't1', label: 'Clock In', time: '9:00 AM', type: 'clock_in', completed: true },
        { id: 't2', label: 'Short Break', time: '10:15 AM', type: 'short_break', completed: true },
        { id: 't3', label: 'Lunch Break', time: '01:00 PM', type: 'lunch_break', completed: true },
        { id: 't4', label: 'Clock Out', time: '5:00 PM', type: 'clock_out', completed: true }
      ]
    }
  ],
  salesDeals: [
    {
      id: 'deal_1',
      title: 'Enterprise Brand Strategy & Media Retainer',
      client: 'Angkor Tech Solutions',
      contactPerson: 'Serey Vathana',
      phone: '+855 12 900 100',
      value: 14500,
      stage: 'won',
      assignedRep: 'Cian',
      expectedCloseDate: '2026-10-01',
      notes: '6-month full marketing omnichannel retainer signed',
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
    }
  ]
};

export async function fetchAppState(): Promise<AppState> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('/api/state', { signal: controller.signal });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      localStorage.setItem('ml_app_state', JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Backend unavailable or static hosting mode. Loading offline state:', err);
  }

  // Restore from cached localStorage if available
  try {
    const cached = localStorage.getItem('ml_app_state');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error(e);
  }

  return INITIAL_FALLBACK_STATE;
}

export async function clockInAPI(location: string, notes?: string, shiftType: 'morning' | 'evening' = 'morning') {
  try {
    const res = await fetch('/api/attendance/clock-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: 'emp_cian', location, notes, shiftType })
    });
    const ct = res.headers.get('content-type') || '';
    if (res.ok && ct.includes('application/json')) return res.json();
  } catch (e) {
    console.warn('Offline mode: clock in');
  }

  // Fallback offline response
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = new Date().toISOString().split('T')[0];
  const record = {
    id: `att_${Date.now()}`,
    employeeId: 'emp_cian',
    employeeName: 'Cian',
    date: dateStr,
    clockIn: timeNow,
    clockOut: null,
    location,
    shiftType,
    breaks: [],
    totalMinutes: 0,
    status: 'on_time' as const,
    notes: notes || 'PWA offline punch'
  };
  return {
    success: true,
    cianPunchState: {
      clockedIn: true,
      clockInTime: timeNow,
      currentLocation: location,
      shiftType,
      onBreak: false,
      breakType: null,
      breakStartTime: null,
      breaksToday: [],
      todayMinutes: 0
    },
    record
  };
}

export async function clockOutAPI(notes?: string) {
  try {
    const res = await fetch('/api/attendance/clock-out', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: 'emp_cian', notes })
    });
    const ct = res.headers.get('content-type') || '';
    if (res.ok && ct.includes('application/json')) return res.json();
  } catch (e) {
    console.warn('Offline mode: clock out');
  }

  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = new Date().toISOString().split('T')[0];
  return {
    success: true,
    cianPunchState: {
      clockedIn: false,
      clockInTime: null,
      currentLocation: '',
      onBreak: false,
      breakType: null,
      breakStartTime: null,
      breaksToday: [],
      todayMinutes: 480
    },
    record: {
      id: `att_${Date.now()}`,
      employeeId: 'emp_cian',
      employeeName: 'Cian',
      date: dateStr,
      clockIn: '09:00 AM',
      clockOut: timeNow,
      location: 'Marketing Landmark HQ (ភ្នំពេញ)',
      breaks: [],
      totalMinutes: 480,
      status: 'on_time' as const,
      notes: notes || ''
    }
  };
}

export async function toggleBreakAPI(type: 'short' | 'lunch') {
  const res = await fetch('/api/attendance/break', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type })
  });
  if (!res.ok) throw new Error('Failed to toggle break');
  return res.json();
}

export async function createProjectAPI(projectData: Partial<Project>) {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData)
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}

export async function updateProjectAPI(id: string, projectData: Partial<Project>) {
  const res = await fetch(`/api/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData)
  });
  if (!res.ok) throw new Error('Failed to update project');
  return res.json();
}

export async function deleteProjectAPI(id: string) {
  const res = await fetch(`/api/projects/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete project');
  return res.json();
}

export async function createTaskAPI(taskData: Partial<Task>) {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

export async function deleteTaskAPI(taskId: string) {
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete task');
  return res.json();
}

export async function toggleTaskCompleteAPI(taskId: string) {
  const res = await fetch(`/api/tasks/${taskId}/toggle`, {
    method: 'PATCH'
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

export async function logTaskTimeAPI(taskId: string, minutes: number) {
  const res = await fetch(`/api/tasks/${taskId}/log-time`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ minutes })
  });
  if (!res.ok) throw new Error('Failed to log time');
  return res.json();
}

export async function setTaskTimeAPI(taskId: string, loggedMinutes: number) {
  const res = await fetch(`/api/tasks/${taskId}/time`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loggedMinutes })
  });
  if (!res.ok) throw new Error('Failed to set task time');
  return res.json();
}

export async function updateTaskAPI(taskId: string, data: Partial<Task>) {
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

export async function createLeaveAPI(leaveData: Partial<LeaveRequest>) {
  const res = await fetch('/api/leave', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leaveData)
  });
  if (!res.ok) throw new Error('Failed to submit leave');
  return res.json();
}

export async function updateLeaveStatusAPI(leaveId: string, status: 'approved' | 'rejected') {
  const res = await fetch(`/api/leave/${leaveId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update leave');
  return res.json();
}

export async function createEmployeeAPI(empData: Partial<Employee>) {
  const res = await fetch('/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(empData)
  });
  if (!res.ok) throw new Error('Failed to create employee');
  return res.json();
}

export async function updateEmployeeAPI(id: string, empData: Partial<Employee>) {
  const res = await fetch(`/api/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(empData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update employee');
  }
  return res.json();
}

export async function deleteEmployeeAPI(id: string) {
  const res = await fetch(`/api/employees/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete employee');
  }
  return res.json();
}

export async function fetchReportDataAPI(reportType: string) {
  const res = await fetch(`/api/reports/export/${reportType}?format=json`);
  if (!res.ok) throw new Error('Failed to fetch report');
  return res.json();
}

export async function fetchSalesDealsAPI() {
  const res = await fetch('/api/sales/deals');
  if (!res.ok) throw new Error('Failed to fetch sales deals');
  return res.json();
}

export async function createDealAPI(dealData: Partial<Deal>) {
  const res = await fetch('/api/sales/deals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dealData)
  });
  if (!res.ok) throw new Error('Failed to create deal');
  return res.json();
}

export async function updateDealStageAPI(dealId: string, stage: Deal['stage']) {
  const res = await fetch(`/api/sales/deals/${dealId}/stage`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage })
  });
  if (!res.ok) throw new Error('Failed to update deal stage');
  return res.json();
}

export async function updateAttendanceAPI(id: string, data: any) {
  const res = await fetch(`/api/attendance/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update attendance');
  return res.json();
}

export async function addManualAttendanceAPI(data: any) {
  const res = await fetch('/api/attendance/manual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to add manual attendance');
  return res.json();
}

export async function updateProfileAPI(data: any) {
  const res = await fetch('/api/auth/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update profile');
  }
  return res.json();
}

export async function updatePasswordAPI(data: { userId?: string; phone?: string; currentPassword?: string; newPassword: string }) {
  const res = await fetch('/api/auth/password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update password');
  }
  return res.json();
}

export async function resetPasswordAPI(phone: string, newPassword: string) {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, newPassword })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to reset password');
  }
  return res.json();
}

export async function fetchAccountsAPI() {
  const res = await fetch('/api/accounts');
  if (!res.ok) throw new Error('Failed to fetch accounts');
  return res.json();
}

export async function updateAccountPasswordAPI(id: string, newPassword: string) {
  const res = await fetch(`/api/accounts/${id}/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newPassword })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update account password');
  }
  return res.json();
}

// ADMIN BACK-END MANAGEMENT APIS
export async function fetchAdminOverviewAPI() {
  const res = await fetch('/api/admin/overview');
  if (!res.ok) throw new Error('Failed to fetch admin overview');
  return res.json();
}

export async function fetchAuditLogsAPI() {
  const res = await fetch('/api/admin/audit-logs');
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function createAdminAccountAPI(data: any) {
  const res = await fetch('/api/admin/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create account');
  }
  return res.json();
}

export async function updateAdminAccountAPI(id: string, data: any) {
  const res = await fetch(`/api/admin/accounts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update account');
  }
  return res.json();
}

export async function deleteAdminAccountAPI(id: string) {
  const res = await fetch(`/api/admin/accounts/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete account');
  }
  return res.json();
}

export async function deleteAttendanceAPI(id: string) {
  const res = await fetch(`/api/attendance/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete attendance record');
  }
  return res.json();
}

export async function bulkApproveAttendanceAPI() {
  const res = await fetch('/api/admin/attendance/bulk-approve', {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to bulk approve attendance');
  return res.json();
}

export async function createShiftAPI(data: any) {
  const res = await fetch('/api/shifts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create shift');
  }
  return res.json();
}

export async function updateShiftAPI(id: string, data: any) {
  const res = await fetch(`/api/shifts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update shift');
  }
  return res.json();
}

export async function deleteShiftAPI(id: string) {
  const res = await fetch(`/api/shifts/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete shift');
  return res.json();
}

export async function createDepartmentAPI(data: any) {
  const res = await fetch('/api/departments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create department');
  }
  return res.json();
}

export async function updateDepartmentAPI(name: string, data: any) {
  const res = await fetch(`/api/departments/${encodeURIComponent(name)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update department');
  }
  return res.json();
}

export async function deleteDepartmentAPI(name: string) {
  const res = await fetch(`/api/departments/${encodeURIComponent(name)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete department');
  return res.json();
}

export async function createLocationAPI(data: any) {
  const res = await fetch('/api/locations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create location');
  }
  return res.json();
}

export async function updateLocationAPI(id: string, data: any) {
  const res = await fetch(`/api/locations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update location');
  }
  return res.json();
}

export async function deleteLocationAPI(id: string) {
  const res = await fetch(`/api/locations/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete location');
  return res.json();
}

export async function deleteLeaveAPI(id: string) {
  const res = await fetch(`/api/leave/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete leave request');
  return res.json();
}

export async function broadcastAnnouncementAPI(message: string, priority = 'normal') {
  const res = await fetch('/api/admin/broadcast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, priority })
  });
  if (!res.ok) throw new Error('Failed to broadcast announcement');
  return res.json();
}

// SYSTEM SETTINGS & TELEGRAM INTEGRATION APIS
export async function fetchTelegramSettingsAPI() {
  const res = await fetch('/api/system/telegram');
  if (!res.ok) throw new Error('Failed to fetch Telegram settings');
  return res.json();
}

export async function updateTelegramSettingsAPI(settings: any) {
  const res = await fetch('/api/system/telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update Telegram settings');
  }
  return res.json();
}

export async function testTelegramWebhookAPI(customMessage?: string) {
  const res = await fetch('/api/system/telegram/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customMessage })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to test Telegram webhook');
  }
  return res.json();
}

export async function fetchShiftConfigAPI() {
  const res = await fetch('/api/system/shifts');
  if (!res.ok) throw new Error('Failed to fetch Shift configuration');
  return res.json();
}

export async function updateShiftConfigAPI(shiftConfig: any) {
  const res = await fetch('/api/system/shifts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shiftConfig)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update Shift configuration');
  }
  return res.json();
}

export async function fetchRolePermissionsAPI() {
  const res = await fetch('/api/system/permissions');
  if (!res.ok) throw new Error('Failed to fetch role permissions');
  return res.json();
}

