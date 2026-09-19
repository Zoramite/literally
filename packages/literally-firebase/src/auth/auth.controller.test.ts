// @vitest-environment jsdom
import { fixture, defineCE } from '@open-wc/testing';
import { LitElement } from 'lit';
import { describe, test, expect, vi, beforeEach } from 'vitest';

import { AuthController } from './auth.controller.js';

const mocks = vi.hoisted(() => ({
  mockUnsubscribe: vi.fn(),
  lastListener: undefined as ((user: any) => Promise<void>) | undefined,
  lastErrorListener: undefined as ((err: any) => void) | undefined,
  mockSignOut: vi.fn(),
}));

vi.mock('firebase/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/auth')>();
  return {
    ...actual,
    onIdTokenChanged: vi.fn((_auth: any, next: any, error: any) => {
      mocks.lastListener = next;
      mocks.lastErrorListener = error;
      return mocks.mockUnsubscribe;
    }),
    signOut: vi.fn((...args: any[]) => mocks.mockSignOut(...args)),
  };
});

describe('AuthController', () => {
  const createMockUser = (
    uid: string,
    email: string,
    claims: Record<string, any> = {},
  ) => ({
    uid,
    email,
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.png',
    getIdTokenResult: vi.fn(async () => ({ claims })),
  });

  beforeEach(() => {
    mocks.mockUnsubscribe = vi.fn();
    mocks.mockSignOut = vi.fn();
    mocks.lastListener = undefined;
    mocks.lastErrorListener = undefined;
  });

  test('subscribes on hostConnected, extracts user and claims', async () => {
    let controller!: AuthController;
    const mockAuth = {} as any;

    const tag = defineCE(
      class extends LitElement {
        constructor() {
          super();
          controller = new AuthController(this, { auth: mockAuth });
        }
      },
    );

    const el = await fixture<any>(`<${tag}></${tag}>`);
    expect(controller.loading).toBe(true);
    expect(controller.isLoggedIn).toBe(false);

    // Simulate auth state change
    const user = createMockUser('user-1', 'test@example.com', {
      admin: true,
      role: 'staff',
    });
    await mocks.lastListener?.(user);

    expect(controller.loading).toBe(false);
    expect(controller.isLoggedIn).toBe(true);
    expect(controller.uid).toBe('user-1');
    expect(controller.email).toBe('test@example.com');
    expect(controller.displayName).toBe('Test User');
    expect(controller.photoURL).toBe('https://example.com/photo.png');
    expect(controller.claims).toEqual({ admin: true, role: 'staff' });
    expect(controller.hasClaim('admin')).toBe(true);
    expect(controller.hasClaim('role', 'staff')).toBe(true);
    expect(controller.hasClaim('role', 'admin')).toBe(false);
    expect(controller.hasClaim('missing')).toBe(false);

    // Cleanup
    el.remove();
    expect(mocks.mockUnsubscribe).toHaveBeenCalled();
  });

  test('handles sign out transition', async () => {
    let controller!: AuthController;
    const mockAuth = {} as any;

    const tag = defineCE(
      class extends LitElement {
        constructor() {
          super();
          controller = new AuthController(this, { auth: mockAuth });
        }
      },
    );

    await fixture<any>(`<${tag}></${tag}>`);
    const user = createMockUser('user-1', 'test@example.com', { admin: true });
    await mocks.lastListener?.(user);
    expect(controller.isLoggedIn).toBe(true);

    // Now sign out
    await mocks.lastListener?.(null);
    expect(controller.isLoggedIn).toBe(false);
    expect(controller.user).toBeNull();
    expect(controller.claims).toEqual({});
  });

  test('refreshClaims fetches fresh claims for current user', async () => {
    let controller!: AuthController;
    const mockAuth = {} as any;

    const tag = defineCE(
      class extends LitElement {
        constructor() {
          super();
          controller = new AuthController(this, { auth: mockAuth });
        }
      },
    );

    await fixture<any>(`<${tag}></${tag}>`);
    const user = createMockUser('user-1', 'test@example.com', { admin: false });
    await mocks.lastListener?.(user);
    expect(controller.hasClaim('admin')).toBe(false);

    // Update mock return value for refresh
    user.getIdTokenResult = vi.fn(async () => ({ claims: { admin: true } }));
    const refreshed = await controller.refreshClaims();

    expect(refreshed).toEqual({ admin: true });
    expect(controller.hasClaim('admin')).toBe(true);
  });

  test('invokes signOut method on configured auth instance', async () => {
    let controller!: AuthController;
    const mockAuth = { name: 'my-auth' } as any;

    const tag = defineCE(
      class extends LitElement {
        constructor() {
          super();
          controller = new AuthController(this, { auth: mockAuth });
        }
      },
    );

    await fixture<any>(`<${tag}></${tag}>`);
    await controller.signOut();
    expect(mocks.mockSignOut).toHaveBeenCalledWith(mockAuth);
  });

  test('handles auth error and triggers onError callback', async () => {
    const onError = vi.fn();
    let controller!: AuthController;
    const mockAuth = {} as any;

    const tag = defineCE(
      class extends LitElement {
        constructor() {
          super();
          controller = new AuthController(this, { auth: mockAuth, onError });
        }
      },
    );

    await fixture<any>(`<${tag}></${tag}>`);
    const mockErr = new Error('Auth network failure');
    mocks.lastErrorListener?.(mockErr);

    expect(controller.loading).toBe(false);
    expect(controller.error).toBe(mockErr);
    expect(onError).toHaveBeenCalledWith(mockErr);
  });

  test('handles null auth gracefully', async () => {
    let controller!: AuthController;

    const tag = defineCE(
      class extends LitElement {
        constructor() {
          super();
          controller = new AuthController(this, { auth: null });
        }
      },
    );

    await fixture<any>(`<${tag}></${tag}>`);
    expect(controller.loading).toBe(false);
    expect(controller.user).toBeNull();
    expect(controller.isLoggedIn).toBe(false);
  });
});
