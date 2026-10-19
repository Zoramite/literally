import { Timestamp } from 'firebase/firestore';
import { describe, expect, test, vi } from 'vitest';

import type { AppNotificationData } from './models.js';

import {
  createNotification,
  notificationConverter,
  resolveNotificationCollection,
  resolveNotificationDoc,
  resolveNotificationQuery,
} from './converters.js';

const mocks = vi.hoisted(() => ({
  mockSetDoc: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/firestore')>();
  return {
    ...actual,
    collection: vi.fn((_db: any, ...paths: string[]) => ({
      type: 'collection',
      path: paths.join('/'),
      withConverter: vi.fn().mockReturnThis(),
    })),
    doc: vi.fn((_db: any, ...paths: string[]) => ({
      type: 'document',
      id: 'mock-doc-id-123',
      path: paths.join('/'),
      withConverter: vi.fn().mockReturnThis(),
    })),
    setDoc: mocks.mockSetDoc,
    query: vi.fn((col: any, ...constraints: any[]) => ({
      type: 'query',
      col,
      constraints,
    })),
    where: vi.fn((field: string, op: string, val: any) => ({ field, op, val })),
    orderBy: vi.fn((field: string, dir: string) => ({ field, dir })),
    limit: vi.fn((count: number) => ({ count })),
  };
});

describe('notificationConverter', () => {
  const createMockSnapshot = (id: string, data: any) => ({
    id,
    data: () => data,
    exists: () => true,
    get: (field: string) => data[field],
  });

  test('converts toFirestore safely without undefined properties', () => {
    const item: AppNotificationData = {
      id: 'notif-1',
      recipientId: 'user-abc',
      type: 'test_alert',
      title: 'New Message',
      body: 'You have received a new update.',
      path: '/messages/1',
      link: undefined,
      identifier: 'msg-101',
      collapseKey: undefined,
      createdAt: new Date('2026-06-01T12:00:00Z'),
      readAt: null,
      read: false,
    };

    const docData = notificationConverter.toFirestore(item);

    expect(docData.type).toBe('test_alert');
    expect(docData.title).toBe('New Message');
    expect(docData.body).toBe('You have received a new update.');
    expect(docData.path).toBe('/messages/1');
    expect(docData.link).toBeNull();
    expect(docData.identifier).toBe('msg-101');
    expect(docData.collapseKey).toBeNull();
    expect(docData.recipientId).toBe('user-abc');
    expect(docData.createdAt).toBeInstanceOf(Timestamp);
    expect(docData.createdAt.toMillis()).toBe(
      new Date('2026-06-01T12:00:00Z').getTime(),
    );
    expect(docData.readAt).toBeNull();
    expect(docData.read).toBe(false);

    // Verify no keys have undefined values
    for (const [key, value] of Object.entries(docData)) {
      expect(value, `key ${key} should not be undefined`).not.toBeUndefined();
    }
  });

  test('derives read=true when readAt is populated', () => {
    const item: AppNotificationData = {
      id: 'notif-2',
      type: 'general',
      title: 'Read notification',
      body: 'Already reviewed.',
      createdAt: new Date(),
      readAt: new Date(),
      read: false, // will be derived as true
    };

    const docData = notificationConverter.toFirestore(item);
    expect(docData.read).toBe(true);
    expect(docData.readAt).toBeInstanceOf(Timestamp);
  });

  test('converts fromFirestore by populating id and normalized fields', () => {
    const snap = createMockSnapshot('notif-3', {
      type: 'announcement',
      title: 'System Maintenance',
      body: 'Tonight at midnight.',
      link: 'https://status.example.com',
      path: null,
      identifier: 'maint-2026',
      recipientId: 'user-xyz',
      createdAt: Timestamp.fromDate(new Date('2026-10-15T08:00:00Z')),
      readAt: Timestamp.fromDate(new Date('2026-10-15T09:00:00Z')),
      read: true,
      data: { severity: 'high' },
    });

    const parsed = notificationConverter.fromFirestore(snap as any, {} as any);

    expect(parsed.id).toBe('notif-3');
    expect(parsed.type).toBe('announcement');
    expect(parsed.title).toBe('System Maintenance');
    expect(parsed.body).toBe('Tonight at midnight.');
    expect(parsed.link).toBe('https://status.example.com');
    expect(parsed.path).toBeNull();
    expect(parsed.identifier).toBe('maint-2026');
    expect(parsed.recipientId).toBe('user-xyz');
    expect(parsed.createdAt).toBeInstanceOf(Timestamp);
    expect(parsed.readAt).toBeInstanceOf(Timestamp);
    expect(parsed.read).toBe(true);
    expect(parsed.data).toEqual({ severity: 'high' });
  });

  test('resolves subcollection path by default', () => {
    const mockDb: any = { type: 'firestore' };
    const colRef: any = resolveNotificationCollection(mockDb, 'user-123');
    expect(colRef.path).toBe('users/user-123/notifications');

    const docRef: any = resolveNotificationDoc(mockDb, 'user-123', 'notif-99');
    expect(docRef.path).toBe('users/user-123/notifications/notif-99');

    const queryRef: any = resolveNotificationQuery(mockDb, 'user-123', {
      limitCount: 20,
    });
    expect(queryRef).toBeDefined();
    expect(queryRef.constraints).toHaveLength(2); // orderBy and limit
  });

  test('resolves root collection strategy correctly', () => {
    const mockDb: any = { type: 'firestore' };
    const strategy = {
      type: 'root' as const,
      collectionName: 'app_notifications',
      recipientField: 'targetUser',
    };

    const colRef: any = resolveNotificationCollection(
      mockDb,
      'user-123',
      strategy,
    );
    expect(colRef.path).toBe('app_notifications');

    const docRef: any = resolveNotificationDoc(
      mockDb,
      'user-123',
      'notif-99',
      strategy,
    );
    expect(docRef.path).toBe('app_notifications/notif-99');

    const queryRef: any = resolveNotificationQuery(mockDb, 'user-123', {
      strategy,
      limitCount: 50,
    });
    expect(queryRef).toBeDefined();
    expect(queryRef.constraints).toHaveLength(3); // where, orderBy, and limit
  });

  test('createNotification writes new notification document with generated id and createdAt', async () => {
    const mockDb: any = { type: 'firestore' };
    const notifId = await createNotification(mockDb, 'user-123', {
      title: 'Local Alert',
      body: 'Created locally.',
      type: 'test',
    });

    expect(notifId).toBe('mock-doc-id-123');
    expect(mocks.mockSetDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        id: 'mock-doc-id-123',
        recipientId: 'user-123',
        title: 'Local Alert',
        body: 'Created locally.',
        read: false,
      }),
    );
  });
});
