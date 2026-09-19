import {
  type Auth,
  type Unsubscribe,
  type User,
  onIdTokenChanged,
  signOut,
} from 'firebase/auth';
import { type ReactiveController, type ReactiveControllerHost } from 'lit';

export type AuthTarget =
  | Auth
  | (() => Auth | null | undefined)
  | null
  | undefined;

export interface AuthControllerOptions {
  /**
   * Firebase Auth instance or a dynamic getter returning one (or null/undefined).
   */
  auth?: AuthTarget;

  /**
   * Whether to automatically fetch custom claims via `user.getIdTokenResult()`.
   * Default: `true`.
   */
  loadClaims?: boolean;

  /**
   * Whether to force refresh the ID token when extracting claims.
   * Default: `false`.
   */
  forceRefreshClaims?: boolean;

  /**
   * Callback invoked whenever authentication state or claims change.
   */
  onAuthStateChanged?: (user: User | null, claims: Record<string, any>) => void;

  /**
   * Callback invoked on auth errors.
   */
  onError?: (error: Error) => void;
}

/**
 * A Lit Reactive Controller that manages reactive Firebase Authentication state.
 *
 * Automatically tracks `user`, ID token claims, and authentication loading state
 * across component lifecycles using `onIdTokenChanged`.
 *
 * @example
 * ```typescript
 * class UserProfileElement extends LitElement {
 *   private authCtrl = new AuthController(this, { auth });
 *
 *   render() {
 *     if (this.authCtrl.loading) return html`<p>Authenticating...</p>`;
 *     if (!this.authCtrl.isLoggedIn) return html`<p>Please log in.</p>`;
 *
 *     return html`
 *       <h1>Welcome, ${this.authCtrl.displayName}</h1>
 *       ${this.authCtrl.hasClaim('admin') ? html`<span class="badge">Admin</span>` : ''}
 *     `;
 *   }
 * }
 * ```
 */
export class AuthController implements ReactiveController {
  protected host: ReactiveControllerHost;
  protected options: AuthControllerOptions;
  protected authTarget: AuthTarget;
  protected activeAuth: Auth | null = null;
  protected unsubscribeFn?: Unsubscribe;
  protected isHostConnected = false;

  /**
   * The currently signed-in Firebase User, or `null` if unauthenticated.
   */
  user: User | null = null;

  /**
   * Custom claims extracted from the user's ID token.
   */
  claims: Record<string, any> = {};

  /**
   * Whether the controller is waiting for initial authentication resolution.
   */
  loading = true;

  /**
   * Any error that occurred during authentication or claims resolution.
   */
  error?: Error = undefined;

  constructor(
    host: ReactiveControllerHost,
    options: AuthControllerOptions = {},
  ) {
    this.host = host;
    this.options = options;
    this.authTarget = options.auth;
    host.addController(this);
  }

  /**
   * Whether a user is currently signed in.
   */
  get isLoggedIn(): boolean {
    return this.user !== null;
  }

  /**
   * Unique ID of the authenticated user.
   */
  get uid(): string | undefined {
    return this.user?.uid;
  }

  /**
   * Email address of the authenticated user.
   */
  get email(): string | undefined {
    return this.user?.email ?? undefined;
  }

  /**
   * Display name of the authenticated user.
   */
  get displayName(): string | undefined {
    return this.user?.displayName ?? undefined;
  }

  /**
   * Profile photo URL of the authenticated user.
   */
  get photoURL(): string | undefined {
    return this.user?.photoURL ?? undefined;
  }

  /**
   * Lifecycle callback: host connected to DOM.
   */
  hostConnected() {
    this.isHostConnected = true;
    this.subscribe();
  }

  /**
   * Lifecycle callback: host disconnected from DOM.
   */
  hostDisconnected() {
    this.isHostConnected = false;
    this.unsubscribe();
  }

  /**
   * Checks whether the user holds a specific custom claim.
   *
   * @param claim The claim name (e.g. `'admin'`).
   * @param expectedValue Optional specific value to match. If omitted, checks for truthiness.
   */
  hasClaim(claim: string, expectedValue?: any): boolean {
    if (expectedValue !== undefined) {
      return this.claims[claim] === expectedValue;
    }
    return Boolean(this.claims[claim]);
  }

  /**
   * Re-fetches the ID token result and refreshes user claims.
   *
   * @param forceRefresh Whether to force a token refresh. Defaults to `true`.
   */
  async refreshClaims(forceRefresh = true): Promise<Record<string, any>> {
    if (!this.user) {
      this.claims = {};
      this.host.requestUpdate();
      return this.claims;
    }

    try {
      const tokenResult = await this.user.getIdTokenResult(forceRefresh);
      this.claims = tokenResult.claims;
      this.error = undefined;
    } catch (err) {
      this.error = err as Error;
      this.options.onError?.(this.error);
    }

    this.host.requestUpdate();
    return this.claims;
  }

  /**
   * Signs out the current user.
   */
  async signOut(): Promise<void> {
    const auth = this.resolveAuth();
    if (auth) {
      await signOut(auth);
    }
  }

  /**
   * Begins listening to authentication changes on the configured Auth instance.
   */
  subscribe() {
    this.unsubscribe();
    const auth = this.resolveAuth();
    this.activeAuth = auth;

    if (!auth) {
      this.user = null;
      this.claims = {};
      this.loading = false;
      this.error = undefined;
      this.host.requestUpdate();
      return;
    }

    this.loading = true;
    this.error = undefined;
    this.host.requestUpdate();

    this.unsubscribeFn = onIdTokenChanged(
      auth,
      async (user) => {
        this.user = user;
        this.error = undefined;

        if (user && this.options.loadClaims !== false) {
          try {
            const tokenResult = await user.getIdTokenResult(
              this.options.forceRefreshClaims ?? false,
            );
            this.claims = tokenResult.claims;
          } catch (err) {
            this.claims = {};
            this.error = err as Error;
            this.options.onError?.(this.error);
          }
        } else {
          this.claims = {};
        }

        this.loading = false;
        this.options.onAuthStateChanged?.(this.user, this.claims);
        this.host.requestUpdate();
      },
      (err) => {
        this.error = err;
        this.loading = false;
        this.options.onError?.(err);
        this.host.requestUpdate();
      },
    );
  }

  /**
   * Unsubscribes from active auth listener.
   */
  unsubscribe() {
    if (this.unsubscribeFn) {
      this.unsubscribeFn();
      this.unsubscribeFn = undefined;
    }
  }

  protected resolveAuth(): Auth | null {
    if (typeof this.authTarget === 'function') {
      return this.authTarget() ?? null;
    }
    return this.authTarget ?? null;
  }
}
