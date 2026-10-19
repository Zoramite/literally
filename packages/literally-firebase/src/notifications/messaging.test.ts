// @vitest-environment jsdom
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { PushMessagingOptions } from './models.js';

import { PushMessagingService } from './messaging.js';

const mocks = vi.hoisted(() => ({
  mockGetToken: vi.fn(),
  mockDeleteToken: vi.fn(),
  mockIsSupported: vi.fn(),
  mockUpdateDoc: vi.fn(),
  mockArrayUnion: vi.fn((val: any) => ({ union: val })),
  mockArrayRemove: vi.fn((val: any) => ({ remove: val })),
}));

vi.mock('firebase/messaging', () => ({
  getMessaging: vi.fn(() => ({ type: 'messaging' })),
  getToken: mocks.mockGetToken,
  deleteToken: mocks.mockDeleteToken,
  isSupported: mocks.mockIsSupported,
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db: any, col: string, id: string) => ({ col, id })),
  updateDoc: mocks.mockUpdateDoc,
  arrayUnion: mocks.mockArrayUnion,
  arrayRemove: mocks.mockArrayRemove,
}));

describe('PushMessagingService', () => {
  const mockApp: any = { name: 'test-app' };
  const mockDb: any = { type: 'firestore' };
  const options: PushMessagingOptions = {
    vapidKey: 'test-vapid-key-123',
    serviceWorkerPath: '/test-sw.js',
    userCollection: 'users',
    tokenField: 'fcmTokens',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockIsSupported.mockResolvedValue(true);
    mocks.mockGetToken.mockResolvedValue('token-abc-123');
    mocks.mockDeleteToken.mockResolvedValue(true);
    mocks.mockUpdateDoc.mockResolvedValue(undefined);

    // Setup browser mocks
    (globalThis as any).Notification = {
      permission: 'default',
      requestPermission: vi.fn().mockResolvedValue('granted'),
    };

    (globalThis as any).navigator.serviceWorker = {
      register: vi.fn().mockResolvedValue({ scope: '/' }),
      ready: Promise.resolve({
        showNotification: vi.fn().mockResolvedValue(undefined),
      }),
    };
  });

  test('isSupported returns true when environment supports messaging', async () => {
    const supported = await PushMessagingService.isSupported();
    expect(supported).toBe(true);
  });

  test('getCurrentToken registers service worker and retrieves token', async () => {
    const token = await PushMessagingService.getCurrentToken(mockApp, options);
    expect(token).toBe('token-abc-123');
    expect(navigator.serviceWorker.register).toHaveBeenCalledWith(
      '/test-sw.js',
    );
    expect(mocks.mockGetToken).toHaveBeenCalledWith(expect.anything(), {
      vapidKey: 'test-vapid-key-123',
      serviceWorkerRegistration: expect.anything(),
    });
  });

  test('isDeviceTokenRegistered verifies live token against registered tokens array', async () => {
    const isReg1 = await PushMessagingService.isDeviceTokenRegistered(
      mockApp,
      ['token-other', 'token-abc-123'],
      options,
    );
    expect(isReg1).toBe(true);

    const isReg2 = await PushMessagingService.isDeviceTokenRegistered(
      mockApp,
      ['token-other'],
      options,
    );
    expect(isReg2).toBe(false);

    const isReg3 = await PushMessagingService.isDeviceTokenRegistered(
      mockApp,
      undefined,
      options,
    );
    expect(isReg3).toBe(false);
  });

  test('requestPermission prompts user, acquires token, and persists to Firestore', async () => {
    const result = await PushMessagingService.requestPermission(
      mockApp,
      mockDb,
      'user-456',
      options,
    );

    expect(result).toBe('enabled');
    expect(Notification.requestPermission).toHaveBeenCalled();
    expect(mocks.mockUpdateDoc).toHaveBeenCalledWith(
      { col: 'users', id: 'user-456' },
      { fcmTokens: { union: 'token-abc-123' } },
    );
  });

  test('requestPermission returns denied when user rejects prompt', async () => {
    (Notification.requestPermission as any).mockResolvedValueOnce('denied');

    const result = await PushMessagingService.requestPermission(
      mockApp,
      mockDb,
      'user-456',
      options,
    );

    expect(result).toBe('denied');
    expect(mocks.mockUpdateDoc).not.toHaveBeenCalled();
  });

  test('ensureDeviceTokenRegistered skips update if token is already registered', async () => {
    (Notification as any).permission = 'granted';

    const registered = await PushMessagingService.ensureDeviceTokenRegistered(
      mockApp,
      mockDb,
      'user-456',
      ['token-abc-123'],
      options,
    );

    expect(registered).toBe(true);
    expect(mocks.mockUpdateDoc).not.toHaveBeenCalled();
  });

  test('ensureDeviceTokenRegistered silently updates doc if permission granted but token missing', async () => {
    (Notification as any).permission = 'granted';

    const registered = await PushMessagingService.ensureDeviceTokenRegistered(
      mockApp,
      mockDb,
      'user-456',
      ['token-stale'],
      options,
    );

    expect(registered).toBe(true);
    expect(mocks.mockUpdateDoc).toHaveBeenCalledWith(
      { col: 'users', id: 'user-456' },
      { fcmTokens: { union: 'token-abc-123' } },
    );
  });

  test('disablePush removes token from Firestore and deletes FCM token', async () => {
    await PushMessagingService.disablePush(
      mockApp,
      mockDb,
      'user-456',
      options,
    );

    expect(mocks.mockUpdateDoc).toHaveBeenCalledWith(
      { col: 'users', id: 'user-456' },
      { fcmTokens: { remove: 'token-abc-123' } },
    );
    expect(mocks.mockDeleteToken).toHaveBeenCalled();
  });

  test('showLocalNotification triggers service worker showNotification', async () => {
    (Notification as any).permission = 'granted';
    const shown = PushMessagingService.showLocalNotification('Test Title', {
      body: 'Test Body',
    });
    expect(shown).toBe(true);
  });
});
