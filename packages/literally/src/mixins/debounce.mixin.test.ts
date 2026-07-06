import { LitElement } from 'lit';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { DebounceMixin } from './debounce.mixin';

// Create a dummy LitElement subclass with our mixin applied
class TestElement extends DebounceMixin(LitElement) {}

describe('DebounceMixin', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  test('debounces function call with default key', () => {
    const el = new TestElement();
    const callback = vi.fn();

    el.debounce(callback, 100);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('debounces multiple calls with default key (resets timer)', () => {
    const el = new TestElement();
    const callback = vi.fn();

    el.debounce(callback, 100);
    vi.advanceTimersByTime(50);

    // Call again to reset
    el.debounce(callback, 100);
    vi.advanceTimersByTime(50);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('debounces independently with different keys', () => {
    const el = new TestElement();
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    el.debounce(callback1, 100, 'key1');
    vi.advanceTimersByTime(50);

    el.debounce(callback2, 100, 'key2');
    vi.advanceTimersByTime(50);

    // callback1 should be triggered now
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    // callback2 should be triggered now
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  test('cancelDebounce cancels the timeout', () => {
    const el = new TestElement();
    const callback = vi.fn();

    el.debounce(callback, 100, 'key1');
    vi.advanceTimersByTime(50);
    el.cancelDebounce('key1');

    vi.advanceTimersByTime(50);
    expect(callback).not.toHaveBeenCalled();
  });

  test('cancelDebounce uses default key if none provided', () => {
    const el = new TestElement();
    const callback = vi.fn();

    el.debounce(callback, 100);
    vi.advanceTimersByTime(50);
    el.cancelDebounce();

    vi.advanceTimersByTime(50);
    expect(callback).not.toHaveBeenCalled();
  });

  test('disconnectedCallback cleans up all timeouts', () => {
    const el = new TestElement();
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    el.debounce(callback1, 100, 'key1');
    el.debounce(callback2, 150, 'key2');

    el.disconnectedCallback();

    vi.advanceTimersByTime(200);
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });
});
