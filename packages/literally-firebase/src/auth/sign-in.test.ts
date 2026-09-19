// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach } from 'vitest';

import { signInWithGoogleWithFallback, signOutUser } from './sign-in.js';

const mocks = vi.hoisted(() => ({
  mockSignInWithPopup: vi.fn(),
  mockSignInWithRedirect: vi.fn(),
  mockSignOut: vi.fn(),
}));

vi.mock('firebase/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/auth')>();
  return {
    ...actual,
    signInWithPopup: vi.fn((...args: any[]) =>
      mocks.mockSignInWithPopup(...args),
    ),
    signInWithRedirect: vi.fn((...args: any[]) =>
      mocks.mockSignInWithRedirect(...args),
    ),
    signOut: vi.fn((...args: any[]) => mocks.mockSignOut(...args)),
    GoogleAuthProvider: class MockGoogleAuthProvider {},
  };
});

describe('sign-in helpers', () => {
  const mockAuth = { name: 'auth-instance' } as any;

  beforeEach(() => {
    mocks.mockSignInWithPopup.mockReset();
    mocks.mockSignInWithRedirect.mockReset();
    mocks.mockSignOut.mockReset();
  });

  describe('signInWithGoogleWithFallback', () => {
    test('returns UserCredential on popup success', async () => {
      const mockCred = { user: { uid: 'u1' } };
      mocks.mockSignInWithPopup.mockResolvedValueOnce(mockCred);

      const result = await signInWithGoogleWithFallback(mockAuth);

      expect(result).toBe(mockCred);
      expect(mocks.mockSignInWithPopup).toHaveBeenCalledWith(
        mockAuth,
        expect.any(Object),
      );
      expect(mocks.mockSignInWithRedirect).not.toHaveBeenCalled();
    });

    test('falls back to signInWithRedirect when popup is blocked', async () => {
      const popupError = new Error('Popup blocked') as any;
      popupError.code = 'auth/popup-blocked';
      mocks.mockSignInWithPopup.mockRejectedValueOnce(popupError);

      const result = await signInWithGoogleWithFallback(mockAuth);

      expect(result).toBeNull();
      expect(mocks.mockSignInWithRedirect).toHaveBeenCalledWith(
        mockAuth,
        expect.any(Object),
      );
    });

    test('falls back to signInWithRedirect on cancelled popup request', async () => {
      const popupError = new Error('Cancelled') as any;
      popupError.code = 'auth/cancelled-popup-request';
      mocks.mockSignInWithPopup.mockRejectedValueOnce(popupError);

      const result = await signInWithGoogleWithFallback(mockAuth);

      expect(result).toBeNull();
      expect(mocks.mockSignInWithRedirect).toHaveBeenCalledWith(
        mockAuth,
        expect.any(Object),
      );
    });

    test('rethrows error when fallbackToRedirect is false', async () => {
      const popupError = new Error('Popup blocked') as any;
      popupError.code = 'auth/popup-blocked';
      mocks.mockSignInWithPopup.mockRejectedValueOnce(popupError);

      await expect(
        signInWithGoogleWithFallback(mockAuth, undefined, {
          fallbackToRedirect: false,
        }),
      ).rejects.toThrow('Popup blocked');

      expect(mocks.mockSignInWithRedirect).not.toHaveBeenCalled();
    });

    test('rethrows non-popup errors directly', async () => {
      const otherError = new Error('Account disabled') as any;
      otherError.code = 'auth/user-disabled';
      mocks.mockSignInWithPopup.mockRejectedValueOnce(otherError);

      await expect(signInWithGoogleWithFallback(mockAuth)).rejects.toThrow(
        'Account disabled',
      );
      expect(mocks.mockSignInWithRedirect).not.toHaveBeenCalled();
    });
  });

  describe('signOutUser', () => {
    test('calls signOut on auth', async () => {
      await signOutUser(mockAuth);
      expect(mocks.mockSignOut).toHaveBeenCalledWith(mockAuth);
    });

    test('dispatches signOut event on host element if provided', async () => {
      const host = document.createElement('div');
      const eventSpy = vi.fn();
      host.addEventListener('signOut', eventSpy);

      await signOutUser(mockAuth, host);

      expect(mocks.mockSignOut).toHaveBeenCalledWith(mockAuth);
      expect(eventSpy).toHaveBeenCalled();
    });
  });
});
