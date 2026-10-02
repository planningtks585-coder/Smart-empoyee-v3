import React, { useState, useMemo } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  Circle,
  Clock,
  Play,
  Square,
  ChevronDown,
  ChevronRight,
  Filter,
  Calendar,
  User,
  Plus,
  Trash2,
  Search,
  AlertTriangle,
  ArrowRight,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Pencil
} from 'lucide-react';
import { Project, Task, Employee, Language } from '../types';
import { translations } from '../i18n/translations';

interface ProjectTaskTreeviewProps {
  projects: Project[];
  tasks: Task[];
  employees: Employee[];
  onToggleTaskComplete: (taskId: string) => Promise<void>;
  onLogTaskTime: (taskId: string, minutes: number) => Promise<void>;
  onSetTaskTime?: (taskId: string, loggedMinutes: number) => Promise<void>;
  onDeleteTask?: (taskId: string) => Promise<void>;
  onDeleteProject?: (projectId: string) => Promise<void>;
  onQuickAddTask?: (projectId: string) => void;
  lang?: Language;
}

export const ProjectTaskTreeview: React.FC<ProjectTaskTreeviewProps> = ({
  projects,
  tasks,
  employees,
  onToggleTaskComplete,
  onLogTaskTime,
  onSetTaskTime,
  onDeleteTask,
  onDeleteProject,
  onQuickAddTask,
  lang = 'en'
}) => {
  const t = translations[lang];

  // Grouping Mode: 'owner' (Plan Owner) or 'project'
  const [groupBy, setGroupBy] = useState<'owner' | 'project'>('owner');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in_progress' | 'in_review' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'high' | 'medium' | 'low'>('all');
  const [dueDateFilter, setDueDateFilter] = useState<'all' | 'overdue' | 'today' | 'week' | 'later'>('all');
  const [selectedOwner, setSelectedOwner] = useState<string>('all');

  // Expand / Collapse State
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    // Default expand all projects
    const initial = new Set<string>();
    projects.forEach(p => initial.add(p.id));
    employees.forEach(e => initial.add(`owner_${e.id}`));
    return initial;
  });

  // Active Live Timer State
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  React.useEffect(() => {
    let interval: any = null;
    if (runningTaskId) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [runningTaskId]);

  const handleStopTimer = async (taskId: string) => {
    const minutes = Math.max(1, Math.round(timerSeconds / 60));
    await onLogTaskTime(taskId, minutes);
    setRunningTaskId(null);
    setTimerSeconds(0);
  };

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set<string>();
    projects.forEach(p => all.add(p.id));
    employees.forEach(e => all.add(`owner_${e.id}`));
    setExpandedNodes(all);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Filter Tasks based on interactive filters
  const filteredTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    return tasks.filter(task => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const proj = projects.find(p => p.id === task.projectId);
        const matchesProj = proj?.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesProj) return false;
      }

      // Status
      if (statusFilter !== 'all') {
        const currentStatus = task.status || (task.completed ? 'completed' : 'in_progress');
        if (currentStatus !== statusFilter) return false;
      }

      // Priority
      if (priorityFilter !== 'all') {
        const currentPriority = task.priority || 'medium';
        if (currentPriority !== priorityFilter) return false;
      }

      // Due Date
      if (dueDateFilter !== 'all' && task.dueDate) {
        if (dueDateFilter === 'overdue' && task.dueDate < today && !task.completed) return true;
        if (dueDateFilter === 'today' && task.dueDate === today) return true;
        if (dueDateFilter === 'week' && task.dueDate >= today && task.dueDate <= nextWeek) return true;
        if (dueDateFilter === 'later' && task.dueDate > nextWeek) return true;
        return false;
      }

      return true;
    });
  }, [tasks, projects, searchQuery, statusFilter, priorityFilter, dueDateFilter]);

  // Group by Plan Owner
  const groupedByOwner = useMemo(() => {
    const map = new Map<string, { owner: Employee; projects: Project[] }>();

    // Prepare default plan owners from employees
    employees.forEach(emp => {
      map.set(emp.id, { owner: emp, projects: [] });
    });

    // Assign projects to plan owners
    projects.forEach(proj => {
      const ownerId = proj.planOwnerId || employees[0]?.id || 'emp_sarah';
      let entry = map.get(ownerId);
      if (!entry) {
        const fallbackEmp: Employee = {
          id: ownerId,
          name: proj.planOwnerName || 'Sarah Jenkins',
          email: '',
          employeeCode: '',
          role: 'Plan Lead',
          department: 'Marketing',
          avatar: (proj.planOwnerName || 'S').charAt(0),
          hourlyRate: 50,
          phone: '',
          joinDate: ''
        };
        entry = { owner: fallbackEmp, projects: [] };
        map.set(ownerId, entry);
      }
      entry.projects.push(proj);
    });

    // Filter out owners with 0 projects if specific owner is selected
    const result: Array<{ owner: Employee; projects: Project[] }> = [];
    map.forEach(val => {
      if (selectedOwner === 'all' || val.owner.id === selectedOwner) {
        if (val.projects.length > 0 || selectedOwner !== 'all') {
          result.push(val);
        }
      }
    });

    return result;
  }, [projects, employees, selectedOwner]);

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
            {t.priorityUrgent}
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
            {t.priorityHigh}
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {t.priorityLow}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
            {t.priorityMedium}
          </span>
        );
    }
  };

  const getStatusBadge = (status?: string, completed?: boolean) => {
    if (completed || status === 'completed') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          {t.completedStatus}
        </span>
      );
    }
    if (status === 'in_review') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
          {t.inReviewStatus}
        </span>
      );
    }
    if (status === 'in_progress') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          {t.inProgressStatus}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        {t.todoStatus}
      </span>
    );
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {/* Top Controls Bar: Group Switcher & Expand/Collapse */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Grouping Mode Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-500" />
              <span>Grouping:</span>
            </span>
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setGroupBy('owner')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  groupBy === 'owner'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t.groupByPlanOwner}
              </button>
              <button
                type="button"
                onClick={() => setGroupBy('project')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  groupBy === 'project'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t.groupByProject}
              </button>
            </div>
          </div>

          {/* Expand/Collapse & Quick Stats */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={expandAll}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
            >
              {t.expandAll}
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
            >
              {t.collapseAll}
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks or projects..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
            >
              <option value="all">{t.filterStatus}: All</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value as any)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
            >
              <option value="all">{t.filterPriority}: All</option>
              <option value="urgent">{t.priorityUrgent}</option>
              <option value="high">{t.priorityHigh}</option>
              <option value="medium">{t.priorityMedium}</option>
              <option value="low">{t.priorityLow}</option>
            </select>
          </div>

          {/* Due Date Filter */}
          <div>
            <select
              value={dueDateFilter}
              onChange={e => setDueDateFilter(e.target.value as any)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
            >
              <option value="all">{t.filterDueDate}: All</option>
              <option value="overdue">Overdue Tasks</option>
              <option value="today">Due Today</option>
              <option value="week">Due This Week</option>
              <option value="later">Due Later</option>
            </select>
          </div>

          {/* Plan Owner Filter (in owner mode) */}
          <div>
            <select
              value={selectedOwner}
              onChange={e => setSelectedOwner(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
            >
              <option value="all">{t.planOwner}: All Owners</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.department})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Render Treeview Nodes */}
      <div className="space-y-4">
        {groupBy === 'owner' ? (
          // ================= GROUP BY PLAN OWNER =================
          groupedByOwner.map(({ owner, projects: ownerProjects }) => {
            const isOwnerExpanded = expandedNodes.has(`owner_${owner.id}`);
            const ownerTasks = filteredTasks.filter(t =>
              ownerProjects.some(p => p.id === t.projectId)
            );

            return (
              <div
                key={owner.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                {/* Level 1: Plan Owner Header Node */}
                <div
                  onClick={() => toggleExpand(`owner_${owner.id}`)}
                  className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/60 dark:to-slate-800/30 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-slate-400 p-0.5">
                      {isOwnerExpanded ? (
                        <ChevronDown className="w-5 h-5 text-blue-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      {owner.avatar || owner.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {owner.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {owner.department}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{owner.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {ownerProjects.length} Projects · {ownerTasks.length} Tasks
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {ownerTasks.filter(t => t.completed).length} completed
                      </div>
                    </div>
                  </div>
                </div>

                {/* Level 2: Projects under Plan Owner */}
                {isOwnerExpanded && (
                  <div className="p-4 sm:p-5 space-y-4">
                    {ownerProjects.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2 pl-8">
                        No projects assigned to this plan owner yet.
                      </p>
                    ) : (
                      ownerProjects.map(proj => {
                        const isProjExpanded = expandedNodes.has(proj.id);
                        const projTasks = filteredTasks.filter(t => t.projectId === proj.id);
                        const completedCount = projTasks.filter(t => t.completed).length;
                        const percent = projTasks.length > 0 ? Math.round((completedCount / projTasks.length) * 100) : 0;

                        return (
                          <div
                            key={proj.id}
                            className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 overflow-hidden"
                          >
                            {/* Project Node Header */}
                            <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/50 dark:border-slate-800/60 bg-white/70 dark:bg-slate-800/80">
                              <div
                                onClick={() => toggleExpand(proj.id)}
                                className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                              >
                                <button className="text-slate-400 p-0.5">
                                  {isProjExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-blue-500" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </button>
                                <FolderKanban className="w-4 h-4 text-blue-600 shrink-0" />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                      {proj.name}
                                    </span>
                                    {getPriorityBadge(proj.priority)}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    Client: {proj.client} · Due: {proj.dueDate} · Budget: ${proj.budget.toLocaleString()}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                {/* Progress badge */}
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden hidden sm:block">
                                    <div
                                      className="bg-blue-600 h-full rounded-full"
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>
                                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 font-mono">
                                    {completedCount}/{projTasks.length} ({percent}%)
                                  </span>
                                </div>

                                {/* Quick Add Task to this project */}
                                {onQuickAddTask && (
                                  <button
                                    type="button"
                                    onClick={() => onQuickAddTask(proj.id)}
                                    className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-300 text-[11px] font-bold border border-blue-200/60 dark:border-blue-900 transition-colors flex items-center gap-1"
                                    title="Add Task to Project"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Task</span>
                                  </button>
                                )}

                                {/* Delete project button */}
                                {onDeleteProject && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteProject(proj.id)}
                                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                    title="Delete Project"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Level 3: Tasks under Project */}
                            {isProjExpanded && (
                              <div className="p-2 sm:p-3 divide-y divide-slate-100 dark:divide-slate-800/80">
                                {projTasks.length === 0 ? (
                                  <p className="text-[11px] text-slate-400 italic py-2 pl-8">
                                    No tasks match the active filters for this project.
                                  </p>
                                ) : (
                                  projTasks.map(task => {
                                    const assignee = employees.find(e => e.id === task.assignedTo);
                                    const isOverdue = task.dueDate && task.dueDate < todayStr && !task.completed;
                                    const isRunning = runningTaskId === task.id;

                                    return (
                                      <div
                                        key={task.id}
                                        className="py-2.5 pl-6 sm:pl-8 pr-2 flex flex-col md:flex-row md:items-center justify-between gap-2.5 hover:bg-white/80 dark:hover:bg-slate-800/80 rounded-xl transition-colors"
                                      >
                                        <div className="flex items-start gap-2.5 min-w-0">
                                          {/* Task completion toggle */}
                                          <button
                                            type="button"
                                            onClick={() => onToggleTaskComplete(task.id)}
                                            className="mt-0.5 text-slate-400 hover:text-blue-600 shrink-0"
                                          >
                                            {task.completed ? (
                                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                              <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                                            )}
                                          </button>

                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span
                                                className={`text-xs font-semibold ${
                                                  task.completed
                                                    ? 'line-through text-slate-400 dark:text-slate-500'
                                                    : 'text-slate-800 dark:text-slate-200'
                                                }`}
                                              >
                                                {task.title}
                                              </span>
                                              {getPriorityBadge(task.priority)}
                                              {getStatusBadge(task.status, task.completed)}
                                            </div>

                                            {/* Task metadata */}
                                            <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 flex-wrap">
                                              {/* Assignee */}
                                              <span className="flex items-center gap-1">
                                                <User className="w-3 h-3 text-slate-400" />
                                                <span>{assignee?.name || 'Cian'}</span>
                                              </span>

                                              {/* Hours logged */}
                                              <span className="flex items-center gap-1 font-mono">
                                                <Clock className="w-3 h-3" />
                                                <span>{(task.loggedMinutes / 60).toFixed(1)}h / {task.estimatedHours}h</span>
                                              </span>

                                              {/* Due date */}
                                              {task.dueDate && (
                                                <span
                                                  className={`flex items-center gap-1 font-mono ${
                                                    isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : ''
                                                  }`}
                                                >
                                                  <Calendar className="w-3 h-3" />
                                                  <span>{task.dueDate}</span>
                                                  {isOverdue && <span>(Overdue)</span>}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Task Actions */}
                                        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                                          {/* Live Timer Button */}
                                          {isRunning ? (
                                            <button
                                              type="button"
                                              onClick={() => handleStopTimer(task.id)}
                                              className="px-2 py-1 rounded-lg bg-rose-500 text-white text-[10px] font-bold flex items-center gap-1 animate-pulse"
                                            >
                                              <Square className="w-3 h-3 fill-current" />
                                              <span>{timerSeconds}s</span>
                                            </button>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setRunningTaskId(task.id);
                                                setTimerSeconds(0);
                                              }}
                                              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                                              title="Start Timer"
                                            >
                                              <Play className="w-3.5 h-3.5" />
                                            </button>
                                          )}

                                          {/* Delete Task */}
                                          {onDeleteTask && (
                                            <button
                                              type="button"
                                              onClick={() => onDeleteTask(task.id)}
                                              className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                              title="Delete Task"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // ================= GROUP BY PROJECT =================
          projects.map(proj => {
            const isProjExpanded = expandedNodes.has(proj.id);
            const projTasks = filteredTasks.filter(t => t.projectId === proj.id);
            const completedCount = projTasks.filter(t => t.completed).length;
            const percent = projTasks.length > 0 ? Math.round((completedCount / projTasks.length) * 100) : 0;
            const planOwner = employees.find(e => e.id === proj.planOwnerId) || { name: proj.planOwnerName || 'Sarah Jenkins' };

            return (
              <div
                key={proj.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                {/* Project Header Node */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800">
                  <div
                    onClick={() => toggleExpand(proj.id)}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <button className="text-slate-400 p-0.5">
                      {isProjExpanded ? (
                        <ChevronDown className="w-5 h-5 text-blue-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {proj.name}
                        </h3>
                        {getPriorityBadge(proj.priority)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Client: {proj.client} · Plan Owner: <span className="font-semibold text-slate-600 dark:text-slate-300">{planOwner.name}</span> · Budget: ${proj.budget.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {completedCount}/{projTasks.length} Tasks ({percent}%)
                      </div>
                      <div className="text-[10px] text-slate-400">Due {proj.dueDate}</div>
                    </div>

                    {onQuickAddTask && (
                      <button
                        type="button"
                        onClick={() => onQuickAddTask(proj.id)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Task</span>
                      </button>
                    )}

                    {onDeleteProject && (
                      <button
                        type="button"
                        onClick={() => onDeleteProject(proj.id)}
                        className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Tasks inside Project */}
                {isProjExpanded && (
                  <div className="p-3 sm:p-4 divide-y divide-slate-100 dark:divide-slate-800">
                    {projTasks.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-3 pl-8">
                        No tasks match the active filters for this project.
                      </p>
                    ) : (
                      projTasks.map(task => {
                        const assignee = employees.find(e => e.id === task.assignedTo);
                        const isOverdue = task.dueDate && task.dueDate < todayStr && !task.completed;
                        const isRunning = runningTaskId === task.id;

                        return (
                          <div
                            key={task.id}
                            className="py-3 pl-6 sm:pl-8 pr-2 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl transition-colors"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <button
                                type="button"
                                onClick={() => onToggleTaskComplete(task.id)}
                                className="mt-0.5 text-slate-400 hover:text-blue-600 shrink-0"
                              >
                                {task.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                                )}
                              </button>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`text-xs font-semibold ${
                                      task.completed
                                        ? 'line-through text-slate-400 dark:text-slate-500'
                                        : 'text-slate-800 dark:text-slate-200'
                                    }`}
                                  >
                                    {task.title}
                                  </span>
                                  {getPriorityBadge(task.priority)}
                                  {getStatusBadge(task.status, task.completed)}
                                </div>

                                <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3 text-slate-400" />
                                    <span>{assignee?.name || 'Cian'}</span>
                                  </span>
                                  <span className="flex items-center gap-1 font-mono">
                                    <Clock className="w-3 h-3" />
                                    <span>{(task.loggedMinutes / 60).toFixed(1)}h / {task.estimatedHours}h</span>
                                  </span>
                                  {task.dueDate && (
                                    <span
                                      className={`flex items-center gap-1 font-mono ${
                                        isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : ''
                                      }`}
                                    >
                                      <Calendar className="w-3 h-3" />
                                      <span>{task.dueDate}</span>
                                      {isOverdue && <span>(Overdue)</span>}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                              {isRunning ? (
                                <button
                                  type="button"
                                  onClick={() => handleStopTimer(task.id)}
                                  className="px-2.5 py-1 rounded-xl bg-rose-500 text-white text-[11px] font-bold flex items-center gap-1 animate-pulse"
                                >
                                  <Square className="w-3 h-3 fill-current" />
                                  <span>{timerSeconds}s</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRunningTaskId(task.id);
                                    setTimerSeconds(0);
                                  }}
                                  className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                                  title="Start Live Timer"
                                >
                                  <Play className="w-4 h-4" />
                                </button>
                              )}

                              {onDeleteTask && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteTask(task.id)}
                                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                  title="Delete Task"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
