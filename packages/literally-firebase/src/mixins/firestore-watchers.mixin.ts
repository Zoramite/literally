import { type Constructor } from '@littoral/literally/mixins/mixin';
import { type Unsubscribe } from 'firebase/firestore';
import { LitElement } from 'lit';

/**
 * Interface representing the API provided by `FirestoreListenerMixin`.
 * Provides utilities to cleanly manage active Firestore live listeners (subscriptions)
 * and ensure they are cleaned up when elements disconnect.
 */
export interface FirestoreListenerMixinInterface {
  /**
   * Registers a active Firebase listener unsubscribe callback under a given name.
   * If a watcher with the same name already exists, it is unsubscribed first before
   * the new one is stored.
   *
   * @param name Unique name to identify the listener.
   * @param watcher The unsubscribe callback returned by the Firestore listener configuration.
   */
  addFirebaseWatcher(name: string, watcher: Unsubscribe | undefined): void;

  /**
   * Checks whether a Firebase listener with the given name is currently active and registered.
   *
   * @param name Unique name of the listener.
   * @returns True if the listener is active, false otherwise.
   */
  hasFirebaseWatcher(name: string): boolean;

  /**
   * Unsubscribes and stops a specific active listener by its unique name, removing it from the registry.
   *
   * @param name Unique name of the listener.
   */
  stopFirebaseWatcher(name: string): void;

  /**
   * Unsubscribes and stops all active listeners currently tracked by the mixin.
   */
  clearFirebaseWatchers(): void;
}

/**
 * A LitElement mixin that simplifies managing Firestore reactive watch listeners.
 *
 * Automatically tracks unsubscribe functions returned by Firestore listener configuration
 * (e.g. `onSnapshot`) and automatically cleans them up (unsubscribes) during the element's
 * `disconnectedCallback` lifecycle hook to prevent memory leaks.
 *
 * @example
 * ```ts
 * class MyElement extends FirestoreListenerMixin(LitElement) {
 *   connectedCallback() {
 *     super.connectedCallback();
 *     const unsubscribe = onSnapshot(docRef, (doc) => { ... });
 *     this.addFirebaseWatcher('my-doc-watcher', unsubscribe);
 *   }
 * }
 * ```
 */
export const FirestoreListenerMixin = <T extends Constructor<LitElement>>(
  superClass: T,
) => {
  class FirestoreListenerMixinElement
    extends superClass
    implements FirestoreListenerMixinInterface
  {
    static styles = [(superClass as unknown as typeof LitElement).styles ?? []];

    /**
     * Map tracking active Firestore unsubscribe callbacks by their registry key name.
     */
    protected firebaseWatchers: Record<string, Unsubscribe> = {};

    /**
     * Standard Web Component lifecycle hook.
     * Invoked when the component is disconnected from the DOM.
     * Automatically triggers cleanup of all registered Firebase listeners.
     */
    disconnectedCallback() {
      this.clearFirebaseWatchers();
      super.disconnectedCallback();
    }

    /**
     * Iterates over all active registered Firebase watchers, calls their unsubscribe callbacks
     * to terminate connection stream, and removes them from registry.
     */
    clearFirebaseWatchers() {
      for (const key of Object.keys(this.firebaseWatchers)) {
        this.firebaseWatchers[key]();
        delete this.firebaseWatchers[key];
      }
    }

    /**
     * Registers a new Firebase watcher unsubscribe callback under a given name.
     * Ensures any previous watcher with the same name is cleanly terminated first.
     *
     * @param name Unique key for tracking this listener.
     * @param watcher Unsubscribe callback returned by Firestore stream setups.
     */
    addFirebaseWatcher(name: string, watcher: Unsubscribe | undefined) {
      // Stop any existing watchers with the same name.
      this.firebaseWatchers[name]?.();

      if (!watcher) {
        return;
      }

      this.firebaseWatchers[name] = watcher;
    }

    /**
     * Queries the registry to see if an active watcher is registered.
     *
     * @param name Unique key of the listener.
     * @returns Boolean indicating presence of active listener.
     */
    hasFirebaseWatcher(name: string): boolean {
      return Boolean(this.firebaseWatchers[name]);
    }

    /**
     * Unsubscribes from a specific active watcher and deletes its registry key.
     *
     * @param name Unique key of the listener to stop.
     */
    stopFirebaseWatcher(name: string) {
      this.firebaseWatchers[name]?.();
      delete this.firebaseWatchers[name];
    }
  }
  return FirestoreListenerMixinElement as Constructor<FirestoreListenerMixinInterface> &
    T;
};
