import { LitElement } from 'lit';
import { describe, expect, test, vi } from 'vitest';

import { ProcessingMixin } from './processing.mixin';

// Create a dummy LitElement subclass with our mixin applied
class TestElement extends ProcessingMixin(LitElement) {
  // Mock requestUpdate so we can verify it was called
  requestUpdate() {
    super.requestUpdate();
    return true;
  }
}

describe('ProcessingMixin', () => {
  test('initial state', () => {
    const el = new TestElement();
    expect(el.isProcessing()).toBe(false);
    expect(el.isProcessing('custom')).toBe(false);
  });

  test('startProcessing and stopProcessing', () => {
    const el = new TestElement();
    const spy = vi.spyOn(el, 'requestUpdate');

    el.startProcessing();
    expect(el.isProcessing()).toBe(true);
    expect(spy).toHaveBeenCalled();

    el.stopProcessing();
    expect(el.isProcessing()).toBe(false);
  });

  test('custom key processing', () => {
    const el = new TestElement();
    el.startProcessing('key-1');
    expect(el.isProcessing('key-1')).toBe(true);
    expect(el.isProcessing()).toBe(false);

    el.stopProcessing('key-1');
    expect(el.isProcessing('key-1')).toBe(false);
  });

  test('wrapProcessing', () => {
    const el = new TestElement();
    let called = false;

    el.wrapProcessing(() => {
      called = true;
      expect(el.isProcessing()).toBe(true);
    });

    expect(called).toBe(true);
    expect(el.isProcessing()).toBe(false);
  });

  test('wrapProcessing with custom key', () => {
    const el = new TestElement();
    el.wrapProcessing(() => {
      expect(el.isProcessing('custom-key')).toBe(true);
    }, 'custom-key');
    expect(el.isProcessing('custom-key')).toBe(false);
  });

  test('wrapProcessing stops processing even when throwing an error', () => {
    const el = new TestElement();
    expect(() => {
      el.wrapProcessing(() => {
        expect(el.isProcessing()).toBe(true);
        throw new Error('Test error');
      });
    }).toThrow('Test error');

    expect(el.isProcessing()).toBe(false);
  });

  test('wrapAsyncProcessing', async () => {
    const el = new TestElement();
    let called = false;

    await el.wrapAsyncProcessing(async () => {
      called = true;
      expect(el.isProcessing()).toBe(true);
    });

    expect(called).toBe(true);
    expect(el.isProcessing()).toBe(false);
  });

  test('wrapAsyncProcessing stops processing even when throwing an error', async () => {
    const el = new TestElement();
    await expect(
      el.wrapAsyncProcessing(async () => {
        expect(el.isProcessing()).toBe(true);
        throw new Error('Async error');
      }),
    ).rejects.toThrow('Async error');

    expect(el.isProcessing()).toBe(false);
  });
});
