import type { FirebaseApp } from 'firebase/app';
import type { Firestore, Timestamp } from 'firebase/firestore';

/**
 * Core interface representing an in-app notification document in Firestore.
 */
export interface AppNotificationData {
  /**
   * Unique notification document ID.
   */
  id: string;

  /**
   * Recipient user ID. Required when using root collection strategy,
   * optional when stored in a subcollection under `users/{uid}`.
   */
  recipientId?: string;

  /**
   * Legacy/alternative recipient user ID field used in some schemas.
   */
  userId?: string;

  /**
   * Categorical type or tag for the notification (e.g., 'help_request', 'statement', 'announcement').
   */
  type: string;

  /**
   * Headline title of the notification.
   */
  title: string;

  /**
   * Body copy or message summary.
   */
  body: string;

  /**
   * Internal application path / route to navigate to when activated.
   */
  path?: string | null;

  /**
   * External web URL or link associated with the notification.
   */
  link?: string | null;

  /**
   * Arbitrary entity identifier (e.g. 'order-123', 'issue-456').
   * Used to group related notifications and cancel/clear them across users when resolved.
   */
  identifier?: string | null;

  /**
   * Collapse key used to group or replace active notifications on client platforms.
   */
  collapseKey?: string | null;

  /**
   * Creation timestamp.
   */
  createdAt: Timestamp | Date;

  /**
   * Read timestamp, or null/undefined if unread.
   */
  readAt?: Timestamp | Date | null;

  /**
   * Convenience boolean flag indicating whether the notification has been read.
   */
  read?: boolean;

  /**
   * Optional custom metadata payload.
   */
  data?: Record<string, any>;
}

/**
 * Type alias for AppNotificationData.
 */
export type AppNotification = AppNotificationData;

/**
 * Payload structure for creating a new notification (auto-generates id, createdAt, readAt).
 */
export type NewNotificationInput = Omit<
  AppNotificationData,
  'id' | 'createdAt' | 'readAt' | 'read'
> & {
  createdAt?: Timestamp | Date;
  readAt?: Timestamp | Date | null;
  read?: boolean;
};

/**
 * Storage strategy defining where user notifications are persisted in Firestore.
 */
export type NotificationStorageStrategy =
  | {
      /**
       * Subcollection strategy: `users/{uid}/notifications/{id}` (Canopy / Nebula standard).
       */
      type: 'subcollection';
      /**
       * Name of parent user collection. Default: `'users'`.
       */
      parentCollection?: string;
      /**
       * Name of child subcollection. Default: `'notifications'`.
       */
      subcollectionName?: string;
    }
  | {
      /**
       * Root collection strategy: `/notifications/{id}` (Legacy of Kin standard).
       */
      type: 'root';
      /**
       * Name of root collection. Default: `'notifications'`.
       */
      collectionName?: string;
      /**
       * Name of the recipient field in the doc (e.g. `'recipientId'` or `'userId'`). Default: `'recipientId'`.
       */
      recipientField?: string;
    };

/**
 * Web Push permission and registration status on the active device.
 */
export type PushPermissionState = 'enabled' | 'off' | 'denied' | 'unsupported';

/**
 * Options configuring Web Push and FCM token management.
 */
export interface PushMessagingOptions {
  /**
   * Firebase Cloud Messaging Web Push VAPID public key.
   */
  vapidKey: string;

  /**
   * Path to the messaging service worker. Default: `'/firebase-messaging-sw.js'`.
   */
  serviceWorkerPath?: string;

  /**
   * Parent collection for storing user profile docs with FCM tokens. Default: `'users'`.
   */
  userCollection?: string;

  /**
   * Field name on the user doc storing the string array of FCM tokens. Default: `'fcmTokens'`.
   */
  tokenField?: string;
}

/**
 * Options for configuring NotificationController.
 */
export interface NotificationControllerOptions {
  /**
   * Firestore database instance or dynamic getter.
   */
  firestore?: Firestore | (() => Firestore | null | undefined);

  /**
   * FirebaseApp instance (required for PushMessagingService).
   */
  app?: FirebaseApp | (() => FirebaseApp | null | undefined);

  /**
   * User ID whose notifications should be subscribed to.
   * Can be a string, null/undefined, or a dynamic getter.
   */
  uid?: string | null | (() => string | null | undefined);

  /**
   * Storage strategy for Firestore notifications.
   * Defaults to subcollection: `users/{uid}/notifications`.
   */
  strategy?: NotificationStorageStrategy;

  /**
   * Push messaging options. If provided, enables push permission controls and token registration.
   */
  push?: PushMessagingOptions;

  /**
   * Maximum number of recent notifications to retrieve in real-time. Default: `30`.
   */
  limit?: number;

  /**
   * Registered tokens array from the user profile doc, used for drift-free push state computation.
   */
  registeredTokens?: string[] | (() => string[] | undefined);

  /**
   * Callback invoked whenever a new notification arrives while the tab is active in the foreground.
   * Ideal for triggering butter-bar toasts or banners.
   */
  onNotificationReceived?: (notification: AppNotificationData) => void;

  /**
   * Callback invoked when a Firestore or messaging error occurs.
   */
  onError?: (error: Error) => void;

  /**
   * Whether to automatically subscribe to Firestore upon host connection. Default: `true`.
   */
  autoStart?: boolean;
}
