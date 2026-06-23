// @vitest-environment jsdom
import { fixture, defineCE } from '@open-wc/testing';
import { LitElement } from 'lit';
import { describe, test, expect, vi } from 'vitest';

import { FirestoreListenerMixin } from './firestore-watchers.mixin';

const TestTag = defineCE(class extends FirestoreListenerMixin(LitElement) {});

describe('FirestoreListenerMixin', () => {
  test('adds and stops watchers', async () => {
    const el = await fixture<any>(`<${TestTag}></${TestTag}>`);
    const unsubscribe = vi.fn();

    el.addFirebaseWatcher('test', unsubscribe);
    expect(el.hasFirebaseWatcher('test')).toBe(true);

    el.stopFirebaseWatcher('test');
    expect(unsubscribe).toHaveBeenCalled();
    expect(el.hasFirebaseWatcher('test')).toBe(false);
  });

  test('replaces existing watcher with same name', async () => {
    const el = await fixture<any>(`<${TestTag}></${TestTag}>`);
    const unsubscribe1 = vi.fn();
    const unsubscribe2 = vi.fn();

    el.addFirebaseWatcher('test', unsubscribe1);
    el.addFirebaseWatcher('test', unsubscribe2);

    expect(unsubscribe1).toHaveBeenCalled();
    expect(el.hasFirebaseWatcher('test')).toBe(true);
  });

  test('stops all watchers on disconnect', async () => {
    const el = await fixture<any>(`<${TestTag}></${TestTag}>`);
    const unsubscribe1 = vi.fn();
    const unsubscribe2 = vi.fn();

    el.addFirebaseWatcher('one', unsubscribe1);
    el.addFirebaseWatcher('two', unsubscribe2);

    // Disconnect the element
    el.remove();
    // Wait for disconnectedCallback (it's synchronous but let's be safe)

    expect(unsubscribe1).toHaveBeenCalled();
    expect(unsubscribe2).toHaveBeenCalled();
    expect(el.hasFirebaseWatcher('one')).toBe(false);
    expect(el.hasFirebaseWatcher('two')).toBe(false);
  });

  test('handles undefined watcher in addFirebaseWatcher', async () => {
    const el = await fixture<any>(`<${TestTag}></${TestTag}>`);
    el.addFirebaseWatcher('test', undefined);
    expect(el.hasFirebaseWatcher('test')).toBe(false);
  });
});
