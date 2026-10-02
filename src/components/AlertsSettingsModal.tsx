import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  CheckCircle2,
  AlertCircle,
  X,
  Smartphone,
  Shield,
  Download,
  KeyRound,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { Language } from '../types';
import {
  getTelegramConfig,
  saveTelegramConfig,
  getWebPushPermission,
  requestWebPushPermission,
  sendWebPushNotification,
  sendTelegramAlert,
  TelegramConfig
} from '../utils/notifications';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AlertsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const AlertsSettingsModal: React.FC<AlertsSettingsModalProps> = ({
  isOpen,
  onClose,
  lang = 'en'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'webpush' | 'telegram' | 'pwa'>('webpush');
  const [webPushPerm, setWebPushPerm] = useState<NotificationPermission>('default');
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(getTelegramConfig());
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [testingTelegram, setTestingTelegram] = useState(false);

  const { isInstallable, isInstalled, install } = usePWAInstall();

  useEffect(() => {
    if (isOpen) {
      setWebPushPerm(getWebPushPermission());
      setTelegramConfig(getTelegramConfig());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showNotice = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleRequestWebPush = async () => {
    const res = await requestWebPushPermission();
    setWebPushPerm(res);
    if (res === 'granted') {
      showNotice('success', 'Web Push notifications are now enabled!');
      sendWebPushNotification('Marketing Landmark', {
        body: 'Push notifications are successfully active for shift and workforce updates.'
      });
    } else {
      showNotice('error', 'Notification permission was denied or closed.');
    }
  };

  const handleTestWebPush = async () => {
    const success = await sendWebPushNotification('Workforce Alert (Test)', {
      body: 'Clock-in punch recorded at Marketing Landmark HQ (100% on time).',
      tag: 'test_alert'
    });
    if (success) {
      showNotice('success', 'Native push notification sent to your device!');
    } else {
      showNotice('error', 'Please enable notification permissions first.');
    }
  };

  const handleSaveTelegram = (e: React.FormEvent) => {
    e.preventDefault();
    saveTelegramConfig(telegramConfig);
    showNotice('success', 'Telegram configuration saved successfully!');
  };

  const handleTestTelegram = async () => {
    if (!telegramConfig.botToken || !telegramConfig.chatId) {
      showNotice('error', 'Please enter your Telegram Bot Token and Chat ID first.');
      return;
    }
    setTestingTelegram(true);
    const timeStr = new Date().toLocaleTimeString();
    const testMsg = `🔔 <b>Marketing Landmark Alert</b>\n\n✅ <b>Test Notification</b> sent at <i>${timeStr}</i>.\nWorkforce system is connected successfully!`;
    const res = await sendTelegramAlert(testMsg, telegramConfig);
    setTestingTelegram(false);

    if (res.success) {
      showNotice('success', 'Test message sent to Telegram successfully! Check your chat.');
    } else {
      showNotice('error', res.error || 'Failed to send Telegram message.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {lang === 'km' ? 'ការកំណត់ការជូនដំណឹង & Telegram' : 'Alerts, WebPush & Telegram'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'km' ? 'គ្រប់គ្រងការជូនដំណឹង Push និង Telegram Bot' : 'Configure instant alerts & mobile integrations'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div className={`mb-4 p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Sub-tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-5 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('webpush')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'webpush'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Web Push</span>
          </button>

          <button
            onClick={() => setActiveSubTab('telegram')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'telegram'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
            <span>Telegram Bot</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pwa')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'pwa'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
            <span>PWA App</span>
          </button>
        </div>

        {/* TAB 1: WEB PUSH */}
        {activeSubTab === 'webpush' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Browser Push Permission
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Status: <span className="font-bold text-slate-600 dark:text-slate-300 uppercase">{webPushPerm}</span>
                </div>
              </div>

              {webPushPerm === 'granted' ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Enabled</span>
                </span>
              ) : (
                <button
                  onClick={handleRequestWebPush}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs active:scale-95"
                >
                  Enable Push
                </button>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs">
              <h4 className="font-bold text-blue-950 dark:text-blue-300 mb-1">
                Automated Push Notifications:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                <li>Shift start & clock-in reminders</li>
                <li>Clock-out verification with daily hours logged</li>
                <li>Leave request approvals / rejections</li>
                <li>Admin broadcast notices</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleTestWebPush}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Send Test Web Push Notification</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: TELEGRAM BOT */}
        {activeSubTab === 'telegram' && (
          <form onSubmit={handleSaveTelegram} className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 text-[11px] text-sky-900 dark:text-sky-300">
              <div className="font-bold flex items-center gap-1.5 mb-0.5">
                <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                <span>Real-Time Telegram Alerts Integration</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                Create a bot in Telegram via <b>@BotFather</b> and obtain your <b>Chat ID</b> via <b>@userinfobot</b>. All workforce events will be alerted to your Telegram chat or group in real-time.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Enable Telegram Notifications
              </span>
              <input
                type="checkbox"
                checked={telegramConfig.enabled}
                onChange={e => setTelegramConfig({ ...telegramConfig, enabled: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Telegram Bot Token
              </label>
              <input
                type="text"
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                value={telegramConfig.botToken}
                onChange={e => setTelegramConfig({ ...telegramConfig, botToken: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Telegram Chat ID or Group ID
              </label>
              <input
                type="text"
                placeholder="e.g. 987654321 or -100123456789"
                value={telegramConfig.chatId}
                onChange={e => setTelegramConfig({ ...telegramConfig, chatId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <label className="flex items-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={telegramConfig.notifyOnClockInOut}
                  onChange={e => setTelegramConfig({ ...telegramConfig, notifyOnClockInOut: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span className="text-slate-700 dark:text-slate-300">Clock In / Out</span>
              </label>
              <label className="flex items-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={telegramConfig.notifyOnLeaveRequest}
                  onChange={e => setTelegramConfig({ ...telegramConfig, notifyOnLeaveRequest: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span className="text-slate-700 dark:text-slate-300">Leave Requests</span>
              </label>
              <label className="flex items-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={telegramConfig.notifyOnDealWon}
                  onChange={e => setTelegramConfig({ ...telegramConfig, notifyOnDealWon: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span className="text-slate-700 dark:text-slate-300">Sales Deals Won</span>
              </label>
              <label className="flex items-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={telegramConfig.notifyOnBroadcast}
                  onChange={e => setTelegramConfig({ ...telegramConfig, notifyOnBroadcast: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span className="text-slate-700 dark:text-slate-300">Broadcast Alerts</span>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleTestTelegram}
                disabled={testingTelegram}
                className="flex-1 py-2 rounded-xl border border-sky-300 dark:border-sky-800 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testingTelegram ? 'Sending...' : 'Test Telegram Alert'}</span>
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/25 active:scale-95"
              >
                Save Config
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: PWA APP INSTALL */}
        {activeSubTab === 'pwa' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-base shrink-0 shadow-md">
                ML
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-indigo-950 dark:text-indigo-300">
                  Marketing Landmark - Workforce PWA
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Installable Progressive Web App with offline support, automatic service worker caching, and home-screen app icon.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>Display Mode:</span>
                <span className="font-bold text-slate-900 dark:text-white">Standalone (Native feel)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>App Icon Resolutions:</span>
                <span className="font-bold text-slate-900 dark:text-white">192x192 & 512x512 Maskable</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>Offline Caching:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Active (Service Worker)</span>
              </div>
            </div>

            {isInstalled ? (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>You are currently running the installed standalone PWA app!</span>
              </div>
            ) : isInstallable ? (
              <button
                onClick={install}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Install Application Now</span>
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                Tap the browser menu (⋮ in Chrome/Edge, or Share in Safari) and choose <b>"Install app"</b> or <b>"Add to Home Screen"</b> to install on your mobile device.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
