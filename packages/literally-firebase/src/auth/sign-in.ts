import {
  type Auth,
  GoogleAuthProvider,
  type UserCredential,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';

export interface SignInWithFallbackOptions {
  /**
   * Whether to automatically fallback to `signInWithRedirect` when popups are blocked.
   * Default: `true`.
   */
  fallbackToRedirect?: boolean;
}

/**
 * Attempts to sign in using Google Auth via a popup dialog.
 *
 * If the popup is blocked (common on mobile Safari and iOS devices) or interrupted by
 * browser popup blockers (`auth/popup-blocked`, `auth/cancelled-popup-request`),
 * this function automatically falls back to `signInWithRedirect`.
 *
 * @param auth The Firebase Auth instance.
 * @param provider Optional custom GoogleAuthProvider instance.
 * @param options Fallback behavior options.
 * @returns The UserCredential if popup sign-in succeeded, or `null` if redirect was initiated.
 *
 * @example
 * ```typescript
 * await signInWithGoogleWithFallback(auth);
 * ```
 */
export async function signInWithGoogleWithFallback(
  auth: Auth,
  provider: GoogleAuthProvider = new GoogleAuthProvider(),
  options: SignInWithFallbackOptions = {},
): Promise<UserCredential | null> {
  try {
    return await signInWithPopup(auth, provider);
  } catch (err: unknown) {
    const code = (err as any)?.code;

    // Check for popup blocking error codes
    if (
      options.fallbackToRedirect !== false &&
      (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request')
    ) {
      await signInWithRedirect(auth, provider);
      return null;
    }

    throw err;
  }
}

/**
 * Signs out the current user and optionally dispatches a composed `signOut` DOM event.
 *
 * @param auth The Firebase Auth instance.
 * @param host Optional HTMLElement to dispatch the `signOut` event from.
 *
 * @example
 * ```typescript
 * await signOutUser(auth, this);
 * ```
 */
export async function signOutUser(
  auth: Auth,
  host?: HTMLElement,
): Promise<void> {
  await signOut(auth);

  if (host) {
    host.dispatchEvent(
      new CustomEvent('signOut', {
        bubbles: true,
        composed: true,
      }),
    );
  }
}
