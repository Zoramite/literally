// @vitest-environment jsdom
import { defineCE, fixture } from '@open-wc/testing';
import { Timestamp } from 'firebase/firestore';
import { LitElement } from 'lit';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { NotificationController } from './notification.controller.js';

const mocks = vi.hoisted(() => ({
  mockUnsubscribe: vi.fn(),
  lastOnNext: undefined as ((snap: any) => void) | undefined,
  lastOnError: undefined as ((err: any) => void) | undefined,
  mockUpdateDoc: vi.fn(),
  mockDeleteDoc: vi.fn(),
  mockSetDoc: vi.fn(),
  mockBatchCommit: vi.fn(),
  mockBatchUpdate: vi.fn(),
  mockBatchDelete: vi.fn(),
  mockShowLocalNotification: vi.fn(),
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
      id: 'generated-id-77',
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
    onSnapshot: vi.fn((_query: any, ...args: any[]) => {
      mocks.lastOnNext = args[0];
      mocks.lastOnError = args[1];
      return mocks.mockUnsubscribe;
    }),
    updateDoc: mocks.mockUpdateDoc,
    deleteDoc: mocks.mockDeleteDoc,
    writeBatch: vi.fn(() => ({
      update: mocks.mockBatchUpdate,
      delete: mocks.mockBatchDelete,
      commit: mocks.mockBatchCommit,
    })),
    serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
  };
});

vi.mock('./messaging.js', () => ({
  PushMessagingService: {
    isSupported: vi.fn().mockResolvedValue(true),
    getCurrentToken: vi.fn().mockResolvedValue('token-123'),
    isDeviceTokenRegistered: vi.fn().mockResolvedValue(true),
    requestPermission: vi.fn().mockResolvedValue('enabled'),
    ensureDeviceTokenRegistered: vi.fn().mockResolvedValue(true),
    disablePush: vi.fn().mockResolvedValue(undefined),
    showLocalNotification: mocks.mockShowLocalNotification,
  },
}));

describe('NotificationController', () => {
  const mockDb: any = { type: 'firestore' };
  const mockApp: any = { name: 'test-app' };

  const createMockSnapshot = (
    items: any[],
    docChanges: Array<{
      type: 'added' | 'modified' | 'removed';
      doc: any;
    }> = [],
  ) => ({
    docs: items.map((item) => ({
      id: item.id,
      data: () => item,
    })),
    docChanges: () =>
      docChanges.length > 0
        ? docChanges
        : items.map((item) => ({
            type: 'added' as const,
            doc: { id: item.id, data: () => item },
          })),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockUnsubscribe = vi.fn();
    mocks.lastOnNext = undefined;
    mocks.lastOnError = undefined;
    mocks.mockUpdateDoc.mockResolvedValue(undefined);
    mocks.mockDeleteDoc.mockResolvedValue(undefined);
    mocks.mockBatchCommit.mockResolvedValue(undefined);

    (globalThis as any).Notification = {
      permission: 'granted',
    };
  });

  test('subscribes on hostConnected and loads initial notifications', async () => {
    const tagName = defineCE(
      class extends LitElement {
        ctrl = new NotificationController(this, {
          firestore: mockDb,
          app: mockApp,
          uid: 'user-1',
        });
      },
    );

    const el = await fixture<any>(`<${tagName}></${tagName}>`);
    const ctrl: NotificationController = el.ctrl;

    expect(ctrl.loading).toBe(true);

    // Simulate initial snapshot
    const initialItems = [
      {
        id: 'n1',
        title: 'Welcome',
        body: 'Hello',
        createdAt: Timestamp.now(),
        readAt: null,
        read: false,
      },
      {
        id: 'n2',
        title: 'Update',
        body: 'Version 2',
        createdAt: Timestamp.now(),
        readAt: Timestamp.now(),
        read: true,
      },
    ];

    mocks.lastOnNext!(createMockSnapshot(initialItems));

    expect(ctrl.loading).toBe(false);
    expect(ctrl.notifications).toHaveLength(2);
    expect(ctrl.unreadCount).toBe(1);
  });

  test('triggers onNotificationReceived for new notifications arriving after initial load', async () => {
    const onReceived = vi.fn();

    const tagName = defineCE(
      class extends LitElement {
        ctrl = new NotificationController(this, {
          firestore: mockDb,
          app: mockApp,
          uid: 'user-1',
          onNotificationReceived: onReceived,
        });
      },
    );

    const el = await fixture<any>(`<${tagName}></${tagName}>`);
    const ctrl: NotificationController = el.ctrl;

    // 1. Initial snapshot (should NOT trigger onReceived)
    const initialItems = [
      {
        id: 'n1',
        title: 'Initial',
        body: 'Initial body',
        createdAt: Timestamp.now(),
        readAt: null,
      },
    ];
    mocks.lastOnNext!(createMockSnapshot(initialItems));
    expect(onReceived).not.toHaveBeenCalled();

    // 2. Second snapshot with a newly added notification
    const newItem = {
      id: 'n2',
      title: 'New Event',
      body: 'Someone commented.',
      createdAt: Timestamp.now(),
      readAt: null,
    };
    mocks.lastOnNext!(
      createMockSnapshot(
        [newItem, ...initialItems],
        [{ type: 'added', doc: { id: 'n2', data: () => newItem } }],
      ),
    );

    expect(onReceived).toHaveBeenCalledWith(newItem);
    expect(ctrl.unreadCount).toBe(2);
  });

  test('markAsRead updates the target notification in Firestore', async () => {
    const tagName = defineCE(
      class extends LitElement {
        ctrl = new NotificationController(this, {
          firestore: mockDb,
          uid: 'user-1',
        });
      },
    );

    const el = await fixture<any>(`<${tagName}></${tagName}>`);
    const ctrl: NotificationController = el.ctrl;

    await ctrl.markAsRead('notif-42');

    expect(mocks.mockUpdateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'users/user-1/notifications/notif-42' }),
      {
        readAt: 'SERVER_TIMESTAMP',
        read: true,
      },
    );
  });

  test('markAllAsRead updates all unread notifications in batch', async () => {
    const tagName = defineCE(
      class extends LitElement {
        ctrl = new NotificationController(this, {
          firestore: mockDb,
          uid: 'user-1',
        });
      },
    );

    const el = await fixture<any>(`<${tagName}></${tagName}>`);
    const ctrl: NotificationController = el.ctrl;

    // Load 2 unread and 1 read
    mocks.lastOnNext!(
      createMockSnapshot([
        { id: 'u1', read: false },
        { id: 'u2', read: false },
        { id: 'r1', read: true, readAt: Timestamp.now() },
      ]),
    );

    await ctrl.markAllAsRead();

    expect(mocks.mockBatchUpdate).toHaveBeenCalledTimes(2);
    expect(mocks.mockBatchCommit).toHaveBeenCalled();
  });

  test('deleteNotification removes document from Firestore', async () => {
    const tagName = defineCE(
      class extends LitElement {
        ctrl = new NotificationController(this, {
          firestore: mockDb,
          uid: 'user-1',
        });
      },
    );

    const el = await fixture<any>(`<${tagName}></${tagName}>`);
    const ctrl: NotificationController = el.ctrl;

    await ctrl.deleteNotification('notif-99');

    expect(mocks.mockDeleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'users/user-1/notifications/notif-99' }),
    );
  });

  test('togglePush toggles between enabled and off', async () => {
    const tagName = defineCE(
      class extends LitElement {
        ctrl = new NotificationController(this, {
          firestore: mockDb,
          app: mockApp,
          uid: 'user-1',
          push: { vapidKey: 'test-key' },
          registeredTokens: ['token-123'],
        });
      },
    );

    const el = await fixture<any>(`<${tagName}></${tagName}>`);
    const ctrl: NotificationController = el.ctrl;

    // Initial check resolved as enabled
    await el.updateComplete;
    expect(ctrl.pushState).toBe('enabled');

    // Toggle off
    const nextState1 = await ctrl.togglePush();
    expect(nextState1).toBe('off');
    expect(ctrl.pushState).toBe('off');

    // Toggle back on
    const nextState2 = await ctrl.togglePush();
    expect(nextState2).toBe('enabled');
    expect(ctrl.pushState).toBe('enabled');
  });

  test('re-subscribes when dynamic uid changes during hostUpdate', async () => {
    let currentUid = 'user-1';

    const tagName = defineCE(
      class extends LitElement {
        ctrl = new NotificationController(this, {
          firestore: mockDb,
          uid: () => currentUid,
        });
      },
    );

    const el = await fixture<any>(`<${tagName}></${tagName}>`);
    expect(mocks.mockUnsubscribe).not.toHaveBeenCalled();

    // Change uid and request update
    currentUid = 'user-2';
    el.requestUpdate();
    await el.updateComplete;

    expect(mocks.mockUnsubscribe).toHaveBeenCalled();
  });

  test('unsubscribes on hostDisconnected', async () => {
    const tagName = defineCE(
      class extends LitElement {
        ctrl = new NotificationController(this, {
          firestore: mockDb,
          uid: 'user-1',
        });
      },
    );

    const el = await fixture<any>(`<${tagName}></${tagName}>`);
    expect(mocks.mockUnsubscribe).not.toHaveBeenCalled();

    el.remove();
    expect(mocks.mockUnsubscribe).toHaveBeenCalled();
  });

  test('createNotification writes to Firestore and returns generated id', async () => {
    const tagName = defineCE(
      class extends LitElement {
        ctrl = new NotificationController(this, {
          firestore: mockDb,
          uid: 'user-1',
        });
      },
    );

    const el = await fixture<any>(`<${tagName}></${tagName}>`);
    const ctrl: NotificationController = el.ctrl;

    const notifId = await ctrl.createNotification({
      title: 'Controller Alert',
      body: 'Triggered from component.',
      type: 'user_action',
    });

    expect(notifId).toBe('generated-id-77');
    expect(mocks.mockSetDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        title: 'Controller Alert',
        body: 'Triggered from component.',
        recipientId: 'user-1',
      }),
    );
  });
});
