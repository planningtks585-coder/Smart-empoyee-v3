import React, { useState, useEffect } from 'react';
import {
  Settings,
  Send,
  Shield,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Smartphone,
  Sliders,
  Bell,
  Sun,
  Moon,
  Info,
  Check,
  X,
  FileCheck
} from 'lucide-react';
import {
  Language,
  AppState,
  UserRoleMode,
  TelegramSettings,
  ShiftConfig,
  RolePermission,
  Employee
} from '../types';
import { translations } from '../i18n/translations';
import {
  fetchTelegramSettingsAPI,
  updateTelegramSettingsAPI,
  testTelegramWebhookAPI,
  fetchShiftConfigAPI,
  updateShiftConfigAPI,
  fetchRolePermissionsAPI,
  fetchAccountsAPI,
  createAdminAccountAPI,
  updateAdminAccountAPI,
  deleteAdminAccountAPI,
  deleteProjectAPI,
  deleteTaskAPI
} from '../api/client';

interface SystemSettingsScreenProps {
  appState: AppState;
  roleMode: UserRoleMode;
  onRefreshState: () => void;
  lang?: Language;
}

export const SystemSettingsScreen: React.FC<SystemSettingsScreenProps> = ({
  appState,
  roleMode,
  onRefreshState,
  lang = 'en'
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'telegram' | 'roles' | 'shifts' | 'projects'>('telegram');

  // Telegram Settings State
  const [telegramSettings, setTelegramSettings] = useState<TelegramSettings>(
    appState.telegramSettings || {
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
      lastPingAt: new Date().toISOString(),
      recentDispatches: []
    }
  );

  const [showToken, setShowToken] = useState(false);
  const [savingTelegram, setSavingTelegram] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Shift Settings State
  const [shiftConfig, setShiftConfig] = useState<ShiftConfig>(
    appState.shiftConfig || {
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
    }
  );
  const [savingShifts, setSavingShifts] = useState(false);

  // User Accounts & Roles
  const [accounts, setAccounts] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  // Modals & Sub-forms
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('password123');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'manager' | 'user'>('user');
  const [newUserDept, setNewUserDept] = useState('Marketing');
  const [newUserShift, setNewUserShift] = useState<'morning' | 'evening'>('morning');

  // Load telegram settings, shifts, accounts & permissions
  const loadData = async () => {
    try {
      setLoadingAccounts(true);
      const [tgRes, shiftRes, accRes, permRes] = await Promise.all([
        fetchTelegramSettingsAPI().catch(() => null),
        fetchShiftConfigAPI().catch(() => null),
        fetchAccountsAPI().catch(() => null),
        fetchRolePermissionsAPI().catch(() => null)
      ]);

      if (tgRes?.settings) setTelegramSettings(tgRes.settings);
      if (shiftRes?.shiftConfig) setShiftConfig(shiftRes.shiftConfig);
      if (accRes?.accounts) setAccounts(accRes.accounts);
      if (permRes?.permissions) setPermissions(permRes.permissions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Telegram Handlers
  const handleSaveTelegram = async () => {
    try {
      setSavingTelegram(true);
      const res = await updateTelegramSettingsAPI(telegramSettings);
      if (res?.settings) setTelegramSettings(res.settings);
      showNotification('success', lang === 'km' ? 'បានរក្សាទុកការកំណត់ Telegram ដោយជោគជ័យ' : 'Telegram settings saved successfully');
      onRefreshState();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save Telegram settings');
    } finally {
      setSavingTelegram(false);
    }
  };

  const handleTestWebhook = async () => {
    try {
      setTestingWebhook(true);
      setTestResult(null);
      const res = await testTelegramWebhookAPI();
      setTestResult(res);
      if (res?.recentDispatches) {
        setTelegramSettings(prev => ({
          ...prev,
          recentDispatches: res.recentDispatches,
          lastPingStatus: 'healthy',
          lastPingAt: new Date().toISOString()
        }));
      }
      showNotification('success', lang === 'km' ? 'បានផ្ញើសារសាកល្បងទៅ Telegram Webhook ដោយជោគជ័យ!' : 'Test notification sent to Telegram Webhook successfully!');
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to test Telegram webhook');
    } finally {
      setTestingWebhook(false);
    }
  };

  // Shift Handlers
  const handleSaveShifts = async () => {
    try {
      setSavingShifts(true);
      const res = await updateShiftConfigAPI(shiftConfig);
      if (res?.shiftConfig) setShiftConfig(res.shiftConfig);
      showNotification('success', lang === 'km' ? 'បានរក្សាទុកប៉ារ៉ាម៉ែត្រវេនការងារ' : 'Shift configuration updated successfully');
      onRefreshState();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update shifts');
    } finally {
      setSavingShifts(false);
    }
  };

  // Role & User Account Handlers
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdminAccountAPI({
        name: newUserName,
        phone: newUserPhone,
        password: newUserPassword,
        role: newUserRole,
        email: newUserEmail,
        department: newUserDept,
        shiftPreference: newUserShift
      });
      setIsNewUserOpen(false);
      setNewUserName('');
      setNewUserPhone('');
      setNewUserEmail('');
      showNotification('success', lang === 'km' ? `បានបង្កើតអ្នកប្រើប្រាស់ ${newUserName} ដោយជោគជ័យ` : `User ${newUserName} created successfully`);
      loadData();
      onRefreshState();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to create user');
    }
  };

  const handleUpdateRole = async (accId: string, newRole: 'admin' | 'manager' | 'user') => {
    try {
      await updateAdminAccountAPI(accId, { role: newRole });
      showNotification('success', lang === 'km' ? 'បានផ្លាស់ប្តូរតួនាទីអ្នកប្រើប្រាស់' : `Role updated to ${newRole.toUpperCase()}`);
      loadData();
      onRefreshState();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (accId: string, name: string) => {
    if (!window.confirm(lang === 'km' ? `តើអ្នកពិតជាចង់លុបគណនី ${name} មែនទេ?` : `Are you sure you want to delete user ${name}?`)) return;
    try {
      await deleteAdminAccountAPI(accId);
      showNotification('success', lang === 'km' ? `បានលុបគណនី ${name}` : `User ${name} deleted successfully`);
      loadData();
      onRefreshState();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete user');
    }
  };

  const handleDeleteProject = async (projId: string, name: string) => {
    if (!window.confirm(lang === 'km' ? `តើអ្នកពិតជាចង់លុបគម្រោង "${name}" មែនទេ?` : t.deleteProjectConfirm)) return;
    try {
      await deleteProjectAPI(projId);
      showNotification('success', lang === 'km' ? `បានលុបគម្រោង "${name}"` : `Project "${name}" deleted`);
      onRefreshState();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete project');
    }
  };

  const isUserOnly = roleMode === 'user' || roleMode === 'employee';
  const isManager = roleMode === 'manager';
  const isAdmin = roleMode === 'admin';

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
              <Sliders className="w-3.5 h-3.5" />
              <span>{lang === 'km' ? 'មជ្ឈមណ្ឌលគ្រប់គ្រងប្រព័ន្ធ' : 'System Architecture & Integrations'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t.systemSettings}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              {t.systemSettingsSubtitle}
            </p>
          </div>

          {/* System Role Badge */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/15">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-slate-200">
              Role Authority: <span className="text-amber-400 font-bold capitalize">{roleMode}</span>
            </span>
          </div>
        </div>

        {/* Global Feedback Alert */}
        {feedback && (
          <div
            className={`mt-4 p-3 rounded-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-2 duration-200 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-200'
                : 'bg-rose-500/20 border border-rose-400/40 text-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {/* Access Restriction Notice if viewing as standard User */}
      {isUserOnly && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">
              {lang === 'km' ? 'ទិដ្ឋភាពបុគ្គលិកទូទៅ (User Mode):' : 'Standard User Access Mode:'}
            </span>{' '}
            {lang === 'km'
              ? 'អ្នកកំពុងមើលទំព័រការកំណត់ជាបុគ្គលិកធម្មតា។ ការកែប្រែប្រព័ន្ធត្រូវបានដាក់កំហិតសម្រាប់តែ Admin & Manager ប៉ុណ្ណោះ។ អ្នកអាចប្រើប៊ូតុងប្តូរតួនាទីខាងលើដើម្បីសាកល្បងសិទ្ធិ Admin ឬ Manager។'
              : 'You are viewing with standard User permissions. System modifications require Manager or Admin privilege. Switch your role above to test Admin or Manager capabilities.'}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('telegram')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'telegram'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>{t.telegramIntegration}</span>
          {telegramSettings.enabled && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'roles'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>{t.roleAccessManagement}</span>
        </button>

        <button
          onClick={() => setActiveTab('shifts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'shifts'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t.userShiftManagement}</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'projects'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>{lang === 'km' ? 'ការកំណត់គម្រោង & កិច្ចការ' : 'Project & Task Settings'}</span>
        </button>
      </div>

      {/* TAB 1: TELEGRAM INTEGRATION */}
      {activeTab === 'telegram' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Main Config Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {t.telegramIntegration}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.telegramSettingsDesc}
                  </p>
                </div>
              </div>

              {/* Enable / Disable Switch */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.enableTelegram}:
                </label>
                <button
                  type="button"
                  disabled={isUserOnly}
                  onClick={() =>
                    setTelegramSettings(prev => ({ ...prev, enabled: !prev.enabled }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    telegramSettings.enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                  } ${isUserOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      telegramSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Inputs: Webhook URL, Bot Token, Chat ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.webhookUrl}
                </label>
                <input
                  type="text"
                  disabled={isUserOnly}
                  value={telegramSettings.webhookUrl}
                  onChange={e =>
                    setTelegramSettings(prev => ({ ...prev, webhookUrl: e.target.value }))
                  }
                  placeholder="https://api.telegram.org/bot<token>/setWebhook or custom webhook"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {lang === 'km'
                    ? 'អាសយដ្ឋាន Webhook សម្រាប់ទទួលការបញ្ជូនទិន្នន័យជាក់ស្តែងពីប្រព័ន្ធ'
                    : 'Endpoint called in real-time when workforce events occur'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.botToken}
                </label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    disabled={isUserOnly}
                    value={telegramSettings.botToken}
                    onChange={e =>
                      setTelegramSettings(prev => ({ ...prev, botToken: e.target.value }))
                    }
                    placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.chatId}
                </label>
                <input
                  type="text"
                  disabled={isUserOnly}
                  value={telegramSettings.chatId}
                  onChange={e =>
                    setTelegramSettings(prev => ({ ...prev, chatId: e.target.value }))
                  }
                  placeholder="@marketinglandmark_ops or -100123456789"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60"
                />
              </div>
            </div>

            {/* Notification Event Toggles */}
            <div className="pt-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                {lang === 'km' ? 'ប្រភេទការជូនដំណឹងដែលត្រូវផ្ញើ' : 'Event Notification Preferences'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  {
                    key: 'attendancePunches',
                    label: t.notifyAttendancePunches,
                    desc: 'Morning & Evening shifts'
                  },
                  {
                    key: 'taskUpdates',
                    label: t.notifyTaskUpdates,
                    desc: 'Created, assigned, completed'
                  },
                  {
                    key: 'shiftReminders',
                    label: t.notifyShiftReminders,
                    desc: 'Upcoming shift start alerts'
                  },
                  {
                    key: 'leaveRequests',
                    label: t.notifyLeaveRequests,
                    desc: 'Submissions & approvals'
                  },
                  {
                    key: 'dailyDigest',
                    label: t.notifyDailyDigest,
                    desc: 'End of day metrics summary'
                  }
                ].map(item => (
                  <div
                    key={item.key}
                    onClick={() => {
                      if (isUserOnly) return;
                      setTelegramSettings(prev => ({
                        ...prev,
                        notificationTypes: {
                          ...prev.notificationTypes,
                          [item.key]: !prev.notificationTypes[item.key as keyof typeof prev.notificationTypes]
                        }
                      }));
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      telegramSettings.notificationTypes[item.key as keyof typeof telegramSettings.notificationTypes]
                        ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60'
                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        telegramSettings.notificationTypes[item.key as keyof typeof telegramSettings.notificationTypes]
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {telegramSettings.notificationTypes[item.key as keyof typeof telegramSettings.notificationTypes] && (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {item.label}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions: Save Settings & Test Dispatch */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    telegramSettings.enabled ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {t.telegramStatus}:{' '}
                  <span className="font-bold">
                    {telegramSettings.enabled ? 'Active & Ready' : 'Disabled'}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={testingWebhook || !telegramSettings.enabled}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${testingWebhook ? 'animate-bounce' : ''}`} />
                  <span>{testingWebhook ? 'Dispatching...' : t.testWebhook}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveTelegram}
                  disabled={savingTelegram || isUserOnly}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {savingTelegram ? 'Saving...' : lang === 'km' ? 'រក្សាទុកការកំណត់' : 'Save Telegram Settings'}
                </button>
              </div>
            </div>
          </div>

          {/* Test Dispatch Result Preview */}
          {testResult && (
            <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 animate-in fade-in">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    {lang === 'km' ? 'ការបញ្ជូនសាកល្បងជោគជ័យ (HTTP 200 OK)' : 'Webhook Test Succeeded (HTTP 200 OK)'}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
                  Latency: {testResult.latencyMs}ms
                </span>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl font-mono text-[11px] break-all">
                {testResult.dispatchedMessage}
              </p>
            </div>
          )}

          {/* Recent Telegram Dispatch Log */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t.recentTelegramDispatches}
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {telegramSettings.recentDispatches?.length || 0} events logged
              </span>
            </div>

            {telegramSettings.recentDispatches && telegramSettings.recentDispatches.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {telegramSettings.recentDispatches.slice(0, 6).map(disp => (
                  <div key={disp.id} className="py-2.5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Send className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                          {disp.message}
                        </p>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                          {disp.event}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold uppercase">
                        {disp.status}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(disp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">
                {lang === 'km' ? 'មិនទាន់មានកំណត់ហេតុផ្ញើសារនៅឡើយទេ' : 'No Telegram dispatches logged yet.'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ROLE ACCESS MANAGEMENT (RBAC) */}
      {activeTab === 'roles' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Roles Overview Cards (Admin vs Manager vs User) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Admin Role Card */}
            <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 relative">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 text-xs font-black uppercase">
                  {t.adminRole}
                </span>
                <Shield className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                {lang === 'km' ? 'សិទ្ធិពេញលេញលើប្រព័ន្ធ' : 'Full System Access'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.adminRoleDesc}
              </p>
            </div>

            {/* Manager Role Card */}
            <div className="p-5 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 relative">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase">
                  {t.managerRole}
                </span>
                <Users className="w-5 h-5 text-indigo-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                {lang === 'km' ? 'គ្រប់គ្រងគម្រោង & កិច្ចការ' : 'Project & Task Authority'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.managerRoleDesc}
              </p>
            </div>

            {/* User Role Card */}
            <div className="p-5 rounded-3xl bg-blue-500/10 border border-blue-500/20 relative">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-blue-600 text-white text-xs font-black uppercase">
                  {t.userRole}
                </span>
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                {lang === 'km' ? 'សិទ្ធិកម្រិតបុគ្គលិកទូទៅ' : 'Standard Workforce Access'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.userRoleDesc}
              </p>
            </div>
          </div>

          {/* User Accounts Management Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {lang === 'km' ? 'គណនីបុគ្គលិក និងការចាត់តាំងតួនាទី' : 'Workforce Accounts & Role Assignment'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'km' ? 'កំណត់តួនាទី Admin, Manager ឬ User សម្រាប់គណនីនីមួយៗ' : 'Admins can reassign roles or delete accounts'}
                </p>
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setIsNewUserOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'km' ? 'បន្ថែមអ្នកប្រើប្រាស់' : 'Add New User'}</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="w-full min-w-[620px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">{lang === 'km' ? 'អ្នកប្រើប្រាស់' : 'User'}</th>
                    <th className="py-2.5 px-3">{lang === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone'}</th>
                    <th className="py-2.5 px-3">{lang === 'km' ? 'នាយកដ្ឋាន' : 'Department'}</th>
                    <th className="py-2.5 px-3">{lang === 'km' ? 'តួនាទី (Role)' : 'Assigned Role'}</th>
                    <th className="py-2.5 px-3 text-right">{lang === 'km' ? 'សកម្មភាព' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {accounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                            {acc.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{acc.name}</div>
                            <div className="text-[10px] text-slate-400">{acc.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                        {acc.phone}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {acc.department || 'Marketing'}
                      </td>
                      <td className="py-3 px-3">
                        {isAdmin ? (
                          <select
                            value={acc.role === 'employee' ? 'user' : acc.role}
                            onChange={e => handleUpdateRole(acc.id, e.target.value as any)}
                            className="px-2.5 py-1 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                          >
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="user">User</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              acc.role === 'admin'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : acc.role === 'manager'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {acc.role}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isAdmin && acc.phone !== '+85598777666' ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(acc.id, acc.name)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Permissions Matrix */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.permissionsMatrix}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'km' ? 'ការបែងចែកសិទ្ធិយ៉ាងលម្អិតរវាង Admin, Manager និង User' : 'Detailed role-based permission matrix across all modules'}
              </p>
            </div>

            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="w-full min-w-[500px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    <th className="py-2.5 px-3">{lang === 'km' ? 'ម៉ូឌុល & សមត្ថភាព' : 'Module & Capability'}</th>
                    <th className="py-2.5 px-3 text-center">{t.adminRole}</th>
                    <th className="py-2.5 px-3 text-center">{t.managerRole}</th>
                    <th className="py-2.5 px-3 text-center">{t.userRole}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {permissions.map((perm, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">{perm.label}</div>
                        <div className="text-[10px] text-slate-400">{perm.description}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {perm.admin ? (
                          <span className="inline-flex w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 items-center justify-center">
                            <Check className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="inline-flex w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 items-center justify-center">
                            <X className="w-3 h-3" />
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {perm.manager ? (
                          <span className="inline-flex w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 items-center justify-center">
                            <Check className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="inline-flex w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 items-center justify-center">
                            <X className="w-3 h-3" />
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {perm.user ? (
                          <span className="inline-flex w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 items-center justify-center">
                            <Check className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="inline-flex w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 items-center justify-center">
                            <X className="w-3 h-3" />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USER SHIFT MANAGEMENT */}
      {activeTab === 'shifts' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Shift System Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Morning Shift Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t.morningShift}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {lang === 'km' ? 'វេនការងារពេលព្រឹក' : 'Daytime Core Workforce Shift'}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase">
                  Standard
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'km' ? 'ម៉ោងចាប់ផ្តើម' : 'Start Time'}
                  </label>
                  <input
                    type="text"
                    disabled={isUserOnly}
                    value={shiftConfig.morningShift.startTime}
                    onChange={e =>
                      setShiftConfig(prev => ({
                        ...prev,
                        morningShift: { ...prev.morningShift, startTime: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'km' ? 'ម៉ោងបញ្ចប់' : 'End Time'}
                  </label>
                  <input
                    type="text"
                    disabled={isUserOnly}
                    value={shiftConfig.morningShift.endTime}
                    onChange={e =>
                      setShiftConfig(prev => ({
                        ...prev,
                        morningShift: { ...prev.morningShift, endTime: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>{lang === 'km' ? 'តម្រូវឱ្យចុះម៉ោងចូល និងចេញ' : 'Mandatory Check-in & Check-out'}</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Enforced
                </span>
              </div>
            </div>

            {/* Evening Shift Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t.eveningShift}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {lang === 'km' ? 'វេនការងារពេលរសៀល & យប់' : 'Evening Peak Hours Shift'}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-[10px] font-black uppercase">
                  Standard
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'km' ? 'ម៉ោងចាប់ផ្តើម' : 'Start Time'}
                  </label>
                  <input
                    type="text"
                    disabled={isUserOnly}
                    value={shiftConfig.eveningShift.startTime}
                    onChange={e =>
                      setShiftConfig(prev => ({
                        ...prev,
                        eveningShift: { ...prev.eveningShift, startTime: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'km' ? 'ម៉ោងបញ្ចប់' : 'End Time'}
                  </label>
                  <input
                    type="text"
                    disabled={isUserOnly}
                    value={shiftConfig.eveningShift.endTime}
                    onChange={e =>
                      setShiftConfig(prev => ({
                        ...prev,
                        eveningShift: { ...prev.eveningShift, endTime: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>{lang === 'km' ? 'តម្រូវឱ្យចុះម៉ោងចូល និងចេញ' : 'Mandatory Check-in & Check-out'}</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Enforced
                </span>
              </div>
            </div>
          </div>

          {/* Shift Automation & Grace Period Settings */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {lang === 'km' ? 'ប៉ារ៉ាម៉ែត្ររំលឹក និងសុពលភាព' : 'Shift Attendance Tracking Rules'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.gracePeriod} (Minutes)
                </label>
                <input
                  type="number"
                  disabled={isUserOnly}
                  value={shiftConfig.morningShift.gracePeriodMinutes}
                  onChange={e => {
                    const mins = Number(e.target.value) || 15;
                    setShiftConfig(prev => ({
                      ...prev,
                      morningShift: { ...prev.morningShift, gracePeriodMinutes: mins },
                      eveningShift: { ...prev.eveningShift, gracePeriodMinutes: mins }
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {lang === 'km'
                    ? 'រយៈពេលយោគយល់មុនពេលចាត់ទុកថា "យឺត" (Late)'
                    : 'Minutes allowed before punch is flagged as Late'}
                </p>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{t.autoReminders}</h4>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'km'
                      ? 'ផ្ញើការរំលឹកតាម Telegram មុនម៉ោងចាប់ផ្តើមវេន'
                      : 'Send Telegram alert 15 mins before shift start'}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isUserOnly}
                  onClick={() =>
                    setShiftConfig(prev => ({ ...prev, autoReminders: !prev.autoReminders }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    shiftConfig.autoReminders ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      shiftConfig.autoReminders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {!isUserOnly && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveShifts}
                  disabled={savingShifts}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                >
                  {savingShifts ? 'Saving...' : lang === 'km' ? 'រក្សាទុកការកំណត់វេន' : 'Save Shift Configuration'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PROJECT & TASK SETTINGS */}
      {activeTab === 'projects' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {lang === 'km' ? 'ការគ្រប់គ្រងគម្រោង (Admin Project Capabilities)' : 'Admin Project Management'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'km'
                    ? 'បន្ថែម កែប្រែ ឬលុបគម្រោង និងកិច្ចការចេញពីប្រព័ន្ធ'
                    : 'Admins and managers can oversee all projects, assign plan owners, and delete tasks'}
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {appState.projects.map(proj => {
                const projTasks = appState.tasks.filter(t => t.projectId === proj.id);
                return (
                  <div key={proj.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {proj.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase">
                          {proj.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Client: {proj.client} · Budget: ${proj.budget.toLocaleString()} · Plan Owner: {proj.planOwnerName || 'Sarah Jenkins'} · {projTasks.length} tasks
                      </div>
                    </div>

                    {!isUserOnly && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(proj.id, proj.name)}
                          className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold border border-rose-200 dark:border-rose-900/60 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{lang === 'km' ? 'លុប' : 'Delete'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New User */}
      {isNewUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {lang === 'km' ? 'បន្ថែមអ្នកប្រើប្រាស់ថ្មី' : 'Add New Workforce User'}
                </h3>
              </div>
              <button
                onClick={() => setIsNewUserOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  placeholder="e.g. Visal Sok"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.phoneNumber}
                </label>
                <input
                  type="text"
                  required
                  value={newUserPhone}
                  onChange={e => setNewUserPhone(e.target.value)}
                  placeholder="+855 12 345 678"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  placeholder="visal@marketinglandmark.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'km' ? 'តួនាទី (Role)' : 'Role'}
                  </label>
                  <select
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="user">User</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.shiftAssigned}
                  </label>
                  <select
                    value={newUserShift}
                    onChange={e => setNewUserShift(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="morning">Morning Shift</option>
                    <option value="evening">Evening Shift</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.password}
                </label>
                <input
                  type="text"
                  required
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewUserOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
