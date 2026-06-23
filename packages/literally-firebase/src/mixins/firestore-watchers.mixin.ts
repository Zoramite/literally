import { type Constructor } from '@littoral/literally/mixins/mixin';
import { type Unsubscribe } from 'firebase/firestore';
import { LitElement } from 'lit';

/**
 * Interface provided by the firestore listener.
 */
export interface FirestoreListenerMixinInterface {
  addFirebaseWatcher(name: string, watcher: Unsubscribe | undefined): void;
  hasFirebaseWatcher(name: string): boolean;
  stopFirebaseWatcher(name: string): void;
  clearFirebaseWatchers(): void;
}

/**
 * Mixin for managing firestore listeners.
 */
export const FirestoreListenerMixin = <T extends Constructor<LitElement>>(
  superClass: T,
) => {
  class FirestoreListenerMixinElement
    extends superClass
    implements FirestoreListenerMixinInterface
  {
    static styles = [(superClass as unknown as typeof LitElement).styles ?? []];

    protected firebaseWatchers: Record<string, Unsubscribe> = {};

    disconnectedCallback() {
      this.clearFirebaseWatchers();
      super.disconnectedCallback();
    }

    clearFirebaseWatchers() {
      for (const key of Object.keys(this.firebaseWatchers)) {
        this.firebaseWatchers[key]();
        delete this.firebaseWatchers[key];
      }
    }

    addFirebaseWatcher(name: string, watcher: Unsubscribe | undefined) {
      // Stop any existing watchers with the same name.
      this.firebaseWatchers[name]?.();

      if (!watcher) {
        return;
      }

      this.firebaseWatchers[name] = watcher;
    }

    hasFirebaseWatcher(name: string): boolean {
      return Boolean(this.firebaseWatchers[name]);
    }

    stopFirebaseWatcher(name: string) {
      this.firebaseWatchers[name]?.();
      delete this.firebaseWatchers[name];
    }
  }
  return FirestoreListenerMixinElement as Constructor<FirestoreListenerMixinInterface> &
    T;
};
