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
});
