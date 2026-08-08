/**
 * Web Push Notification Utility for QuickHandy PWA
 * Manages permission requests, subscription generation, and Service Worker push registration.
 */

// Example VAPID Public Key (Replace with your server's VAPID Public Key in production)
const PUBLIC_VAPID_KEY = "BEl62iUYgUivxIkv69yViEuiBIa40yYw0yYw0yYw0yYw0yYw0yYw0yYw0yYw0yYw0yYw0yYw";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('[PWA Push] This browser does not support desktop notifications.');
    return false;
  }

  const permission = await Notification.requestPermission();
  console.log(`[PWA Push] Notification permission state: ${permission}`);
  return permission === 'granted';
}

export async function subscribeUserToPush() {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[PWA Push] Push messaging is not supported in this environment.');
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(PUBLIC_VAPID_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });
      console.log('[PWA Push] User successfully subscribed to push notifications:', subscription);
    }

    // Send subscription object to your backend endpoint (e.g., /api/admin/push-subscription)
    /*
    await fetch('/api/admin/push-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });
    */

    return subscription;
  } catch (error) {
    console.error('[PWA Push] Error subscribing to push notifications:', error);
    return null;
  }
}
