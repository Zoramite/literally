// @vitest-environment jsdom
import { LitElement } from 'lit';
import { afterEach, beforeEach, describe, test } from 'vitest';

import { navigateToPathEvent } from '../navigation/navigation';
import { RouterMixin } from './router.mixin';

class TestRouterComponent extends RouterMixin(LitElement) {}
customElements.define('test-router-component', TestRouterComponent);

describe('RouterMixin', () => {
  let element: TestRouterComponent;

  beforeEach(() => {
    // Reset URL state before each test
    window.history.replaceState({}, '', '/');
    window.location.hash = '';

    element = document.createElement(
      'test-router-component',
    ) as TestRouterComponent;
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element) {
      element.remove();
    }
  });

  describe('hash mode (default)', () => {
    test('initializes routePath from hash', async ({ expect }) => {
      window.location.hash = '#/test-hash';
      const el = document.createElement(
        'test-router-component',
      ) as TestRouterComponent;
      document.body.appendChild(el);

      expect(el.routePath).toBe('/test-hash');
      el.remove();
    });

    test('handles internal navigation event', async ({ expect }) => {
      element.dispatchEvent(navigateToPathEvent('/new-hash-route'));

      // routePath should be set synchronously
      expect(element.routePath).toBe('/new-hash-route');
      expect(window.location.hash).toBe('#/new-hash-route');
    });

    test('listens to hashchange events', async ({ expect }) => {
      window.location.hash = '#/another-hash';

      // Yield to let the hashchange event fire and be processed
      await new Promise((r) => setTimeout(r, 50));
      expect(element.routePath).toBe('/another-hash');
    });
  });

  describe('path mode', () => {
    test('initializes routePath from pathname and strips rootPath', async ({
      expect,
    }) => {
      window.history.replaceState({}, '', '/app-root/test-path');

      const el = document.createElement(
        'test-router-component',
      ) as TestRouterComponent;
      el.routerMode = 'path';
      el.rootPath = '/app-root';
      document.body.appendChild(el);

      expect(el.routePath).toBe('/test-path');
      el.remove();
    });

    test('handles internal navigation event within same root', async ({
      expect,
    }) => {
      element.routerMode = 'path';
      element.rootPath = '/app-root';

      element.dispatchEvent(navigateToPathEvent('/new-path'));

      expect(element.routePath).toBe('/new-path');
      expect(window.location.pathname).toBe('/app-root/new-path');
    });

    test('listens to popstate events with state path', async ({ expect }) => {
      element.routerMode = 'path';
      element.rootPath = '/app-root';

      // Push state to history to ensure both state and location are updated
      window.history.pushState(
        { path: '/popped-path' },
        '',
        '/app-root/popped-path',
      );
      window.dispatchEvent(
        new PopStateEvent('popstate', { state: { path: '/popped-path' } }),
      );

      // Yield to let the event process
      await new Promise((r) => setTimeout(r, 0));
      expect(element.routePath).toBe('/popped-path');
    });

    test('listens to popstate events without state path (fallback to location)', async ({
      expect,
    }) => {
      element.routerMode = 'path';
      element.rootPath = '/app-root';

      // Manually change the URL without passing state
      window.history.replaceState({}, '', '/app-root/fallback-path');
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }));

      await new Promise((r) => setTimeout(r, 0));
      expect(element.routePath).toBe('/fallback-path');
    });
  });

  describe('navigateToPath method', () => {
    test('navigates to path and returns true when not blocked', ({
      expect,
    }) => {
      const allowed = element.navigateToPath('/new-destination');
      expect(allowed).toBe(true);
      expect(element.routePath).toBe('/new-destination');
      expect(window.location.hash).toBe('#/new-destination');
    });
  });

  describe('navigation blocking', () => {
    test('startBlocking blocks navigation and returns unblock function', ({
      expect,
    }) => {
      expect(element.isNavigationBlocked()).toBe(false);

      const unblock = element.startBlocking('test-block');
      expect(element.isNavigationBlocked()).toBe(true);
      expect(element.isNavigationBlocked('test-block')).toBe(true);
      expect(element.isNavigationBlocked('other-block')).toBe(false);
      expect(element.getBlockedNavigationKeys()).toEqual(['test-block']);

      const allowed = element.navigateToPath('/blocked-path');
      expect(allowed).toBe(false);
      expect(element.routePath).toBe('');

      unblock();
      expect(element.isNavigationBlocked()).toBe(false);

      const retryAllowed = element.navigateToPath('/allowed-path');
      expect(retryAllowed).toBe(true);
      expect(element.routePath).toBe('/allowed-path');
    });

    test('supports reference counting and multiple keys', ({ expect }) => {
      element.startBlocking('task-1');
      element.startBlocking('task-2');
      element.startBlocking('task-1');

      expect(element.isNavigationBlocked()).toBe(true);
      expect(element.getBlockedNavigationKeys()).toEqual(['task-1', 'task-2']);

      element.stopBlocking('task-1');
      // task-1 was started twice, still active
      expect(element.isNavigationBlocked('task-1')).toBe(true);

      element.stopBlocking('task-1');
      expect(element.isNavigationBlocked('task-1')).toBe(false);
      // task-2 still active
      expect(element.isNavigationBlocked()).toBe(true);

      element.stopBlocking('task-2');
      expect(element.isNavigationBlocked()).toBe(false);
    });

    test('clearNavigationBlocking resets all or specific keys', ({
      expect,
    }) => {
      element.startBlocking('a');
      element.startBlocking('b');

      element.clearNavigationBlocking('a');
      expect(element.isNavigationBlocked('a')).toBe(false);
      expect(element.isNavigationBlocked('b')).toBe(true);

      element.startBlocking('c');
      element.clearNavigationBlocking();
      expect(element.isNavigationBlocked()).toBe(false);
    });

    test('wrapBlocking wraps synchronous execution', ({ expect }) => {
      let duringBlockChecked = false;

      const result = element.wrapBlocking(() => {
        expect(element.isNavigationBlocked('sync-op')).toBe(true);
        duringBlockChecked = true;
        return 'operation-result';
      }, 'sync-op');

      expect(duringBlockChecked).toBe(true);
      expect(result).toBe('operation-result');
      expect(element.isNavigationBlocked()).toBe(false);
    });

    test('wrapBlocking unblocks even when error is thrown', ({ expect }) => {
      expect(() => {
        element.wrapBlocking(() => {
          throw new Error('boom');
        }, 'failing-op');
      }).toThrow('boom');

      expect(element.isNavigationBlocked()).toBe(false);
    });

    test('wrapAsyncBlocking wraps asynchronous execution', async ({
      expect,
    }) => {
      let duringBlockChecked = false;

      const promise = element.wrapAsyncBlocking(async () => {
        await new Promise((r) => setTimeout(r, 10));
        expect(element.isNavigationBlocked('async-op')).toBe(true);
        duringBlockChecked = true;
        return 42;
      }, 'async-op');

      expect(element.isNavigationBlocked('async-op')).toBe(true);
      const result = await promise;

      expect(duringBlockChecked).toBe(true);
      expect(result).toBe(42);
      expect(element.isNavigationBlocked()).toBe(false);
    });

    test('wrapAsyncBlocking unblocks even when promise rejects', async ({
      expect,
    }) => {
      await expect(
        element.wrapAsyncBlocking(async () => {
          await new Promise((r) => setTimeout(r, 10));
          throw new Error('async-boom');
        }, 'async-fail'),
      ).rejects.toThrow('async-boom');

      expect(element.isNavigationBlocked()).toBe(false);
    });

    test('triggers navigationBlockedCallback with detail and retry function', ({
      expect,
    }) => {
      element.startBlocking('saving');

      let blockedDetail: any = null;
      element.navigationBlockedCallback = (detail) => {
        blockedDetail = detail;
      };

      const allowed = element.navigateToPath('/pending-route');
      expect(allowed).toBe(false);
      expect(blockedDetail).not.toBeNull();
      expect(blockedDetail.path).toBe('/pending-route');
      expect(blockedDetail.source).toBe('navigateToPath');
      expect(blockedDetail.blockedKeys).toEqual(['saving']);

      // Unblock and call retry()
      element.stopBlocking('saving');
      const retryResult = blockedDetail.retry();
      expect(retryResult).toBe(true);
      expect(element.routePath).toBe('/pending-route');
    });

    test('addNavigationBlockedCallback and removeNavigationBlockedCallback work', ({
      expect,
    }) => {
      element.startBlocking('work');
      let called = false;

      const unsubscribe = element.addNavigationBlockedCallback(() => {
        called = true;
      });

      element.navigateToPath('/test');
      expect(called).toBe(true);

      called = false;
      unsubscribe();
      element.navigateToPath('/test2');
      expect(called).toBe(false);
    });

    test('dispatches navigationBlocked custom event when blocked', ({
      expect,
    }) => {
      element.startBlocking('locked');

      let eventReceived: any = null;
      element.addEventListener('navigationBlocked', (e: any) => {
        eventReceived = e.detail;
      });

      element.dispatchEvent(navigateToPathEvent('/attempt'));
      expect(eventReceived).not.toBeNull();
      expect(eventReceived.path).toBe('/attempt');
      expect(eventReceived.source).toBe('navigationEvent');
      expect(element.routePath).toBe('');
    });

    test('supports DOM event-driven block/unblock', async ({ expect }) => {
      const { blockNavigationEvent, unblockNavigationEvent } =
        await import('../navigation/navigation');

      element.dispatchEvent(blockNavigationEvent('form-dirty'));
      expect(element.isNavigationBlocked('form-dirty')).toBe(true);

      element.dispatchEvent(unblockNavigationEvent('form-dirty'));
      expect(element.isNavigationBlocked('form-dirty')).toBe(false);
    });

    test('intercepts hashchange and reverts hash when blocked', async ({
      expect,
    }) => {
      element.navigateToPath('/initial');
      expect(element.routePath).toBe('/initial');
      expect(window.location.hash).toBe('#/initial');

      element.startBlocking('modal-open');

      let blockedDetail: any = null;
      element.navigationBlockedCallback = (detail) => {
        blockedDetail = detail;
      };

      window.location.hash = '#/tried-hash';
      await new Promise((r) => setTimeout(r, 50));

      expect(blockedDetail).not.toBeNull();
      expect(blockedDetail.source).toBe('hashchange');
      expect(blockedDetail.path).toBe('/tried-hash');
      // routePath stays at initial and hash is reverted
      expect(element.routePath).toBe('/initial');
      expect(window.location.hash).toBe('#/initial');
    });

    test('intercepts popstate and reverts URL when blocked in path mode', async ({
      expect,
    }) => {
      element.routerMode = 'path';
      element.rootPath = '/app';
      element.navigateToPath('/current');
      expect(element.routePath).toBe('/current');

      element.startBlocking('active-process');

      let blockedDetail: any = null;
      element.navigationBlockedCallback = (detail) => {
        blockedDetail = detail;
      };

      window.history.pushState({ path: '/popped' }, '', '/app/popped');
      window.dispatchEvent(
        new PopStateEvent('popstate', { state: { path: '/popped' } }),
      );

      await new Promise((r) => setTimeout(r, 10));

      expect(blockedDetail).not.toBeNull();
      expect(blockedDetail.source).toBe('popstate');
      expect(blockedDetail.path).toBe('/popped');
      expect(element.routePath).toBe('/current');
      expect(window.location.pathname).toBe('/app/current');
    });
  });
});
