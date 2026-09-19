// @vitest-environment jsdom
import { fixture, defineCE } from '@open-wc/testing';
import { LitElement } from 'lit';
import { describe, test, expect, vi, beforeEach } from 'vitest';

import { FirestoreDocController } from './doc.controller.js';

const mocks = vi.hoisted(() => ({
  mockUnsubscribe: vi.fn(),
  lastOnNext: undefined as ((snap: any) => void) | undefined,
  lastOnError: undefined as ((err: any) => void) | undefined,
}));

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/firestore')>();
  return {
    ...actual,
    onSnapshot: vi.fn((_ref: any, ...args: any[]) => {
      if (typeof args[0] === 'function') {
        mocks.lastOnNext = args[0];
        mocks.lastOnError = args[1];
      } else if (typeof args[1] === 'function') {
        mocks.lastOnNext = args[1];
        mocks.lastOnError = args[2];
      }
      return mocks.mockUnsubscribe;
    }),
    refEqual: vi.fn((a: any, b: any) => a?.path === b?.path),
  };
});

describe('FirestoreDocController', () => {
  const createMockRef = (path: string) => ({
    type: 'document' as const,
    path,
    converter: null,
    firestore: {} as any,
    id: path.split('/').pop() || '',
    parent: {} as any,
  });

  const createMockSnapshot = (data: any, exists = true, fromCache = false) => ({
    exists: () => exists,
    data: () => data,
    id: 'doc-1',
    metadata: {
      fromCache,
      hasPendingWrites: false,
      isEqual: () => true,
    },
  });

  beforeEach(() => {
    mocks.mockUnsubscribe = vi.fn();
    mocks.lastOnNext = undefined;
    mocks.lastOnError = undefined;
  });

  test('subscribes on hostConnected and handles snapshot data', async () => {
    const mockRef = createMockRef('users/user-1');
    let controller!: FirestoreDocController<{ name: string }>;

    const tag = defineCE(
      class extends LitElement {
        constructor() {
          super();
          controller = new FirestoreDocController(this, {
            ref: mockRef as any,
          });
        }
      },
    );

    const el = await fixture<any>(`<${tag}></${tag}>`);
    expect(controller.loading).toBe(true);

    // Simulate snapshot
    const mockSnap = createMockSnapshot({ name: 'Alice' }, true);
    mocks.lastOnNext?.(mockSnap);

    expect(controller.loading).toBe(false);
    expect(controller.data).toEqual({ name: 'Alice' });
    expect(controller.exists).toBe(true);
    expect(controller.isFromCache).toBe(false);

    // Cleanup
    el.remove();
    expect(mocks.mockUnsubscribe).toHaveBeenCalled();
  });

  test('handles error callback and sets error state', async () => {
    const mockRef = createMockRef('users/user-1');
    const onError = vi.fn();
    let controller!: FirestoreDocController<any>;

    const tag = defineCE(
      class extends LitElement {
        constructor() {
          super();
          controller = new FirestoreDocController(this, {
            ref: mockRef as any,
            onError,
          });
        }
      },
    );

    await fixture<any>(`<${tag}></${tag}>`);
    const mockError = new Error('Permission denied');
    mocks.lastOnError?.(mockError);

    expect(controller.loading).toBe(false);
    expect(controller.error).toBe(mockError);
    expect(onError).toHaveBeenCalledWith(mockError);
  });

  test('handles dynamic ref getter and changes during hostUpdate', async () => {
    let currentPath = 'users/user-1';
    let _controller!: FirestoreDocController<any>;

    const tag = defineCE(
      class extends LitElement {
        userId = 'user-1';
        constructor() {
          super();
          _controller = new FirestoreDocController(this, {
            ref: () => createMockRef(currentPath) as any,
          });
        }
      },
    );

    const el = await fixture<any>(`<${tag}></${tag}>`);
    expect(mocks.mockUnsubscribe).not.toHaveBeenCalled();

    // Trigger hostUpdate without changing ref
    el.requestUpdate();
    await el.updateComplete;
    expect(mocks.mockUnsubscribe).not.toHaveBeenCalled();

    // Change path and trigger update
    currentPath = 'users/user-2';
    el.requestUpdate();
    await el.updateComplete;

    // Previous subscription should be unsubscribed
    expect(mocks.mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  test('handles null ref gracefully without subscribing', async () => {
    let controller!: FirestoreDocController<any>;

    const tag = defineCE(
      class extends LitElement {
        constructor() {
          super();
          controller = new FirestoreDocController(this, { ref: null });
        }
      },
    );

    await fixture<any>(`<${tag}></${tag}>`);
    expect(controller.loading).toBe(false);
    expect(controller.data).toBeUndefined();
    expect(controller.exists).toBe(false);
  });

  test('respects autoStart: false', async () => {
    const mockRef = createMockRef('users/user-1');
    let controller!: FirestoreDocController<any>;

    const tag = defineCE(
      class extends LitElement {
        constructor() {
          super();
          controller = new FirestoreDocController(this, {
            ref: mockRef as any,
            autoStart: false,
          });
        }
      },
    );

    await fixture<any>(`<${tag}></${tag}>`);
    expect(controller.loading).toBe(false);
    expect(mocks.lastOnNext).toBeUndefined();

    // Manually subscribe
    controller.subscribe();
    expect(controller.loading).toBe(true);
    expect(mocks.lastOnNext).toBeDefined();
  });

  test('refresh clears existing state and re-subscribes', async () => {
    const mockRef = createMockRef('users/user-1');
    let controller!: FirestoreDocController<any>;

    const tag = defineCE(
      class extends LitElement {
        constructor() {
          super();
          controller = new FirestoreDocController(this, {
            ref: mockRef as any,
          });
        }
      },
    );

    await fixture<any>(`<${tag}></${tag}>`);
    mocks.lastOnNext?.(createMockSnapshot({ name: 'Bob' }));
    expect(controller.data).toEqual({ name: 'Bob' });

    controller.refresh();
    expect(controller.data).toBeUndefined();
    expect(controller.loading).toBe(true);
  });
});
