import { LitElement } from 'lit';

import { type Constructor } from './mixin';

export interface DebounceInterface {
  debounce(
    callback: () => void | Promise<void>,
    delayMs: number,
    key?: string,
  ): void;
  cancelDebounce(key?: string): void;
}

/**
 * Mixin that provides debouncing functionality to LitElements.
 */
export const DebounceMixin = <T extends Constructor<LitElement>>(
  superClass: T,
) => {
  class DebounceElement extends superClass {
    static styles = [(superClass as unknown as typeof LitElement).styles ?? []];

    private debounceTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

    debounce(
      callback: () => void | Promise<void>,
      delayMs: number,
      key = 'default',
    ) {
      this.cancelDebounce(key);
      const timeout = setTimeout(async () => {
        this.debounceTimeouts.delete(key);
        await callback();
      }, delayMs);
      this.debounceTimeouts.set(key, timeout);
    }

    cancelDebounce(key = 'default') {
      if (this.debounceTimeouts.has(key)) {
        clearTimeout(this.debounceTimeouts.get(key));
        this.debounceTimeouts.delete(key);
      }
    }

    disconnectedCallback() {
      for (const timeout of this.debounceTimeouts.values()) {
        clearTimeout(timeout);
      }
      this.debounceTimeouts.clear();
      super.disconnectedCallback?.();
    }
  }

  return DebounceElement as Constructor<DebounceInterface> & T;
};
