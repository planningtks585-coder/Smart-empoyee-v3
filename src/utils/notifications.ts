// WebPush Notification & Telegram Alert Utility

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
  notifyOnClockInOut: boolean;
  notifyOnLeaveRequest: boolean;
  notifyOnDealWon: boolean;
  notifyOnBroadcast: boolean;
}

const DEFAULT_TELEGRAM_CONFIG: TelegramConfig = {
  // Pre-configured default demo token or user custom token
  botToken: '',
  chatId: '',
  enabled: false,
  notifyOnClockInOut: true,
  notifyOnLeaveRequest: true,
  notifyOnDealWon: true,
  notifyOnBroadcast: true
};

export function getTelegramConfig(): TelegramConfig {
  try {
    const raw = localStorage.getItem('ml_telegram_config');
    if (raw) return { ...DEFAULT_TELEGRAM_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error reading telegram config:', e);
  }
  return DEFAULT_TELEGRAM_CONFIG;
}

export function saveTelegramConfig(config: TelegramConfig): void {
  try {
    localStorage.setItem('ml_telegram_config', JSON.stringify(config));
  } catch (e) {
    console.error('Error saving telegram config:', e);
  }
}

// Check browser notification permission
export function getWebPushPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

// Request WebPush permission
export async function requestWebPushPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.error('Error requesting notification permission:', e);
    return 'denied';
  }
}

// Trigger a Web Push Notification
export async function sendWebPushNotification(title: string, options?: NotificationOptions): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    if (Notification.permission === 'granted') {
      // If service worker registration is available, prefer registration.showNotification
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg && reg.showNotification) {
          await reg.showNotification(title, {
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            ...options
          });
          return true;
        }
      }
      new Notification(title, {
        icon: '/pwa-192x192.png',
        ...options
      });
      return true;
    }
  } catch (e) {
    console.error('Failed to trigger web notification:', e);
  }
  return false;
}

// Send Real-Time Alert to Telegram Bot
export async function sendTelegramAlert(
  text: string,
  overrideConfig?: Partial<TelegramConfig>
): Promise<{ success: boolean; error?: string }> {
  const cfg = { ...getTelegramConfig(), ...overrideConfig };
  
  if (!cfg.botToken || !cfg.chatId) {
    return {
      success: false,
      error: 'Telegram Bot Token or Chat ID not configured. Please open Alerts Settings to set it up.'
    };
  }

  const cleanToken = cfg.botToken.trim();
  const cleanChatId = cfg.chatId.trim();

  try {
    const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text,
        parse_mode: 'HTML'
      })
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { success: false, error: data.description || 'Telegram API error' };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Telegram send alert error:', err);
    return { success: false, error: err.message || 'Network error reaching Telegram API' };
  }
}
