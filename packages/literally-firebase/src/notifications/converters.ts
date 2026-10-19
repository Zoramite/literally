import {
  collection,
  doc,
  limit,
  orderBy,
  query,
  setDoc,
  where,
  Timestamp,
  type CollectionReference,
  type DocumentData,
  type DocumentReference,
  type Firestore,
  type FirestoreDataConverter,
  type Query,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
} from 'firebase/firestore';

import type {
  AppNotificationData,
  NewNotificationInput,
  NotificationStorageStrategy,
} from './models.js';

import { cleanFirestoreData } from '../firestore/clean.js';
import { toTimestamp } from '../firestore/date.js';

/**
 * Standard FirestoreDataConverter for AppNotificationData documents.
 * Ensures clean data writes with zero undefined properties and consistent Timestamps.
 */
export const notificationConverter: FirestoreDataConverter<AppNotificationData> =
  {
    toFirestore(model: AppNotificationData): DocumentData {
      const createdAt = toTimestamp(model.createdAt) ?? Timestamp.now();
      const readAt = model.readAt ? toTimestamp(model.readAt) : null;
      const isRead = Boolean(model.read || readAt !== null);

      const raw = {
        type: model.type || 'general',
        title: model.title || '',
        body: model.body || '',
        link: model.link ?? null,
        path: model.path ?? null,
        identifier: model.identifier ?? null,
        collapseKey: model.collapseKey ?? null,
        recipientId: model.recipientId ?? model.userId ?? null,
        createdAt,
        readAt,
        read: isRead,
        data: model.data ?? null,
      };

      return cleanFirestoreData(raw, { replaceUndefinedWithNull: true });
    },

    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options?: SnapshotOptions,
    ): AppNotificationData {
      const data = snapshot.data(options);
      const createdAt =
        toTimestamp(data.createdAt) ??
        (data.createdAt instanceof Timestamp
          ? data.createdAt
          : Timestamp.now());
      const readAt = data.readAt ? toTimestamp(data.readAt) : null;
      const isRead = Boolean(data.read || readAt !== null);

      return {
        id: snapshot.id,
        recipientId: data.recipientId ?? data.userId ?? undefined,
        userId: data.userId ?? data.recipientId ?? undefined,
        type: data.type || 'general',
        title: data.title || '',
        body: data.body || '',
        path: data.path ?? null,
        link: data.link ?? null,
        identifier: data.identifier ?? null,
        collapseKey: data.collapseKey ?? null,
        createdAt,
        readAt,
        read: isRead,
        data: data.data ?? undefined,
      };
    },
  };

/**
 * Resolves the Firestore CollectionReference for notifications based on the storage strategy.
 */
export function resolveNotificationCollection(
  db: Firestore,
  uid: string,
  strategy?: NotificationStorageStrategy,
): CollectionReference<AppNotificationData> {
  if (strategy?.type === 'root') {
    const colName = strategy.collectionName || 'notifications';
    return collection(db, colName).withConverter(notificationConverter);
  }

  const parentCol = strategy?.parentCollection || 'users';
  const subCol = strategy?.subcollectionName || 'notifications';
  return collection(db, parentCol, uid, subCol).withConverter(
    notificationConverter,
  );
}

/**
 * Resolves a specific notification DocumentReference based on the storage strategy.
 */
export function resolveNotificationDoc(
  db: Firestore,
  uid: string,
  notificationId: string,
  strategy?: NotificationStorageStrategy,
): DocumentReference<AppNotificationData> {
  if (strategy?.type === 'root') {
    const colName = strategy.collectionName || 'notifications';
    return doc(db, colName, notificationId).withConverter(
      notificationConverter,
    );
  }

  const parentCol = strategy?.parentCollection || 'users';
  const subCol = strategy?.subcollectionName || 'notifications';
  return doc(db, parentCol, uid, subCol, notificationId).withConverter(
    notificationConverter,
  );
}

/**
 * Resolves the real-time query for a user's notifications.
 */
export function resolveNotificationQuery(
  db: Firestore,
  uid: string,
  options?: {
    strategy?: NotificationStorageStrategy;
    limitCount?: number;
  },
): Query<AppNotificationData> {
  const colRef = resolveNotificationCollection(db, uid, options?.strategy);
  const maxLimit = options?.limitCount ?? 30;

  if (options?.strategy?.type === 'root') {
    const recipientField = options.strategy.recipientField || 'recipientId';
    return query(
      colRef,
      where(recipientField, '==', uid),
      orderBy('createdAt', 'desc'),
      limit(maxLimit),
    );
  }

  return query(colRef, orderBy('createdAt', 'desc'), limit(maxLimit));
}

/**
 * Creates a new in-app notification document in Firestore.
 *
 * @param db Firestore instance.
 * @param uid User ID recipient.
 * @param input Notification payload without id.
 * @param strategy Optional storage strategy (subcollection vs root).
 * @returns The generated notification ID.
 */
export async function createNotification(
  db: Firestore,
  uid: string,
  input: NewNotificationInput,
  strategy?: NotificationStorageStrategy,
): Promise<string> {
  const colRef = resolveNotificationCollection(db, uid, strategy);
  const docRef = doc(colRef);
  const id = docRef.id;
  const createdAt = toTimestamp(input.createdAt) ?? Timestamp.now();
  const readAt = input.readAt ? toTimestamp(input.readAt) : null;
  const isRead = Boolean(input.read || readAt !== null);

  const item: AppNotificationData = {
    ...input,
    id,
    recipientId: input.recipientId ?? uid,
    createdAt,
    readAt,
    read: isRead,
  };

  await setDoc(docRef, item);
  return id;
}
