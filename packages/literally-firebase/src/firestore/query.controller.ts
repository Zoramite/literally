import {
  type Query,
  type QuerySnapshot,
  type SnapshotListenOptions,
  type Unsubscribe,
  onSnapshot,
  queryEqual,
} from 'firebase/firestore';
import { type ReactiveController, type ReactiveControllerHost } from 'lit';

export type QueryTarget<T> =
  | Query<T>
  | (() => Query<T> | null | undefined)
  | null
  | undefined;

export interface FirestoreQueryControllerOptions<T> {
  /**
   * The Firestore Query/CollectionReference or a getter function returning one (or null/undefined).
   */
  query?: QueryTarget<T>;

  /**
   * Optional Firestore snapshot listen options (e.g., { includeMetadataChanges: true }).
   */
  listenOptions?: SnapshotListenOptions;

  /**
   * Callback invoked whenever a new query snapshot arrives.
   */
  onData?: (data: T[], snapshot: QuerySnapshot<T>) => void;

  /**
   * Callback invoked when a Firestore query listener error occurs.
   */
  onError?: (error: Error) => void;

  /**
   * Whether to automatically subscribe when host connects. Defaults to true.
   */
  autoStart?: boolean;
}

function areQueriesEqual<T>(a: Query<T> | null, b: Query<T> | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  try {
    return queryEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * A Lit Reactive Controller that manages real-time Firestore query subscriptions.
 *
 * Automatically subscribes on `hostConnected` and cleans up on `hostDisconnected`.
 * Supports dynamic query getters that re-subscribe when filter parameters change during `hostUpdate`.
 *
 * @example
 * ```typescript
 * class CampListElement extends LitElement {
 *   @property({ type: Boolean }) isPublicOnly = true;
 *
 *   private camps = new FirestoreQueryController<CampInfo>(this, {
 *     query: () => {
 *       const col = collection(db, 'camps').withConverter(campConverter);
 *       return this.isPublicOnly ? query(col, where('isPublic', '==', true)) : query(col);
 *     },
 *   });
 *
 *   render() {
 *     if (this.camps.loading) return html`<p>Loading camps...</p>`;
 *     if (this.camps.error) return html`<p>Error: ${this.camps.error.message}</p>`;
 *     if (this.camps.empty) return html`<p>No camps found.</p>`;
 *     return html`
 *       <p>Total: ${this.camps.count}</p>
 *       <ul>
 *         ${this.camps.data.map(camp => html`<li>${camp.name}</li>`)}
 *       </ul>
 *     `;
 *   }
 * }
 * ```
 */
export class FirestoreQueryController<T> implements ReactiveController {
  protected host: ReactiveControllerHost;
  protected options: FirestoreQueryControllerOptions<T>;
  protected queryTarget: QueryTarget<T>;
  protected activeQuery: Query<T> | null = null;
  protected unsubscribeFn?: Unsubscribe;
  protected isHostConnected = false;

  /**
   * Deserialized items from the latest query snapshot.
   */
  data: T[] = [];

  /**
   * Raw QuerySnapshot from Firestore.
   */
  snapshot?: QuerySnapshot<T> = undefined;

  /**
   * Whether the controller is waiting for the initial query snapshot.
   */
  loading = false;

  /**
   * Any error that occurred during query subscription.
   */
  error?: Error = undefined;

  constructor(
    host: ReactiveControllerHost,
    options: FirestoreQueryControllerOptions<T> = {},
  ) {
    this.host = host;
    this.options = options;
    this.queryTarget = options.query;
    host.addController(this);
  }

  /**
   * Number of items in current result set.
   */
  get count(): number {
    return this.data.length;
  }

  /**
   * Whether the query snapshot contains no documents.
   */
  get empty(): boolean {
    return this.snapshot ? this.snapshot.empty : this.data.length === 0;
  }

  /**
   * Whether the latest snapshot was served from the local cache.
   */
  get isFromCache(): boolean {
    return this.snapshot?.metadata.fromCache ?? false;
  }

  /**
   * Whether the snapshot has uncommitted local mutations.
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
   * Re-evaluates dynamic query getters to detect changes.
   */
  hostUpdate() {
    if (typeof this.queryTarget === 'function') {
      const resolved = this.queryTarget() ?? null;
      if (!areQueriesEqual(resolved, this.activeQuery)) {
        if (this.isHostConnected) {
          this.subscribeToQuery(resolved);
        } else {
          this.activeQuery = resolved;
        }
      }
    }
  }

  /**
   * Updates the target query and re-subscribes if connected.
   */
  setQuery(query: QueryTarget<T>) {
    this.queryTarget = query;
    const resolved = this.resolveQuery();
    if (!areQueriesEqual(resolved, this.activeQuery)) {
      if (this.isHostConnected) {
        this.subscribeToQuery(resolved);
      } else {
        this.activeQuery = resolved;
      }
    }
  }

  /**
   * Begins listening to the current query target.
   */
  subscribe() {
    const resolved = this.resolveQuery();
    this.subscribeToQuery(resolved);
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
    this.data = [];
    this.snapshot = undefined;
    this.error = undefined;
    this.subscribe();
  }

  protected resolveQuery(): Query<T> | null {
    if (typeof this.queryTarget === 'function') {
      return this.queryTarget() ?? null;
    }
    return this.queryTarget ?? null;
  }

  protected subscribeToQuery(q: Query<T> | null) {
    this.unsubscribe();
    this.activeQuery = q;

    if (!q) {
      this.data = [];
      this.snapshot = undefined;
      this.loading = false;
      this.error = undefined;
      this.host.requestUpdate();
      return;
    }

    this.loading = true;
    this.error = undefined;
    this.host.requestUpdate();

    const onNext = (snap: QuerySnapshot<T>) => {
      this.snapshot = snap;
      this.data = snap.docs.map((doc) => doc.data());
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
        q,
        this.options.listenOptions,
        onNext,
        onError,
      );
    } else {
      this.unsubscribeFn = onSnapshot(q, onNext, onError);
    }
  }
}
