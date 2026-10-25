// @vitest-environment jsdom
import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { LazyRoute, PublicRoute } from '../routing/route';
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
});
