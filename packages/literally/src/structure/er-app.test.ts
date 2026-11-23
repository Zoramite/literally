// @vitest-environment jsdom
import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  LazyRoute,
  type PageDetails,
  type PageRoute,
  PublicRoute,
  RedirectRoute,
  RoleRoute,
} from '../routing/route';
import { ERApp } from './er-app';

class TestApp extends ERApp {}
customElements.define('test-er-app', TestApp);

describe('ERApp and routing integration', () => {
  let app: TestApp;

  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    window.location.hash = '';
    document.title = 'Initial Title';

    app = document.createElement('test-er-app') as TestApp;
    document.body.appendChild(app);
  });

  afterEach(() => {
    if (app) {
      app.remove();
    }
  });

  it('renders synchronous PublicRoute template', async () => {
    app.routeTrie.add(
      '/',
      new PublicRoute({
        pageOptions: { title: 'Home' },
        template: html`<div id="home-view">Welcome Home</div>`,
      }),
    );

    app.routePath = '/';
    app.updateRouteTrieMatch();
    await app.updateComplete;

    const content = app.renderContent();
    expect(content).toBeDefined();
  });

  it('automatically updates document.title based on route pageOptions and defaultTitle', async () => {
    app.routeTrie.defaultTitle = 'My Literally App';
    app.routeTrie.add(
      '/settings',
      new LazyRoute({
        pageOptions: { title: 'User Settings' },
        loader: () => {},
        template: () => html`<div id="settings-view">Settings</div>`,
      }),
    );

    app.routePath = '/settings';
    app.updateRouteTrieMatch();

    expect(document.title).toBe('User Settings - My Literally App');
  });

  it('renders async route content using Promise', async () => {
    let resolveModule: (mod: any) => void;
    const modulePromise = new Promise((resolve) => {
      resolveModule = resolve;
    });

    const asyncRoute = new LazyRoute({
      pageOptions: { title: 'Async Section' },
      loader: () => modulePromise,
      template: (mod: any) =>
        html`<div id="async-view">${mod ? 'Loaded Async' : 'Empty'}</div>`,
      async: true,
    });

    app.routeTrie.add('/async', asyncRoute);
    app.routePath = '/async';
    app.updateRouteTrieMatch();

    // While promise is pending, renderContent returns a directive with fallback loading
    const pendingContent = app.renderContent();
    expect(pendingContent).toBeDefined();

    // Resolve the async loader
    resolveModule!({ ready: true });
    await modulePromise;
  });

  it('updates document.title when async PageDetails resolves with pageOptions and ignores stale promises', async () => {
    app.defaultTitle = 'My App';

    let resolveFirst!: (details: PageDetails) => void;
    const firstPromise = new Promise<PageDetails>((resolve) => {
      resolveFirst = resolve;
    });

    let resolveSecond!: (details: PageDetails) => void;
    const secondPromise = new Promise<PageDetails>((resolve) => {
      resolveSecond = resolve;
    });

    const firstRoute: PageRoute = {
      content: () => firstPromise,
    };
    const secondRoute: PageRoute = {
      content: () => secondPromise,
    };

    app.routeTrie.set('/first', firstRoute);
    app.routeTrie.set('/second', secondRoute);

    app.navigateToPath('/first');
    await app.updateComplete;
    expect(document.title).toBe('My App');

    // Navigate away before /first finishes loading
    app.navigateToPath('/second');
    await app.updateComplete;

    resolveFirst({
      pageOptions: { title: 'Stale First Page' },
      template: html`<div>First</div>`,
    });
    await firstPromise;
    await new Promise((r) => setTimeout(r, 0));
    expect(document.title).toBe('My App');

    resolveSecond({
      pageOptions: { title: 'Resolved Second Page' },
      template: html`<div>Second</div>`,
    });
    await secondPromise;
    await new Promise((r) => setTimeout(r, 0));
    expect(document.title).toBe('Resolved Second Page - My App');
  });

  it('does not overwrite dynamic child document.title on unrelated re-renders or unchanged-title permission updates', async () => {
    let permissions: Record<string, boolean> | undefined = undefined;
    app.getRoutePermissions = () => permissions;
    app.defaultTitle = 'STAR Camp';

    app.routeTrie.set(
      '/camps/{campId}',
      new PublicRoute({
        pageOptions: { title: 'Camp Details' },
        template: html`<div>Camp View</div>`,
      }),
    );

    app.navigateToPath('/camps/odyssey');
    await app.updateComplete;
    expect(document.title).toBe('Camp Details - STAR Camp');

    // Simulate child component setting a dynamic document title
    document.title = 'Odyssey Lunar Base Camp';

    // Trigger an unrelated app re-render
    app.requestUpdate();
    await app.updateComplete;
    expect(document.title).toBe('Odyssey Lunar Base Camp');

    // Trigger a permission update that resolves to the same route title
    permissions = { user: true };
    app.requestUpdate();
    await app.updateComplete;
    expect(document.title).toBe('Odyssey Lunar Base Camp');
  });

  it('updates document.title when permission changes alter RoleRoute pageOptions', async () => {
    let permissions: Record<string, boolean> | undefined = undefined;
    app.getRoutePermissions = () => permissions;
    app.defaultTitle = 'STAR Camp';

    app.routeTrie.set(
      '/admin',
      new RoleRoute(
        ['admin'],
        {
          pageOptions: { title: 'Admin Dashboard' },
          template: html`<div>Admin</div>`,
        },
        () => ({
          pageOptions: { title: 'Access Denied' },
          template: html`<div>Denied</div>`,
        }),
      ),
    );

    app.navigateToPath('/admin');
    await app.updateComplete;
    expect(document.title).toBe('Access Denied - STAR Camp');

    permissions = { admin: true };
    app.requestUpdate();
    await app.updateComplete;
    expect(document.title).toBe('Admin Dashboard - STAR Camp');
  });

  it('redirects normal RedirectRoute to target path and replaces history', async () => {
    app.routerMode = 'path';
    app.defaultTitle = 'STAR Camp';
    app.routeTrie.set('/old', new RedirectRoute('/new'));
    app.routeTrie.set(
      '/new',
      new PublicRoute({
        pageOptions: { title: 'New Page' },
        template: html`<div id="new-view">New</div>`,
      }),
    );

    app.navigateToPath('/old');
    await app.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    await app.updateComplete;

    expect(app.routePath).toBe('/new');
    expect(window.location.pathname).toBe('/new');
    expect(document.title).toBe('New Page - STAR Camp');
  });

  it('redirects role-based RedirectRoute based on permissions and reacts to permission updates', async () => {
    let permissions: Record<string, boolean> | null | undefined = undefined;
    app.getRoutePermissions = () => permissions;
    app.routerMode = 'path';

    app.routeTrie.set(
      '/portal',
      new RedirectRoute(
        {
          admin: '/admin/dashboard',
          staff: '/staff/home',
        },
        {
          rolePriority: ['admin', 'staff'],
        },
      ),
    );
    app.routeTrie.set(
      '/admin/dashboard',
      new PublicRoute({
        pageOptions: { title: 'Admin Dashboard' },
        template: html`<div>Admin</div>`,
      }),
    );
    app.routeTrie.set(
      '/staff/home',
      new PublicRoute({
        pageOptions: { title: 'Staff Home' },
        template: html`<div>Staff</div>`,
      }),
    );

    app.navigateToPath('/portal');
    await app.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    // While permissions are undefined (unauthenticated), stays on /portal
    expect(app.routePath).toBe('/portal');

    // Once staff permissions load, redirects to /staff/home
    permissions = { authenticated: true, staff: true };
    app.requestUpdate();
    await app.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    await app.updateComplete;

    expect(app.routePath).toBe('/staff/home');
  });

  it('interpolates route params in RedirectRoute target paths', async () => {
    app.routerMode = 'path';
    app.routeTrie.set(
      '/camps/{campId}',
      new RedirectRoute('/camps/{campId}/dashboard'),
    );
    app.routeTrie.set(
      '/camps/{campId}/dashboard',
      new PublicRoute({
        pageOptions: { title: 'Camp Dashboard' },
        template: html`<div>Dashboard</div>`,
      }),
    );

    app.navigateToPath('/camps/odyssey');
    await app.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    await app.updateComplete;

    expect(app.routePath).toBe('/camps/odyssey/dashboard');
  });

  it('aborts infinite redirect loops safely', async () => {
    app.routerMode = 'path';
    app.routeTrie.set('/loop-a', new RedirectRoute('/loop-b'));
    app.routeTrie.set('/loop-b', new RedirectRoute('/loop-a'));

    app.navigateToPath('/loop-a');
    for (let i = 0; i < 15; i++) {
      await app.updateComplete;
      await new Promise((r) => setTimeout(r, 0));
    }

    // Should have stopped redirecting without hanging
    expect(['/loop-a', '/loop-b']).toContain(app.routePath);
  });

  describe('dynamic page meta', () => {
    afterEach(() => {
      document.head
        .querySelectorAll('meta, link[rel="canonical"], link[rel="alternate"]')
        .forEach((el) => el.remove());
    });

    it('applies static route meta, merges with defaultMeta, and cleans up unused tags on navigation', async () => {
      app.defaultTitle = 'My App';
      app.defaultMeta = {
        description: 'Default site description',
        og: {
          type: 'website',
          siteName: 'My App',
          image: 'https://example.com/default.jpg',
          imageWidth: 1200,
          imageHeight: 630,
        },
        twitter: {
          card: 'summary_large_image',
        },
      };

      app.routeTrie.set(
        '/promo',
        new PublicRoute({
          pageOptions: {
            title: 'Summer Promo',
            meta: {
              description: 'Special summer offer',
              robots: 'noindex',
              og: {
                image: 'https://example.com/promo.jpg',
              },
            },
          },
          template: html`<div>Promo</div>`,
        }),
      );
      app.routeTrie.set(
        '/faq',
        new PublicRoute({
          pageOptions: { title: 'FAQ' },
          template: html`<div>FAQ</div>`,
        }),
      );

      app.navigateToPath('/promo');
      await app.updateComplete;

      expect(document.title).toBe('Summer Promo - My App');
      expect(
        document.head
          .querySelector('meta[name="description"]')
          ?.getAttribute('content'),
      ).toBe('Special summer offer');
      expect(
        document.head
          .querySelector('meta[name="robots"]')
          ?.getAttribute('content'),
      ).toBe('noindex');
      expect(
        document.head
          .querySelector('meta[property="og:image"]')
          ?.getAttribute('content'),
      ).toBe('https://example.com/promo.jpg');
      expect(
        document.head.querySelector('meta[property="og:image:width"]'),
      ).toBeNull();

      // Navigate to /faq: robots should be cleaned up and defaults restored
      app.navigateToPath('/faq');
      await app.updateComplete;

      expect(document.title).toBe('FAQ - My App');
      expect(
        document.head
          .querySelector('meta[name="description"]')
          ?.getAttribute('content'),
      ).toBe('Default site description');
      expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
      expect(
        document.head
          .querySelector('meta[property="og:image"]')
          ?.getAttribute('content'),
      ).toBe('https://example.com/default.jpg');
      expect(
        document.head
          .querySelector('meta[property="og:image:width"]')
          ?.getAttribute('content'),
      ).toBe('1200');
    });

    it('resolves async route meta and cancels stale requests on navigation', async () => {
      app.defaultTitle = 'My App';
      app.defaultMeta = {
        description: 'Default description',
        og: { type: 'website' },
      };

      let resolveCampMeta!: (val: {
        title: string;
        description: string;
        og: { image: string };
      }) => void;
      let capturedSignal: AbortSignal | undefined;

      app.routeTrie.set(
        '/camp/{campId}',
        new PublicRoute({
          pageOptions: {
            title: 'Camp',
            meta: ({ params, signal }) => {
              capturedSignal = signal;
              return new Promise((resolve) => {
                resolveCampMeta = resolve;
                void params;
              });
            },
          },
          template: html`<div>Camp</div>`,
        }),
      );
      app.routeTrie.set(
        '/about',
        new PublicRoute({
          pageOptions: {
            title: 'About',
            meta: { description: 'About us' },
          },
          template: html`<div>About</div>`,
        }),
      );

      // First navigate to /camp/odyssey and let it resolve
      app.navigateToPath('/camp/odyssey');
      await app.updateComplete;
      expect(document.title).toBe('Camp - My App');
      expect(capturedSignal?.aborted).toBe(false);

      resolveCampMeta({
        title: 'Odyssey Camp | My App',
        description: 'Lunar exploration camp',
        og: { image: 'https://example.com/odyssey.jpg' },
      });
      await new Promise((r) => setTimeout(r, 0));

      expect(document.title).toBe('Odyssey Camp | My App');
      expect(
        document.head
          .querySelector('meta[property="og:description"]')
          ?.getAttribute('content'),
      ).toBe('Lunar exploration camp');
      expect(
        document.head
          .querySelector('meta[property="og:image"]')
          ?.getAttribute('content'),
      ).toBe('https://example.com/odyssey.jpg');

      // Navigate to a second camp, then navigate away before it resolves
      app.navigateToPath('/camp/cadet');
      await app.updateComplete;
      const staleSignal = capturedSignal;
      const staleResolve = resolveCampMeta;

      app.navigateToPath('/about');
      await app.updateComplete;
      expect(staleSignal?.aborted).toBe(true);
      expect(document.title).toBe('About - My App');

      staleResolve({
        title: 'Stale Cadet Camp',
        description: 'Should be ignored',
        og: { image: 'https://example.com/stale.jpg' },
      });
      await new Promise((r) => setTimeout(r, 0));

      expect(document.title).toBe('About - My App');
      expect(
        document.head
          .querySelector('meta[name="description"]')
          ?.getAttribute('content'),
      ).toBe('About us');
      expect(
        document.head.querySelector('meta[property="og:image"]'),
      ).toBeNull();
    });

    it('supports component-level setPageMeta overrides that survive permission updates and clear on navigation', async () => {
      app.defaultTitle = 'STAR Camp';
      app.defaultMeta = {
        description: 'Default STAR Camp',
        og: { type: 'website', image: 'https://example.com/default.jpg' },
      };
      let permissions: Record<string, boolean> | undefined = undefined;
      app.getRoutePermissions = () => permissions;

      app.routeTrie.set(
        '/camp/{campId}',
        new PublicRoute({
          pageOptions: { title: 'Camp Details' },
          template: html`<div>Camp Details</div>`,
        }),
      );
      app.routeTrie.set(
        '/faq',
        new PublicRoute({
          pageOptions: { title: 'FAQ' },
          template: html`<div>FAQ</div>`,
        }),
      );

      app.navigateToPath('/camp/odyssey');
      await app.updateComplete;

      const clearOverride = app.setPageMeta({
        title: 'Odyssey Lunar Base Camp',
        description: 'Build a lunar base',
        og: { image: 'https://example.com/odyssey.jpg' },
      });

      expect(document.title).toBe('Odyssey Lunar Base Camp');
      expect(
        document.head
          .querySelector('meta[property="og:image"]')
          ?.getAttribute('content'),
      ).toBe('https://example.com/odyssey.jpg');

      // Permission change on same route preserves override
      permissions = { admin: false };
      app.requestUpdate();
      await app.updateComplete;
      expect(document.title).toBe('Odyssey Lunar Base Camp');
      expect(
        document.head
          .querySelector('meta[property="og:image"]')
          ?.getAttribute('content'),
      ).toBe('https://example.com/odyssey.jpg');

      // Navigating away clears override automatically; stale clear() is a no-op
      app.navigateToPath('/faq');
      await app.updateComplete;
      clearOverride();

      expect(document.title).toBe('FAQ - STAR Camp');
      expect(
        document.head
          .querySelector('meta[property="og:image"]')
          ?.getAttribute('content'),
      ).toBe('https://example.com/default.jpg');
    });
  });
});
