import { LitElement } from 'lit';

import { Constructor } from './mixin';

interface RafInterface {
  cancelRaf(): void;
  onRaf(): void;
  startRaf(rafTimeout: number, isRepeatingRaf: boolean): void;
}

/**
 * Mixin for adding teams lookup.
 */
export const RafMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class RafElement extends superClass {
    static styles = [(superClass as unknown as typeof LitElement).styles ?? []];

    // Keep track of if the raf loop should stop.
    protected cancelLoop = false;

    cancelRaf() {
      this.cancelLoop = true;
    }

    onRaf() {
      // no-op on base class. Override on child component.
    }

    startRaf(rafTimeout = 100, isRepeatingRaf = false) {
      // Reset the cancel for a new raf start.
      this.cancelLoop = false;

      // Initial start time of the timeout.
      let start = new Date().getTime();

      // Loop using the animation frame to not run when the page is not visible.
      const loop = () => {
        // Stopping raf loop?
        if (this.cancelLoop) {
          return;
        }

        const delta = new Date().getTime() - start;

        if (delta >= rafTimeout) {
          this.onRaf();

          if (isRepeatingRaf) {
            // If it is repeating, restart the timer.
            start = new Date().getTime();
          } else {
            // Completed single raf, stop the loop.
            return;
          }
        }

        requestAnimationFrame(loop);
      };

      requestAnimationFrame(loop);
    }
  }
  return RafElement as Constructor<RafInterface> & T;
};
