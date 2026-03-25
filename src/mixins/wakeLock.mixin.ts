import { LitElement } from 'lit';

import { Constructor } from './mixin';

interface WakeLockInterface {
  autoWakeLock: boolean;
}

/**
 * Mixin for adding screen wake locking.
 */
export const WakeLockMixin = <T extends Constructor<LitElement>>(
  superClass: T,
) => {
  class WakeLockMixinElement extends superClass implements WakeLockInterface {
    static styles = [(superClass as unknown as typeof LitElement).styles ?? []];

    wakeLock?: WakeLockSentinel;

    // By default automatically wake lock
    autoWakeLock: boolean = true;

    connectedCallback() {
      super.connectedCallback();

      if (this.autoWakeLock) {
        document.addEventListener(
          'fullscreenchange',
          this.handleWakeLockChange.bind(this),
        );
      }
    }

    disconnectedCallback() {
      if (this.autoWakeLock) {
        document.removeEventListener(
          'fullscreenchange',
          this.handleWakeLockChange,
        );
      }

      // Remove any active wakelock.
      this.stopWakeLock();

      super.disconnectedCallback();
    }

    async handleWakeLockChange() {
      if (document.fullscreenElement) {
        await this.startWakeLock();
      } else {
        await this.stopWakeLock();
      }

      this.requestUpdate();
    }

    async startWakeLock() {
      // Add wake lock.
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');

        this.wakeLock.addEventListener('release', () => {
          this.wakeLock = undefined;
        });
      } catch {
        // Ignore errors.
      }
    }

    async stopWakeLock() {
      await this.wakeLock?.release();
      this.wakeLock = undefined;
    }
  }
  return WakeLockMixinElement as Constructor<WakeLockInterface> & T;
};
