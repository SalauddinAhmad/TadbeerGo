// PWA Installation & Web Push Notification Service

export interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  notificationPermission: NotificationPermission;
}

let deferredPrompt: any = null;

// Listen for native install prompt (Android / Chrome / Desktop)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    window.dispatchEvent(new Event('pwa-installable'));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.dispatchEvent(new Event('pwa-installed'));
  });
}

export const isIOSDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

export const isStandaloneApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
};

export const canInstallPWA = (): boolean => {
  return !!deferredPrompt;
};

export const promptPWAInstall = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    return false;
  }
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return choice.outcome === 'accepted';
};

// =========================================================================
// PHONE PUSH NOTIFICATION HELPERS
// =========================================================================

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

export const requestPhoneNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) {
    alert('দুঃখিত, আপনার বর্তমান ব্রাউজারে নোটিফিকেশন সুবিধা সমর্থিত নয়।');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await sendPhoneNotification(
        'নোটিফিকেশন সক্রিয় হয়েছে! 🔔',
        'আসসালামু আলাইকুম শায়খ! আপনার ফোনে মোখতার আহমদ লাইফ প্রোর শিডিউল ও ওয়াক্ত নোটিফিকেশন সফলভাবে চালু করা হয়েছে।',
        '/'
      );
      return true;
    }
    return false;
  } catch (err) {
    console.error('Notification permission error:', err);
    return false;
  }
};

export const sendPhoneNotification = async (
  title: string,
  body: string,
  url: string = '/'
): Promise<void> => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return;
  }

  const options: any = {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url },
    tag: 'plm-alert-' + Date.now(),
  };

  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, options);
      return;
    } catch {
      // Fallback
    }
  }

  try {
    new Notification(title, options);
  } catch (err) {
    console.warn('Standard notification fallback failed:', err);
  }
};
