import React, { useState } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  DollarSign,
  Plus,
  MoreVertical,
  ArrowRight,
  X,
  Play,
  Square,
  Filter,
  Calendar,
  User,
  Briefcase,
  Pencil,
  RotateCcw,
  Layers,
  LayoutGrid,
  Trash2
} from 'lucide-react';
import { Project, Task, Employee, Language } from '../types';
import { translations } from '../i18n/translations';
import { ProjectTaskTreeview } from './ProjectTaskTreeview';

interface ProjectsTasksScreenProps {
  projects: Project[];
  tasks: Task[];
  employees: Employee[];
  onCreateProject: (proj: Partial<Project>) => Promise<void>;
  onCreateTask: (task: Partial<Task>) => Promise<void>;
  onToggleTaskComplete: (taskId: string) => Promise<void>;
  onLogTaskTime: (taskId: string, minutes: number) => Promise<void>;
  onSetTaskTime?: (taskId: string, loggedMinutes: number) => Promise<void>;
  onDeleteProject?: (projectId: string) => Promise<void>;
  onDeleteTask?: (taskId: string) => Promise<void>;
  lang?: Language;
}

export const ProjectsTasksScreen: React.FC<ProjectsTasksScreenProps> = ({
  projects,
  tasks,
  employees,
  onCreateProject,
  onCreateTask,
  onToggleTaskComplete,
  onLogTaskTime,
  onSetTaskTime,
  onDeleteProject,
  onDeleteTask,
  lang = 'en'
}) => {
  const t = translations[lang];
  const [viewMode, setViewMode] = useState<'tree' | 'grid'>('tree');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState<boolean>(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState<boolean>(false);

  // Edit Task Time State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editHours, setEditHours] = useState<string>('0');
  const [editMinutes, setEditMinutes] = useState<string>('0');

  // New Project Form State
  const [newProjectName, setNewProjectName] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newBudget, setNewBudget] = useState('8000');
  const [newBillableRate, setNewBillableRate] = useState('95');
  const [newDueDate, setNewDueDate] = useState('2026-11-30');
  const [newDescription, setNewDescription] = useState('');
  const [newPlanOwnerId, setNewPlanOwnerId] = useState(employees[0]?.id || 'emp_sarah');
  const [newProjectPriority, setNewProjectPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('medium');

  // New Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('emp_cian');
  const [newTaskEstimatedHours, setNewTaskEstimatedHours] = useState('4');
  const [newTaskBillable, setNewTaskBillable] = useState(true);
  const [newTaskPriority, setNewTaskPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('medium');
  const [newTaskStatus, setNewTaskStatus] = useState<'todo' | 'in_progress' | 'in_review' | 'completed'>('todo');

  // Active Live Timer State for Task
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

  const handleOpenEditTime = (task: Task) => {
    const h = Math.floor(task.loggedMinutes / 60);
    const m = task.loggedMinutes % 60;
    setEditHours(String(h));
    setEditMinutes(String(m));
    setEditingTask(task);
  };

  const handleSaveEditTime = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingTask) return;
    const h = Math.max(0, parseInt(editHours, 10) || 0);
    const m = Math.max(0, Math.min(59, parseInt(editMinutes, 10) || 0));
    const totalMins = h * 60 + m;

    if (onSetTaskTime) {
      await onSetTaskTime(editingTask.id, totalMins);
    } else {
      const diff = totalMins - editingTask.loggedMinutes;
      if (diff !== 0) {
        await onLogTaskTime(editingTask.id, diff);
      }
    }
    setEditingTask(null);
  };

  const adjustEditTime = (deltaMins: number) => {
    const currentTotal = (parseInt(editHours, 10) || 0) * 60 + (parseInt(editMinutes, 10) || 0);
    const newTotal = Math.max(0, currentTotal + deltaMins);
    setEditHours(String(Math.floor(newTotal / 60)));
    setEditMinutes(String(newTotal % 60));
  };

  // Calculations
  const activeCount = projects.filter(p => p.status === 'active').length;
  const doneCount = projects.filter(p => p.status === 'completed').length;
  const totalMinutesAll = tasks.reduce((sum, t) => sum + t.loggedMinutes, 0);
  const billableMinutesAll = tasks.filter(t => t.billable).reduce((sum, t) => sum + t.loggedMinutes, 0);

  const filteredProjects = projects.filter(p => {
    if (activeFilter === 'all') return true;
    return p.status === activeFilter;
  });

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName || !newClientName) return;
    const planOwner = employees.find(emp => emp.id === newPlanOwnerId);
    await onCreateProject({
      name: newProjectName,
      client: newClientName,
      budget: Number(newBudget),
      billableRate: Number(newBillableRate),
      dueDate: newDueDate,
      description: newDescription,
      planOwnerId: newPlanOwnerId,
      planOwnerName: planOwner?.name || 'Sarah Jenkins',
      priority: newProjectPriority
    });
    setNewProjectName('');
    setNewClientName('');
    setNewDescription('');
    setShowNewProjectModal(false);
  };

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newTaskTitle) return;
    await onCreateTask({
      projectId: selectedProject.id,
      title: newTaskTitle,
      assignedTo: newTaskAssignee,
      estimatedHours: Number(newTaskEstimatedHours),
      billable: newTaskBillable,
      dueDate: selectedProject.dueDate,
      priority: newTaskPriority,
      status: newTaskStatus
    });
    setNewTaskTitle('');
    setShowNewTaskModal(false);
  };

  const handleQuickAddTask = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (proj) {
      setSelectedProject(proj);
      setShowNewTaskModal(true);
    }
  };

  return (
    <div className="flex flex-col min-h-full px-4 sm:px-8 py-5 pb-24 max-w-6xl mx-auto w-full relative">
      {/* Title & Subtitle */}
      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t.projectsTasks}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t.trackTeamProjects}
        </p>
      </div>

      {/* 4 Summary Stats Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5">
        {/* Active (Blue) */}
        <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-center">
          <div className="text-lg font-bold text-blue-700 dark:text-blue-300 font-mono">
            {activeCount}
          </div>
          <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">{t.active}</div>
        </div>

        {/* Done (Green) */}
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-center">
          <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300 font-mono">
            {doneCount}
          </div>
          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{t.done}</div>
        </div>

        {/* Total Hrs (Yellow) */}
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 text-center">
          <div className="text-lg font-bold text-amber-700 dark:text-amber-300 font-mono">
            {(totalMinutesAll / 60).toFixed(0)}h
          </div>
          <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">{t.totalHrs}</div>
        </div>

        {/* Billable (Pink/Purple) */}
        <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900 text-center">
          <div className="text-lg font-bold text-purple-700 dark:text-purple-300 font-mono">
            {(billableMinutesAll / 60).toFixed(0)}h
          </div>
          <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">{t.billable}</div>
        </div>
      </div>

      {/* View Switcher & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
        {/* View Mode Toggle: Treeview vs Grid */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={() => setViewMode('tree')}
            className={`flex items-center gap-2 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'tree'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.treeview || 'Treeview (Hierarchy)'}</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{lang === 'km' ? 'កាតគម្រោង' : 'Grid Cards'}</span>
          </button>
        </div>

        {/* New Project Quick Button */}
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t.newProject}</span>
        </button>
      </div>

      {viewMode === 'tree' ? (
        <ProjectTaskTreeview
          projects={projects}
          tasks={tasks}
          employees={employees}
          onToggleTaskComplete={onToggleTaskComplete}
          onLogTaskTime={onLogTaskTime}
          onSetTaskTime={onSetTaskTime}
          onDeleteTask={onDeleteTask}
          onDeleteProject={onDeleteProject}
          onQuickAddTask={handleQuickAddTask}
          lang={lang}
        />
      ) : (
        <>
          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6 max-w-md">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.all}
            </button>
            <button
              onClick={() => setActiveFilter('active')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === 'active'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.active}
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === 'completed'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.completed}
            </button>
            <button
              onClick={() => setActiveFilter('archived')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === 'archived'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.archived}
            </button>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredProjects.length === 0 ? (
              <div className="col-span-full text-center py-10 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 p-6">
                <FolderKanban className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{t.noProjectsFound}</p>
                <p className="text-[11px] text-slate-400 mt-1">{t.tapNewProjectMsg}</p>
              </div>
            ) : (
              filteredProjects.map((proj) => {
                const projTasks = tasks.filter(t => t.projectId === proj.id);
                const completedTasks = projTasks.filter(t => t.completed).length;
                const projMinutes = projTasks.reduce((acc, t) => acc + t.loggedMinutes, 0);
                const projBillableMinutes = projTasks.filter(t => t.billable).reduce((acc, t) => acc + t.loggedMinutes, 0);
                const percent = projTasks.length > 0 ? Math.round((completedTasks / projTasks.length) * 100) : 0;

                return (
                  <div
                    key={proj.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs hover:border-blue-200 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                          {proj.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Client: {proj.client} {proj.planOwnerName ? `• Owner: ${proj.planOwnerName}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {onDeleteProject && (
                          <button
                            onClick={() => {
                              if (confirm(t.deleteProjectConfirm || 'Delete project?')) {
                                onDeleteProject(proj.id);
                              }
                            }}
                            className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* 4-column metric row + Status Pill */}
                    <div className="flex items-center justify-between mt-4 text-center">
                      <div className="flex items-center gap-4 text-left">
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                            {completedTasks}/{projTasks.length}
                          </div>
                          <div className="text-[10px] text-slate-400">Tasks</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                            {(projMinutes / 60).toFixed(0)}h
                          </div>
                          <div className="text-[10px] text-slate-400">{t.hours}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                            {(projBillableMinutes / 60).toFixed(0)}h
                          </div>
                          <div className="text-[10px] text-slate-400">{t.billable}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                            {proj.dueDate.slice(5)}
                          </div>
                          <div className="text-[10px] text-slate-400">{t.dueDate}</div>
                        </div>
                      </div>

                      {/* Status badge pill */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          proj.status === 'completed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {proj.status === 'completed' ? t.completed : t.active}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">{percent}% {t.complete}</span>
                        <button
                          onClick={() => setSelectedProject(proj)}
                          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
                        >
                          <span>{t.viewTasks}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Floating Action Button: + New Project */}
      <div className="sticky bottom-20 mt-6 flex justify-end">
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/40 hover:from-blue-700 hover:to-blue-600 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t.newProject}</span>
        </button>
      </div>

      {/* Create Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.createProjectTitle}</h3>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProjectSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {t.projectTitle}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Social Video Production"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {t.clientAccount}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Media Corp"
                  value={newClientName}
                  onChange={e => setNewClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {t.budget}
                  </label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={e => setNewBudget(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {t.billableRate}
                  </label>
                  <input
                    type="number"
                    value={newBillableRate}
                    onChange={e => setNewBillableRate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {t.dueDate}
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={e => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {t.description}
                </label>
                <textarea
                  rows={2}
                  placeholder="Key goals, deliverables, and team responsibilities..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25"
                >
                  {t.createProjectBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Tasks Drawer / Modal for selected Project */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[240px]">
                  {selectedProject.name}
                </h3>
                <p className="text-[11px] text-slate-400">Client: {selectedProject.client}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tasks list */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tasks ({tasks.filter(t => t.projectId === selectedProject.id).length})
                </span>
                <button
                  onClick={() => setShowNewTaskModal(true)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.addTask}</span>
                </button>
              </div>

              {tasks.filter(t => t.projectId === selectedProject.id).length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">{t.noTasksProject}</div>
              ) : (
                tasks
                  .filter(t => t.projectId === selectedProject.id)
                  .map(task => {
                    const isRunning = runningTaskId === task.id;
                    const assignedEmp = employees.find(e => e.id === task.assignedTo);

                    return (
                      <div
                        key={task.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          task.completed
                            ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 opacity-70'
                            : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => onToggleTaskComplete(task.id)}
                            className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <h4
                              className={`text-xs font-bold text-slate-800 dark:text-slate-200 ${
                                task.completed ? 'line-through text-slate-400' : ''
                              }`}
                            >
                              {task.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
                              <span>{assignedEmp ? assignedEmp.name : 'Cian'}</span>
                              <span>·</span>
                              <button
                                type="button"
                                onClick={() => handleOpenEditTime(task)}
                                className="inline-flex items-center gap-1 font-mono font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline bg-blue-50/90 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-200/60 dark:border-blue-800/60 transition-all cursor-pointer"
                                title={t.editHoursMinutes}
                              >
                                <Clock className="w-3 h-3 text-blue-500 shrink-0" />
                                <span>{(task.loggedMinutes / 60).toFixed(1)}h {t.logged}</span>
                                <Pencil className="w-2.5 h-2.5 text-blue-500 opacity-70 shrink-0 ml-0.5" />
                              </button>
                              {task.billable && (
                                <>
                                  <span>·</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t.billable}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Interactive Timer & Time Controls */}
                        {!task.completed && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              {isRunning ? (
                                <button
                                  onClick={() => handleStopTimer(task.id)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold animate-pulse"
                                >
                                  <Square className="w-3 h-3 fill-current" />
                                  <span>{t.stopTimer} ({timerSeconds}s)</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setRunningTaskId(task.id);
                                    setTimerSeconds(0);
                                  }}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-[11px] font-bold"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>{t.startTimer}</span>
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => onLogTaskTime(task.id, 30)}
                                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-semibold hover:bg-slate-200"
                                title="Add 30 minutes"
                              >
                                +30m
                              </button>
                              <button
                                onClick={() => onLogTaskTime(task.id, 60)}
                                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-semibold hover:bg-slate-200"
                                title="Add 1 hour"
                              >
                                +1h
                              </button>

                              {/* Prominent Edit Time button */}
                              <button
                                onClick={() => handleOpenEditTime(task)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shadow-xs active:scale-95 transition-all ml-1"
                                title={t.editHoursMinutes}
                              >
                                <Pencil className="w-3 h-3" />
                                <span>{t.editTime}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>

            {/* Inline Task Form */}
            {showNewTaskModal && (
              <form onSubmit={handleCreateTaskSubmit} className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 space-y-2">
                <input
                  type="text"
                  required
                  placeholder="Task title (e.g. Audit conversion funnel)"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-slate-500">{t.billable}</label>
                    <input
                      type="checkbox"
                      checked={newTaskBillable}
                      onChange={e => setNewTaskBillable(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNewTaskModal(false)}
                      className="px-3 py-1 text-xs text-slate-500"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold"
                    >
                      {t.saveTask}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Logged Hours & Minutes Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.editHoursMinutes}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
                    {editingTask.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingTask(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTime} className="p-5 space-y-4">
              {/* Current vs New Total Display */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                    {t.loggedHoursMinutes}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Original: {Math.floor(editingTask.loggedMinutes / 60)}h {editingTask.loggedMinutes % 60}m ({editingTask.loggedMinutes}m)
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                    {t.totalResult}
                  </div>
                  <div className="font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {parseInt(editHours || '0', 10)}h {parseInt(editMinutes || '0', 10)}m
                  </div>
                </div>
              </div>

              {/* Hour & Minute Stepper Inputs */}
              <div className="grid grid-cols-2 gap-3">
                {/* Hours Input */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    {t.hoursLabel} (h)
                  </label>
                  <div className="flex items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-1">
                    <button
                      type="button"
                      onClick={() => adjustEditTime(-60)}
                      className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center justify-center transition-colors shadow-xs"
                      title="-1 hour"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={editHours}
                      onChange={e => setEditHours(e.target.value)}
                      className="w-full text-center bg-transparent font-mono font-bold text-base text-slate-800 dark:text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => adjustEditTime(60)}
                      className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center justify-center transition-colors shadow-xs"
                      title="+1 hour"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Minutes Input */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    {t.minutesLabel} (m)
                  </label>
                  <div className="flex items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-1">
                    <button
                      type="button"
                      onClick={() => adjustEditTime(-5)}
                      className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center justify-center transition-colors shadow-xs"
                      title="-5 minutes"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={editMinutes}
                      onChange={e => setEditMinutes(e.target.value)}
                      className="w-full text-center bg-transparent font-mono font-bold text-base text-slate-800 dark:text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => adjustEditTime(5)}
                      className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center justify-center transition-colors shadow-xs"
                      title="+5 minutes"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Adjust Buttons */}
              <div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                  {t.quickAdjust}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => adjustEditTime(15)}
                    className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold font-mono text-center transition-colors"
                  >
                    +15m
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustEditTime(30)}
                    className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold font-mono text-center transition-colors"
                  >
                    +30m
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustEditTime(60)}
                    className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold font-mono text-center transition-colors"
                  >
                    +1h
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustEditTime(-30)}
                    className="py-1.5 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold font-mono text-center transition-colors"
                  >
                    -30m
                  </button>
                </div>
              </div>

              {/* Reset to 0 Shortcut */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditHours('0');
                    setEditMinutes('0');
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t.resetToZero}</span>
                </button>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-all active:scale-95"
                >
                  {t.saveTime}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
