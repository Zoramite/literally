/**
 * Interface representing a simple key-value storage.
 * This matches standard Web Storage methods.
 */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * In-memory implementation of KeyValueStorage.
 * Useful for unit tests or SSR server environments.
 */
export class MemoryStorage implements KeyValueStorage {
  private data = new Map<string, string>();

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }
}

/**
 * Safe wrapper around browser Storage (localStorage/sessionStorage).
 * Gracefully degrades or runs without throwing ReferenceError in non-browser environments.
 */
export class BrowserStorage implements KeyValueStorage {
  constructor(private type: 'local' | 'session') {}

  private get storage(): Storage | null {
    if (typeof window === 'undefined') return null;
    try {
      return this.type === 'local' ? window.localStorage : window.sessionStorage;
    } catch {
      return null;
    }
  }

  getItem(key: string): string | null {
    const s = this.storage;
    return s ? s.getItem(key) : null;
  }

  setItem(key: string, value: string): void {
    const s = this.storage;
    if (s) {
      s.setItem(key, value);
    }
  }

  removeItem(key: string): void {
    const s = this.storage;
    if (s) {
      s.removeItem(key);
    }
  }

  clear(): void {
    const s = this.storage;
    if (s) {
      s.clear();
    }
  }
}

export const localKeyValueStorage = new BrowserStorage('local');
export const sessionKeyValueStorage = new BrowserStorage('session');
