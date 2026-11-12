// @vitest-environment jsdom
import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  LazyRoute,
  type PageDetails,
  type PageRoute,
  PublicRoute,
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
});
