import type { FirebaseApp } from 'firebase/app';

import {
  arrayRemove,
  arrayUnion,
  doc,
  updateDoc,
  type Firestore,
} from 'firebase/firestore';
import {
  deleteToken,
  getMessaging,
  getToken,
  isSupported as isFcmSupported,
} from 'firebase/messaging';

import type { PushMessagingOptions, PushPermissionState } from './models.js';

/**
 * Service to manage Web Push, browser notification permissions, FCM device tokens,
 * silent re-registration, and shared-device cleanup.
 */
export class PushMessagingService {
  /**
   * Checks whether the current browser environment supports Web Push and Firebase Cloud Messaging.
   */
  static async isSupported(): Promise<boolean> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return false;
    }
    try {
      return await isFcmSupported();
    } catch {
      return false;
    }
  }

  /**
   * Retrieves the current device's FCM registration token.
   */
  static async getCurrentToken(
    app: FirebaseApp,
    options: PushMessagingOptions,
  ): Promise<string | null> {
    if (!(await this.isSupported())) {
      return null;
    }

    try {
      const swPath = options.serviceWorkerPath || '/firebase-messaging-sw.js';
      const registration = await navigator.serviceWorker.register(swPath);
      const messaging = getMessaging(app);

      const token = await getToken(messaging, {
        vapidKey: options.vapidKey,
        serviceWorkerRegistration: registration,
      });

      return token || null;
    } catch (err) {
      console.warn('[PushMessagingService] Failed to get FCM token:', err);
      return null;
    }
  }

  /**
   * Checks whether *this specific device* is currently registered on the user's profile.
   * Compares the live token against Firestore rather than trusting stale local storage.
   */
  static async isDeviceTokenRegistered(
    app: FirebaseApp,
    registeredTokens: string[] | undefined,
    options: PushMessagingOptions,
  ): Promise<boolean> {
    if (!registeredTokens || registeredTokens.length === 0) {
      return false;
    }
    const token = await this.getCurrentToken(app, options);
    return token !== null && registeredTokens.includes(token);
  }

  /**
   * Requests browser notification permission and, once granted, saves the device's FCM token
   * to the user's document in Firestore.
   */
  static async requestPermission(
    app: FirebaseApp,
    db: Firestore,
    uid: string,
    options: PushMessagingOptions,
  ): Promise<PushPermissionState> {
    if (!(await this.isSupported())) {
      return 'unsupported';
    }

    let permission: NotificationPermission;
    try {
      permission = await Notification.requestPermission();
    } catch {
      return 'denied';
    }

    if (permission !== 'granted') {
      return 'denied';
    }

    const token = await this.getCurrentToken(app, options);
    if (!token) {
      return 'unsupported';
    }

    const userCol = options.userCollection || 'users';
    const tokenField = options.tokenField || 'fcmTokens';

    try {
      const userRef = doc(db, userCol, uid);
      await updateDoc(userRef, {
        [tokenField]: arrayUnion(token),
      });
      return 'enabled';
    } catch (err) {
      console.warn('[PushMessagingService] Failed to persist FCM token:', err);
      return 'enabled';
    }
  }

  /**
   * If browser notification permission is already granted (e.g. pre-configured enterprise
   * policy or granted previously), ensures this device's token is registered on the user's profile.
   */
  static async ensureDeviceTokenRegistered(
    app: FirebaseApp,
    db: Firestore,
    uid: string,
    registeredTokens: string[] | undefined,
    options: PushMessagingOptions,
  ): Promise<boolean> {
    if (
      typeof Notification === 'undefined' ||
      Notification.permission !== 'granted'
    ) {
      return false;
    }
    if (!(await this.isSupported())) {
      return false;
    }

    const alreadyRegistered = await this.isDeviceTokenRegistered(
      app,
      registeredTokens,
      options,
    );
    if (alreadyRegistered) {
      return true;
    }

    const token = await this.getCurrentToken(app, options);
    if (!token) {
      return false;
    }

    const userCol = options.userCollection || 'users';
    const tokenField = options.tokenField || 'fcmTokens';

    try {
      const userRef = doc(db, userCol, uid);
      await updateDoc(userRef, {
        [tokenField]: arrayUnion(token),
      });
      return true;
    } catch (err) {
      console.warn(
        '[PushMessagingService] ensureDeviceTokenRegistered error:',
        err,
      );
      return false;
    }
  }

  /**
   * Removes this device's token from the user profile in Firestore and deletes the FCM token.
   */
  static async disablePush(
    app: FirebaseApp,
    db: Firestore,
    uid: string,
    options: PushMessagingOptions,
  ): Promise<void> {
    const token = await this.getCurrentToken(app, options);
    if (!token) {
      return;
    }

    const userCol = options.userCollection || 'users';
    const tokenField = options.tokenField || 'fcmTokens';

    try {
      const userRef = doc(db, userCol, uid);
      await updateDoc(userRef, {
        [tokenField]: arrayRemove(token),
      });
    } catch (err) {
      console.warn(
        '[PushMessagingService] Failed to remove token from Firestore:',
        err,
      );
    }

    try {
      const messaging = getMessaging(app);
      await deleteToken(messaging);
    } catch (err) {
      console.warn('[PushMessagingService] Failed to delete FCM token:', err);
    }
  }

  /**
   * Best-effort cleanup for sign-out on a shared or borrowed workstation.
   * Removes this device's token without prompting for permission.
   */
  static async forgetOnSignOut(
    app: FirebaseApp,
    db: Firestore,
    uid: string,
    options: PushMessagingOptions,
  ): Promise<void> {
    if (
      typeof Notification === 'undefined' ||
      Notification.permission !== 'granted'
    ) {
      return;
    }

    try {
      await this.disablePush(app, db, uid, options);
    } catch {
      // Best-effort cleanup should not block sign-out
    }
  }

  /**
   * Triggers a local browser/desktop notification.
   */
  static showLocalNotification(
    title: string,
    options?: NotificationOptions,
  ): boolean {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    if (Notification.permission !== 'granted') {
      return false;
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((reg) => {
          reg.showNotification(title, options);
        })
        .catch(() => {
          try {
            new Notification(title, options);
          } catch {}
        });
      return true;
    }

    try {
      new Notification(title, options);
      return true;
    } catch {
      return false;
    }
  }
}
