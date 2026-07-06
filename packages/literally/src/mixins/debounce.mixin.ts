import { LitElement } from 'lit';

import { type Constructor } from './mixin';

export interface DebounceInterface {
  debounce(
    callback: () => void | Promise<void>,
    delayMs: number,
    key?: string,
  ): void;
  debounce(
    key: string,
    callback: () => void | Promise<void>,
    delayMs: number,
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
      keyOrCallback: string | (() => void | Promise<void>),
      callbackOrDelayMs: (() => void | Promise<void>) | number,
      delayMsOrKey?: number | string,
    ) {
      let key = 'default';
      let callback: () => void | Promise<void>;
      let actualDelayMs: number;

      if (typeof keyOrCallback === 'string') {
        key = keyOrCallback;
        callback = callbackOrDelayMs as () => void | Promise<void>;
        actualDelayMs = delayMsOrKey as number;
      } else {
        callback = keyOrCallback;
        actualDelayMs = callbackOrDelayMs as number;
        if (typeof delayMsOrKey === 'string') {
          key = delayMsOrKey;
        }
      }

      this.cancelDebounce(key);
      const timeout = setTimeout(async () => {
        this.debounceTimeouts.delete(key);
        await callback();
      }, actualDelayMs);
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
