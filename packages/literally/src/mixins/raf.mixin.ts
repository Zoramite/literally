import { LitElement } from 'lit';

import { type Constructor } from './mixin';

interface RafInterface {
  cancelRaf(key?: string): void;
  onRaf(): void | Promise<void>;
  startRaf(
    rafTimeout?: number,
    isRepeatingRaf?: boolean,
    key?: string,
    callback?: () => void | Promise<void>,
  ): void;
}

/**
 * Mixin for adding raf loop timing.
 */
export const RafMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class RafElement extends superClass {
    static styles = [(superClass as unknown as typeof LitElement).styles ?? []];

    // Keep track of active rafs by key
    protected activeRafs = new Map<
      string,
      {
        timeoutId?: ReturnType<typeof setTimeout>;
        rafId?: number;
        callback?: () => void | Promise<void>;
      }
    >();

    cancelRaf(key = 'default') {
      const state = this.activeRafs.get(key);
      if (state) {
        if (state.timeoutId) clearTimeout(state.timeoutId as number);
        if (state.rafId) cancelAnimationFrame(state.rafId);
        this.activeRafs.delete(key);
      }
    }

    onRaf(): void | Promise<void> {
      // no-op on base class. Override on child component.
    }

    /**
     * Starts a requestAnimationFrame timeout loop that only runs when the browser tab is active.
     *
     * @param rafTimeout The time in milliseconds to wait before triggering the callback.
     * @param isRepeatingRaf Whether the timer should continuously repeat.
     * @param key An optional key to uniquely identify and manage multiple timers independently.
     * @param callback An optional function to execute. If omitted, falls back to calling `onRaf()`.
     *                 If the callback (or `onRaf()`) is asynchronous and returns a Promise,
     *                 the next iteration of a repeating timer will only be scheduled AFTER the Promise resolves.
     */
    startRaf(
      rafTimeout = 100,
      isRepeatingRaf = false,
      key = 'default',
      callback?: () => void | Promise<void>,
    ) {
      // Cancel any existing raf for this key to restart it
      this.cancelRaf(key);

      const rafState: {
        timeoutId?: ReturnType<typeof setTimeout>;
        rafId?: number;
        callback?: () => void | Promise<void>;
      } = { callback };
      this.activeRafs.set(key, rafState);

      const queueRaf = () => {
        if (!this.activeRafs.has(key)) return;

        rafState.timeoutId = undefined;

        rafState.rafId = requestAnimationFrame(async () => {
          rafState.rafId = undefined;

          if (!this.activeRafs.has(key)) return;

          if (rafState.callback) {
            await rafState.callback();
          } else {
            await this.onRaf();
          }

          if (isRepeatingRaf && this.activeRafs.has(key)) {
            // If repeating, schedule the next timeout
            scheduleTimeout();
          } else {
            // If not repeating or cancelled inside onRaf, clean up
            if (this.activeRafs.get(key) === rafState) {
              this.activeRafs.delete(key);
            }
          }
        });
      };

      const scheduleTimeout = () => {
        if (!this.activeRafs.has(key)) return;

        // Use setTimeout to wait for the duration efficiently without CPU polling
        rafState.timeoutId = setTimeout(queueRaf, rafTimeout);
      };

      // Start the initial timeout
      scheduleTimeout();
    }
  }
  return RafElement as Constructor<RafInterface> & T;
};
