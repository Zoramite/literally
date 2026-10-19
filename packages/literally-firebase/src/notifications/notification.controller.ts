import type { FirebaseApp } from 'firebase/app';

import {
  deleteDoc,
  serverTimestamp,
  updateDoc,
  writeBatch,
  onSnapshot,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import { type ReactiveController, type ReactiveControllerHost } from 'lit';

import type {
  AppNotificationData,
  NewNotificationInput,
  NotificationControllerOptions,
  PushPermissionState,
} from './models.js';

import {
  createNotification,
  resolveNotificationDoc,
  resolveNotificationQuery,
} from './converters.js';
import { PushMessagingService } from './messaging.js';

/**
 * A Lit Reactive Controller that manages real-time Firestore notifications,
 * unread counters, in-tab arrival toasts, and Web Push device registration.
 *
 * @example
 * ```typescript
 * class NotificationBellElement extends LitElement {
 *   private notifCtrl = new NotificationController(this, {
 *     firestore: db,
 *     app,
 *     uid: () => auth.currentUser?.uid,
 *     push: { vapidKey: FCM_VAPID_KEY },
 *     onNotificationReceived: (notif) => {
 *       // Trigger butter-bar / toast
 *     },
 *   });
 *
 *   render() {
 *     return html`
 *       <button>
 *         Notifications (${this.notifCtrl.unreadCount})
 *       </button>
 *     `;
 *   }
 * }
 * ```
 */
export class NotificationController implements ReactiveController {
  protected host: ReactiveControllerHost;
  protected options: NotificationControllerOptions;
  protected unsubscribeFn?: Unsubscribe;
  protected isHostConnected = false;
  protected currentUid?: string | null;
  protected isInitialSnapshot = true;

  /**
   * List of recent notifications synchronized in real-time.
   */
  notifications: AppNotificationData[] = [];

  /**
   * Number of unread notifications in the current synced window.
   */
  unreadCount = 0;

  /**
   * Whether the controller is waiting for initial Firestore sync.
   */
  loading = true;

  /**
   * Web Push status for this device ('enabled', 'off', 'denied', or 'unsupported').
   */
  pushState: PushPermissionState = 'off';

  /**
   * Error that occurred during Firestore listener or push registration.
   */
  error?: Error = undefined;

  constructor(
    host: ReactiveControllerHost,
    options: NotificationControllerOptions = {},
  ) {
    this.host = host;
    this.options = options;
    this.currentUid = this.resolveUid();
    host.addController(this);
  }

  /**
   * Host connected to DOM lifecycle callback.
   */
  hostConnected() {
    this.isHostConnected = true;
    if (this.options.autoStart !== false) {
      this.subscribe();
    }
    this.checkPushStatus();
  }

  /**
   * Host disconnected from DOM lifecycle callback.
   */
  hostDisconnected() {
    this.isHostConnected = false;
    this.unsubscribe();
  }

  /**
   * Host update lifecycle hook: detects if the target user ID changed dynamically.
   */
  hostUpdate() {
    const newUid = this.resolveUid();
    if (newUid !== this.currentUid) {
      this.currentUid = newUid;
      if (this.isHostConnected && this.options.autoStart !== false) {
        this.subscribe();
        this.checkPushStatus();
      }
    }
  }

  /**
   * Subscribes to real-time notifications for the active user.
   */
  subscribe() {
    this.unsubscribe();
    const db = this.resolveFirestore();
    const uid = this.resolveUid();
    this.currentUid = uid;

    if (!db || !uid) {
      this.notifications = [];
      this.unreadCount = 0;
      this.loading = false;
      this.error = undefined;
      this.host.requestUpdate();
      return;
    }

    this.loading = true;
    this.error = undefined;
    this.isInitialSnapshot = true;
    this.host.requestUpdate();

    try {
      const q = resolveNotificationQuery(db, uid, {
        strategy: this.options.strategy,
        limitCount: this.options.limit,
      });

      this.unsubscribeFn = onSnapshot(
        q,
        (snapshot) => {
          if (!this.isInitialSnapshot) {
            for (const change of snapshot.docChanges()) {
              if (change.type === 'added') {
                const item = change.doc.data();
                this.options.onNotificationReceived?.(item);

                // Show local browser notification if tab is hidden/backgrounded
                if (
                  typeof document !== 'undefined' &&
                  document.hidden &&
                  typeof Notification !== 'undefined' &&
                  Notification.permission === 'granted'
                ) {
                  PushMessagingService.showLocalNotification(item.title, {
                    body: item.body,
                    tag: item.identifier ?? item.id,
                  });
                }
              }
            }
          }

          this.isInitialSnapshot = false;
          this.notifications = snapshot.docs.map((docSnap) => docSnap.data());
          this.unreadCount = this.notifications.filter(
            (n) => !n.readAt && !n.read,
          ).length;
          this.loading = false;
          this.host.requestUpdate();
        },
        (err) => {
          this.error = err;
          this.loading = false;
          this.options.onError?.(err);
          this.host.requestUpdate();
        },
      );
    } catch (err) {
      this.error = err as Error;
      this.loading = false;
      this.options.onError?.(this.error);
      this.host.requestUpdate();
    }
  }

  /**
   * Unsubscribes from active Firestore snapshot listener.
   */
  unsubscribe() {
    if (this.unsubscribeFn) {
      this.unsubscribeFn();
      this.unsubscribeFn = undefined;
    }
  }

  /**
   * Manually refreshes both notifications and push status.
   */
  refresh() {
    this.subscribe();
    this.checkPushStatus();
  }

  /**
   * Marks a specific notification as read in Firestore.
   */
  async markAsRead(notificationId: string): Promise<void> {
    const db = this.resolveFirestore();
    const uid = this.resolveUid();
    if (!db || !uid || !notificationId) return;

    try {
      const docRef = resolveNotificationDoc(
        db,
        uid,
        notificationId,
        this.options.strategy,
      );
      await updateDoc(docRef, {
        readAt: serverTimestamp(),
        read: true,
      });
    } catch (err) {
      this.error = err as Error;
      this.options.onError?.(this.error);
      this.host.requestUpdate();
    }
  }

  /**
   * Marks all currently loaded unread notifications as read.
   */
  async markAllAsRead(): Promise<void> {
    const db = this.resolveFirestore();
    const uid = this.resolveUid();
    if (!db || !uid) return;

    const unread = this.notifications.filter((n) => !n.readAt && !n.read);
    if (unread.length === 0) return;

    try {
      const batch = writeBatch(db);
      for (const item of unread) {
        const docRef = resolveNotificationDoc(
          db,
          uid,
          item.id,
          this.options.strategy,
        );
        batch.update(docRef, {
          readAt: serverTimestamp(),
          read: true,
        });
      }
      await batch.commit();
    } catch (err) {
      this.error = err as Error;
      this.options.onError?.(this.error);
      this.host.requestUpdate();
    }
  }

  /**
   * Completely removes a notification from Firestore.
   */
  async deleteNotification(notificationId: string): Promise<void> {
    const db = this.resolveFirestore();
    const uid = this.resolveUid();
    if (!db || !uid || !notificationId) return;

    try {
      const docRef = resolveNotificationDoc(
        db,
        uid,
        notificationId,
        this.options.strategy,
      );
      await deleteDoc(docRef);
    } catch (err) {
      this.error = err as Error;
      this.options.onError?.(this.error);
      this.host.requestUpdate();
    }
  }

  /**
   * Removes all currently loaded notifications for this user.
   */
  async clearAllNotifications(): Promise<void> {
    const db = this.resolveFirestore();
    const uid = this.resolveUid();
    if (!db || !uid || this.notifications.length === 0) return;

    try {
      const batch = writeBatch(db);
      for (const item of this.notifications) {
        const docRef = resolveNotificationDoc(
          db,
          uid,
          item.id,
          this.options.strategy,
        );
        batch.delete(docRef);
      }
      await batch.commit();
    } catch (err) {
      this.error = err as Error;
      this.options.onError?.(this.error);
      this.host.requestUpdate();
    }
  }

  /**
   * Creates a new notification for this user in Firestore.
   *
   * @param input Notification input payload.
   * @returns Generated notification document ID, or undefined on failure.
   */
  async createNotification(
    input: NewNotificationInput,
  ): Promise<string | undefined> {
    const db = this.resolveFirestore();
    const uid = this.resolveUid();
    if (!db || !uid) return undefined;

    try {
      return await createNotification(db, uid, input, this.options.strategy);
    } catch (err) {
      this.error = err as Error;
      this.options.onError?.(this.error);
      this.host.requestUpdate();
      return undefined;
    }
  }

  /**
   * Checks the active device's push permission and token registration status.
   */
  async checkPushStatus(): Promise<PushPermissionState> {
    if (!this.options.push) {
      this.pushState = 'unsupported';
      this.host.requestUpdate();
      return 'unsupported';
    }

    const app = this.resolveApp();
    const uid = this.resolveUid();

    if (!app || !uid || typeof Notification === 'undefined') {
      this.pushState = 'unsupported';
      this.host.requestUpdate();
      return 'unsupported';
    }

    if (Notification.permission === 'denied') {
      this.pushState = 'denied';
      this.host.requestUpdate();
      return 'denied';
    }

    if (Notification.permission !== 'granted') {
      this.pushState = 'off';
      this.host.requestUpdate();
      return 'off';
    }

    // Browser permission is granted - check if device token is registered
    const registeredTokens = this.resolveRegisteredTokens();
    const isRegistered = await PushMessagingService.isDeviceTokenRegistered(
      app,
      registeredTokens,
      this.options.push,
    );

    this.pushState = isRegistered ? 'enabled' : 'off';

    // Auto-register token if browser permission is already granted (e.g. Chromebooks/PWAs)
    if (!isRegistered) {
      const db = this.resolveFirestore();
      if (db) {
        PushMessagingService.ensureDeviceTokenRegistered(
          app,
          db,
          uid,
          registeredTokens,
          this.options.push,
        ).then((registered) => {
          if (registered) {
            this.pushState = 'enabled';
            this.host.requestUpdate();
          }
        });
      }
    }

    this.host.requestUpdate();
    return this.pushState;
  }

  /**
   * Toggles Web Push notifications on or off for this device.
   */
  async togglePush(): Promise<PushPermissionState> {
    if (!this.options.push) {
      return 'unsupported';
    }

    const app = this.resolveApp();
    const db = this.resolveFirestore();
    const uid = this.resolveUid();

    if (!app || !db || !uid) {
      return 'unsupported';
    }

    if (this.pushState === 'enabled') {
      await PushMessagingService.disablePush(app, db, uid, this.options.push);
      this.pushState = 'off';
      this.host.requestUpdate();
      return 'off';
    }

    if (this.pushState === 'denied') {
      return 'denied';
    }

    const state = await PushMessagingService.requestPermission(
      app,
      db,
      uid,
      this.options.push,
    );
    this.pushState = state;
    this.host.requestUpdate();
    return state;
  }

  protected resolveFirestore(): Firestore | null {
    if (typeof this.options.firestore === 'function') {
      return this.options.firestore() ?? null;
    }
    return this.options.firestore ?? null;
  }

  protected resolveApp(): FirebaseApp | null {
    if (typeof this.options.app === 'function') {
      return this.options.app() ?? null;
    }
    return this.options.app ?? null;
  }

  protected resolveUid(): string | null {
    if (typeof this.options.uid === 'function') {
      return this.options.uid() ?? null;
    }
    return this.options.uid ?? null;
  }

  protected resolveRegisteredTokens(): string[] | undefined {
    if (typeof this.options.registeredTokens === 'function') {
      return this.options.registeredTokens();
    }
    return this.options.registeredTokens;
  }
}
