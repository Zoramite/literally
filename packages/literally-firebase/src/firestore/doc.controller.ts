import {
  type DocumentReference,
  type DocumentSnapshot,
  type SnapshotListenOptions,
  type Unsubscribe,
  onSnapshot,
  refEqual,
} from 'firebase/firestore';
import { type ReactiveController, type ReactiveControllerHost } from 'lit';

export type DocRefTarget<T> =
  | DocumentReference<T>
  | (() => DocumentReference<T> | null | undefined)
  | null
  | undefined;

export interface FirestoreDocControllerOptions<T> {
  /**
   * The DocumentReference or a getter function returning one (or null/undefined).
   */
  ref?: DocRefTarget<T>;

  /**
   * Optional Firestore snapshot listen options (e.g., { includeMetadataChanges: true }).
   */
  listenOptions?: SnapshotListenOptions;

  /**
   * Callback invoked whenever a new document snapshot arrives.
   */
  onData?: (data: T | undefined, snapshot: DocumentSnapshot<T>) => void;

  /**
   * Callback invoked when a Firestore listener error occurs.
   */
  onError?: (error: Error) => void;

  /**
   * Whether to automatically subscribe when host connects. Defaults to true.
   */
  autoStart?: boolean;
}

function areRefsEqual<T>(
  a: DocumentReference<T> | null,
  b: DocumentReference<T> | null,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  try {
    return refEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * A Lit Reactive Controller that manages real-time Firestore document subscriptions.
 *
 * Automatically subscribes on `hostConnected` and cleans up on `hostDisconnected`.
 * Supports dynamic reference getters that re-subscribe when properties change during `hostUpdate`.
 *
 * @example
 * ```typescript
 * class UserProfileElement extends LitElement {
 *   @property() userId!: string;
 *
 *   private user = new FirestoreDocController<UserProfile>(this, {
 *     ref: () => (this.userId ? doc(db, 'users', this.userId).withConverter(userConverter) : null),
 *   });
 *
 *   render() {
 *     if (this.user.loading) return html`<p>Loading...</p>`;
 *     if (this.user.error) return html`<p>Error: ${this.user.error.message}</p>`;
 *     if (!this.user.exists) return html`<p>User not found</p>`;
 *     return html`<h1>${this.user.data?.name}</h1>`;
 *   }
 * }
 * ```
 */
export class FirestoreDocController<T> implements ReactiveController {
  protected host: ReactiveControllerHost;
  protected options: FirestoreDocControllerOptions<T>;
  protected refTarget: DocRefTarget<T>;
  protected activeRef: DocumentReference<T> | null = null;
  protected unsubscribeFn?: Unsubscribe;
  protected isHostConnected = false;

  /**
   * Deserialized document data from the latest snapshot.
   */
  data: T | undefined = undefined;

  /**
   * Raw QueryDocumentSnapshot or DocumentSnapshot from Firestore.
   */
  snapshot?: DocumentSnapshot<T> = undefined;

  /**
   * Whether the controller is actively waiting for the initial snapshot.
   */
  loading = false;

  /**
   * Any error that occurred while listening to document changes.
   */
  error?: Error = undefined;

  constructor(
    host: ReactiveControllerHost,
    options: FirestoreDocControllerOptions<T> = {},
  ) {
    this.host = host;
    this.options = options;
    this.refTarget = options.ref;
    host.addController(this);
  }

  /**
   * Whether the document exists in Firestore.
   */
  get exists(): boolean {
    return this.snapshot?.exists() ?? false;
  }

  /**
   * Whether the latest snapshot was served from the local cache.
   */
  get isFromCache(): boolean {
    return this.snapshot?.metadata.fromCache ?? false;
  }

  /**
   * Whether the document has uncommitted local mutations.
   */
  get hasPendingWrites(): boolean {
    return this.snapshot?.metadata.hasPendingWrites ?? false;
  }

  /**
   * Lifecycle callback: host connected to DOM.
   */
  hostConnected() {
    this.isHostConnected = true;
    if (this.options.autoStart !== false) {
      this.subscribe();
    }
  }

  /**
   * Lifecycle callback: host disconnected from DOM.
   */
  hostDisconnected() {
    this.isHostConnected = false;
    this.unsubscribe();
  }

  /**
   * Lifecycle callback: runs before host update.
   * Re-evaluates dynamic reference getters to detect changes.
   */
  hostUpdate() {
    if (typeof this.refTarget === 'function') {
      const resolved = this.refTarget() ?? null;
      if (!areRefsEqual(resolved, this.activeRef)) {
        if (this.isHostConnected) {
          this.subscribeToRef(resolved);
        } else {
          this.activeRef = resolved;
        }
      }
    }
  }

  /**
   * Updates the target reference and re-subscribes if connected.
   */
  setRef(ref: DocRefTarget<T>) {
    this.refTarget = ref;
    const resolved = this.resolveRef();
    if (!areRefsEqual(resolved, this.activeRef)) {
      if (this.isHostConnected) {
        this.subscribeToRef(resolved);
      } else {
        this.activeRef = resolved;
      }
    }
  }

  /**
   * Begins listening to the current document target.
   */
  subscribe() {
    const resolved = this.resolveRef();
    this.subscribeToRef(resolved);
  }

  /**
   * Unsubscribes from active listener and clears subscription handle.
   */
  unsubscribe() {
    if (this.unsubscribeFn) {
      this.unsubscribeFn();
      this.unsubscribeFn = undefined;
    }
  }

  /**
   * Clears existing state and re-subscribes.
   */
  refresh() {
    this.data = undefined;
    this.snapshot = undefined;
    this.error = undefined;
    this.subscribe();
  }

  protected resolveRef(): DocumentReference<T> | null {
    if (typeof this.refTarget === 'function') {
      return this.refTarget() ?? null;
    }
    return this.refTarget ?? null;
  }

  protected subscribeToRef(ref: DocumentReference<T> | null) {
    this.unsubscribe();
    this.activeRef = ref;

    if (!ref) {
      this.data = undefined;
      this.snapshot = undefined;
      this.loading = false;
      this.error = undefined;
      this.host.requestUpdate();
      return;
    }

    this.loading = true;
    this.error = undefined;
    this.host.requestUpdate();

    const onNext = (snap: DocumentSnapshot<T>) => {
      this.snapshot = snap;
      this.data = snap.data();
      this.loading = false;
      this.error = undefined;
      this.options.onData?.(this.data, snap);
      this.host.requestUpdate();
    };

    const onError = (err: Error) => {
      this.error = err;
      this.loading = false;
      this.options.onError?.(err);
      this.host.requestUpdate();
    };

    if (this.options.listenOptions) {
      this.unsubscribeFn = onSnapshot(
        ref,
        this.options.listenOptions,
        onNext,
        onError,
      );
    } else {
      this.unsubscribeFn = onSnapshot(ref, onNext, onError);
    }
  }
}
