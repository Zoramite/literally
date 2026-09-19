// @vitest-environment jsdom
import { fixture, defineCE } from '@open-wc/testing';
import { LitElement } from 'lit';
import { describe, test, expect, vi, beforeEach } from 'vitest';

import { FirestoreQueryController } from './query.controller.js';

const mocks = vi.hoisted(() => ({
  mockUnsubscribe: vi.fn(),
  lastOnNext: undefined as ((snap: any) => void) | undefined,
  lastOnError: undefined as ((err: any) => void) | undefined,
}));

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/firestore')>();
  return {
    ...actual,
    onSnapshot: vi.fn((_query: any, ...args: any[]) => {
      if (typeof args[0] === 'function') {
        mocks.lastOnNext = args[0];
        mocks.lastOnError = args[1];
      } else if (typeof args[1] === 'function') {
        mocks.lastOnNext = args[1];
        mocks.lastOnError = args[2];
      }
      return mocks.mockUnsubscribe;
    }),
    queryEqual: vi.fn((a: any, b: any) => a?._queryId === b?._queryId),
  };
});

describe('FirestoreQueryController', () => {
  const createMockQuery = (queryId: string) => ({
    type: 'query' as const,
    _queryId: queryId,
    converter: null,
    firestore: {} as any,
  });

  const createMockSnapshot = (items: any[], fromCache = false) => ({
    empty: items.length === 0,
    size: items.length,
    docs: items.map((item, index) => ({
      id: `doc-${index}`,
      data: () => item,
      exists: () => true,
    })),
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

  test('subscribes on hostConnected and maps query snapshot data', async () => {
    const mockQuery = createMockQuery('camps-all');
    let controller!: FirestoreQueryController<{ name: string }>;

    const tag = defineCE(
      class extends LitElement {
        constructor() {
          super();
          controller = new FirestoreQueryController(this, {
            query: mockQuery as any,
          });
        }
      },
    );

    const el = await fixture<any>(`<${tag}></${tag}>`);
    expect(controller.loading).toBe(true);
    expect(controller.empty).toBe(true);
    expect(controller.count).toBe(0);

    // Simulate snapshot
    const mockSnap = createMockSnapshot([
      { name: 'Camp Alpha' },
      { name: 'Camp Beta' },
    ]);
    mocks.lastOnNext?.(mockSnap);

    expect(controller.loading).toBe(false);
    expect(controller.data).toEqual([
      { name: 'Camp Alpha' },
      { name: 'Camp Beta' },
    ]);
    expect(controller.count).toBe(2);
    expect(controller.empty).toBe(false);
    expect(controller.isFromCache).toBe(false);

    // Cleanup
    el.remove();
    expect(mocks.mockUnsubscribe).toHaveBeenCalled();
  });

  test('handles query error callback and sets error state', async () => {
    const mockQuery = createMockQuery('camps-all');
    const onError = vi.fn();
    let controller!: FirestoreQueryController<any>;

    const tag = defineCE(
      class extends LitElement {
        constructor() {
          super();
          controller = new FirestoreQueryController(this, {
            query: mockQuery as any,
            onError,
          });
        }
      },
    );

    await fixture<any>(`<${tag}></${tag}>`);
    const mockError = new Error('Index required');
    mocks.lastOnError?.(mockError);

    expect(controller.loading).toBe(false);
    expect(controller.error).toBe(mockError);
    expect(onError).toHaveBeenCalledWith(mockError);
  });

  test('handles dynamic query getter and changes during hostUpdate', async () => {
    let currentQueryId = 'camps-active';
    let _controller!: FirestoreQueryController<any>;

    const tag = defineCE(
      class extends LitElement {
        constructor() {
          super();
          _controller = new FirestoreQueryController(this, {
            query: () => createMockQuery(currentQueryId) as any,
          });
        }
      },
    );

    const el = await fixture<any>(`<${tag}></${tag}>`);
    expect(mocks.mockUnsubscribe).not.toHaveBeenCalled();

    // Trigger hostUpdate without changing query
    el.requestUpdate();
    await el.updateComplete;
    expect(mocks.mockUnsubscribe).not.toHaveBeenCalled();

    // Change query ID and trigger host update
    currentQueryId = 'camps-archived';
    el.requestUpdate();
    await el.updateComplete;

    expect(mocks.mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  test('handles null query gracefully', async () => {
    let controller!: FirestoreQueryController<any>;

    const tag = defineCE(
      class extends LitElement {
        constructor() {
          super();
          controller = new FirestoreQueryController(this, { query: null });
        }
      },
    );

    await fixture<any>(`<${tag}></${tag}>`);
    expect(controller.loading).toBe(false);
    expect(controller.data).toEqual([]);
    expect(controller.empty).toBe(true);
    expect(controller.count).toBe(0);
  });

  test('respects autoStart: false', async () => {
    const mockQuery = createMockQuery('camps-all');
    let controller!: FirestoreQueryController<any>;

    const tag = defineCE(
      class extends LitElement {
        constructor() {
          super();
          controller = new FirestoreQueryController(this, {
            query: mockQuery as any,
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

  test('refresh clears data and re-subscribes', async () => {
    const mockQuery = createMockQuery('camps-all');
    let controller!: FirestoreQueryController<any>;

    const tag = defineCE(
      class extends LitElement {
        constructor() {
          super();
          controller = new FirestoreQueryController(this, {
            query: mockQuery as any,
          });
        }
      },
    );

    await fixture<any>(`<${tag}></${tag}>`);
    mocks.lastOnNext?.(createMockSnapshot([{ name: 'Test Camp' }]));
    expect(controller.count).toBe(1);

    controller.refresh();
    expect(controller.data).toEqual([]);
    expect(controller.loading).toBe(true);
  });
});
