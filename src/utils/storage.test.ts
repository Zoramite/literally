import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { BrowserStorage, MemoryStorage } from './storage';

describe('storage', () => {
  describe('MemoryStorage', () => {
    let storage: MemoryStorage;

    beforeEach(() => {
      storage = new MemoryStorage();
    });

    test('sets and gets items', () => {
      storage.setItem('foo', 'bar');
      expect(storage.getItem('foo')).toBe('bar');
    });

    test('returns null for non-existent items', () => {
      expect(storage.getItem('nonexistent')).toBeNull();
    });

    test('removes items', () => {
      storage.setItem('foo', 'bar');
      storage.removeItem('foo');
      expect(storage.getItem('foo')).toBeNull();
    });

    test('clears all items', () => {
      storage.setItem('foo', 'bar');
      storage.setItem('baz', 'qux');
      storage.clear();
      expect(storage.getItem('foo')).toBeNull();
      expect(storage.getItem('baz')).toBeNull();
    });
  });

  describe('BrowserStorage', () => {
    let mockStorage: Record<string, string>;

    beforeEach(() => {
      mockStorage = {};
      const storageMock: Storage = {
        length: 0,
        clear: vi.fn(() => {
          mockStorage = {};
        }),
        getItem: vi.fn((key: string) => mockStorage[key] ?? null),
        key: vi.fn((_index: number) => null),
        removeItem: vi.fn((key: string) => {
          delete mockStorage[key];
        }),
        setItem: vi.fn((key: string, value: string) => {
          mockStorage[key] = value;
        }),
      };

      vi.stubGlobal('window', {
        localStorage: storageMock,
        sessionStorage: storageMock,
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    test('delegates to window.localStorage', () => {
      const storage = new BrowserStorage('local');
      storage.setItem('hello', 'world');
      expect(storage.getItem('hello')).toBe('world');

      storage.removeItem('hello');
      expect(storage.getItem('hello')).toBeNull();

      storage.setItem('hello', 'world');
      storage.clear();
      expect(storage.getItem('hello')).toBeNull();
    });
  });
});
