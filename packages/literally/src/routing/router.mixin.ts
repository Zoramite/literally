import { consume, provide } from '@lit/context';
import { LitElement, type PropertyValueMap } from 'lit';
import { property, state } from 'lit/decorators.js';

import { type Constructor } from '../mixins/mixin';
import {
  type NavigationEvent,
  ROUTE_BLOCK_NAVIGATION_EVENT_NAME,
  ROUTE_NAVIGATION_EVENT_NAME,
  ROUTE_UNBLOCK_NAVIGATION_EVENT_NAME,
  type RouteBlockNavigationEvent,
  navigateToPathEvent,
} from '../navigation/navigation';
import {
  routeTrieContext,
  routeTrieMatchContext,
  routerContext,
} from './context';
import { type PageRoute } from './route';
import { RouteTrie, type RouteTrieMatchValue } from './router';

export const ROUTE_TRIE_SET_EVENT_NAME = 'routeTrieSetRoute';
export const NAVIGATION_BLOCKED_EVENT_NAME = 'navigationBlocked';
export const DEFAULT_BLOCK_KEY = '_default_';

/**
 * Set a route value event.
 */
export interface RouteSetEvent<Type> {
  path: string;
  value: Type;
}

export interface NavigationBlockedDetail {
  path: string;
  rootPath?: string;
  openInNewWindow?: boolean;
  source: 'navigationEvent' | 'popstate' | 'hashchange' | 'navigateToPath';
  blockedKeys: string[];
  retry: () => boolean;
}

export type NavigationBlockedCallback = (
  detail: NavigationBlockedDetail,
) => void;

export interface RouterInterface {
  routeTrieMatch: RouteTrieMatchValue<PageRoute> | undefined;
  routeTrie: RouteTrie<PageRoute>;
  routePath: string;
  routerMode: 'hash' | 'path';
  rootPath: string;

  navigationBlockedCallback?: NavigationBlockedCallback;

  addNavigationBlockedCallback(callback: NavigationBlockedCallback): () => void;
  removeNavigationBlockedCallback(callback: NavigationBlockedCallback): void;

  isNavigationBlocked(key?: string): boolean;
  startBlocking(key?: string): () => void;
  stopBlocking(key?: string): void;
  clearNavigationBlocking(key?: string): void;
  getBlockedNavigationKeys(): string[];

  wrapBlocking<T>(fn: () => T, key?: string): T;
  wrapAsyncBlocking<T>(fn: () => Promise<T>, key?: string): Promise<T>;

  navigateToPath(
    path: string,
    rootPath?: string,
    openInNewWindow?: boolean,
  ): boolean;

  updatePageTitle(title?: string): void;
}

export interface RouteMatchInterface {
  routeMatch: RouteTrieMatchValue<PageRoute> | undefined;
}

export interface RouterConsumerInterface {
  router: RouterInterface | undefined;
}

/**
 * Mixin for adding a route match consumer.
 */
export const RouteMatchConsumerMixin = <T extends Constructor<LitElement>>(
  superClass: T,
) => {
  class RouteMatchElement extends superClass {
    static styles = [(superClass as unknown as typeof LitElement).styles ?? []];

    @consume({ context: routeTrieMatchContext, subscribe: true })
    @state()
    routeMatch: RouteTrieMatchValue<PageRoute> | undefined;
  }
  return RouteMatchElement as Constructor<RouteMatchInterface> & T;
};

/**
 * Mixin for adding a router consumer.
 */
export const RouterConsumerMixin = <T extends Constructor<LitElement>>(
  superClass: T,
) => {
  class RouterConsumerElement extends superClass {
    static styles = [(superClass as unknown as typeof LitElement).styles ?? []];

    @consume({ context: routerContext, subscribe: true })
    @state()
    router: RouterInterface | undefined;
  }
  return RouterConsumerElement as Constructor<RouterConsumerInterface> & T;
};

/**
 * Mixin for adding router functionality to a component.
 */
export const RouterMixin = <T extends Constructor<LitElement>>(
  superClass: T,
) => {
  class RouterElement extends superClass {
    static styles = [(superClass as unknown as typeof LitElement).styles ?? []];

    @property({ type: String, attribute: 'router-mode' })
    routerMode: 'hash' | 'path' = 'hash';

    @property({ type: String, attribute: 'root-path' })
    rootPath = '';

    @property({ attribute: false })
    navigationBlockedCallback?: NavigationBlockedCallback;

    @state()
    routePath = '';

    @provide({ context: routeTrieMatchContext })
    @state()
    routeTrieMatch: RouteTrieMatchValue<PageRoute> | undefined;

    @provide({ context: routeTrieContext })
    routeTrie = new RouteTrie<PageRoute>();

    @provide({ context: routerContext })
    router: RouterInterface = this as unknown as RouterInterface;

    private blockingCounts = new Map<string, number>();
    private navigationBlockedCallbacks = new Set<NavigationBlockedCallback>();

    connectedCallback(): void {
      super.connectedCallback();

      // Listen for updating routes.
      this.addEventListener(
        ROUTE_TRIE_SET_EVENT_NAME,
        this.onRouteTrieSetRoute,
      );

      // Listen for route navigation.
      this.addEventListener(
        ROUTE_NAVIGATION_EVENT_NAME,
        this.handleNavigationEvent,
      );

      // Listen for route blocking events.
      this.addEventListener(
        ROUTE_BLOCK_NAVIGATION_EVENT_NAME,
        this.handleBlockNavigation,
      );
      this.addEventListener(
        ROUTE_UNBLOCK_NAVIGATION_EVENT_NAME,
        this.handleUnblockNavigation,
      );

      // Update the match whenever the trie routes are updated.
      this.routeTrie.addCallback(() => {
        this.updateRouteTrieMatch();
      });

      // Determine the initial path based on the url of the page.
      if (this.currentRoutePath !== undefined) {
        this.routePath = this.currentRoutePath;
      }

      // Add pop state listener for navigation.
      window.addEventListener('popstate', this.handlePopState);

      // Add listener for anchor changes
      window.addEventListener('hashchange', this.handleHashChange);
    }

    disconnectedCallback(): void {
      super.disconnectedCallback();

      this.removeEventListener(
        ROUTE_TRIE_SET_EVENT_NAME,
        this.onRouteTrieSetRoute,
      );
      this.removeEventListener(
        ROUTE_NAVIGATION_EVENT_NAME,
        this.handleNavigationEvent,
      );
      this.removeEventListener(
        ROUTE_BLOCK_NAVIGATION_EVENT_NAME,
        this.handleBlockNavigation,
      );
      this.removeEventListener(
        ROUTE_UNBLOCK_NAVIGATION_EVENT_NAME,
        this.handleUnblockNavigation,
      );

      window.removeEventListener('popstate', this.handlePopState);
      window.removeEventListener('hashchange', this.handleHashChange);
    }

    private onRouteTrieSetRoute = (
      evt: CustomEvent<RouteSetEvent<PageRoute>>,
    ) => {
      this.handleRouteChange(evt);
    };

    private handleNavigationEvent = (evt: CustomEvent<NavigationEvent>) => {
      this.handleNavigation(evt);
    };

    private handleBlockNavigation = (
      evt: CustomEvent<RouteBlockNavigationEvent>,
    ) => {
      this.startBlocking(evt.detail?.key);
    };

    private handleUnblockNavigation = (
      evt: CustomEvent<RouteBlockNavigationEvent>,
    ) => {
      this.stopBlocking(evt.detail?.key);
    };

    private handlePopState = (event: PopStateEvent) => {
      if (this.routerMode === 'path') {
        const nextPath = event.state?.path ?? this.currentRoutePath ?? '';
        if (this.routePath !== nextPath) {
          if (this.isNavigationBlocked()) {
            this.handleNavigationBlocked({
              path: nextPath,
              source: 'popstate',
              blockedKeys: this.getBlockedNavigationKeys(),
              retry: () => this.navigateToPath(nextPath),
            });
            const currentUrl = (this.rootPath || '') + this.routePath;
            history.pushState({ path: this.routePath }, '', currentUrl || '/');
            return;
          }
          this.routePath = nextPath;
          this.updateRouteTrieMatch();
        }
      }
    };

    private handleHashChange = () => {
      if (this.routerMode === 'hash') {
        const newPath = this.currentRoutePath ?? '';

        if (this.routePath !== newPath) {
          if (this.isNavigationBlocked()) {
            this.handleNavigationBlocked({
              path: newPath,
              source: 'hashchange',
              blockedKeys: this.getBlockedNavigationKeys(),
              retry: () => this.navigateToPath(newPath),
            });
            window.location.hash = this.routePath ? '#' + this.routePath : '';
            return;
          }
          this.routePath = newPath;
          this.updateRouteTrieMatch();
        }
      }
    };

    get currentRoutePath() {
      if (this.routerMode === 'hash') {
        if (window.location.hash) {
          return window.location.hash.slice(1);
        }
        return undefined;
      } else {
        let path = window.location.pathname;
        if (this.rootPath && path.startsWith(this.rootPath)) {
          path = path.slice(this.rootPath.length);
        }
        return path;
      }
    }

    isNavigationBlocked(key?: string): boolean {
      if (key !== undefined) {
        return (this.blockingCounts.get(key) ?? 0) > 0;
      }
      return this.blockingCounts.size > 0;
    }

    startBlocking(key = DEFAULT_BLOCK_KEY): () => void {
      this.blockingCounts.set(key, (this.blockingCounts.get(key) ?? 0) + 1);
      this.requestUpdate();
      let stopped = false;
      return () => {
        if (!stopped) {
          stopped = true;
          this.stopBlocking(key);
        }
      };
    }

    stopBlocking(key = DEFAULT_BLOCK_KEY): void {
      const currentCount = this.blockingCounts.get(key) ?? 0;
      if (currentCount <= 1) {
        this.blockingCounts.delete(key);
      } else {
        this.blockingCounts.set(key, currentCount - 1);
      }
      this.requestUpdate();
    }

    clearNavigationBlocking(key?: string): void {
      if (key !== undefined) {
        this.blockingCounts.delete(key);
      } else {
        this.blockingCounts.clear();
      }
      this.requestUpdate();
    }

    getBlockedNavigationKeys(): string[] {
      return Array.from(this.blockingCounts.keys());
    }

    wrapBlocking<T>(fn: () => T, key = DEFAULT_BLOCK_KEY): T {
      const unblock = this.startBlocking(key);
      try {
        const result = fn();
        if (
          result &&
          typeof (result as unknown as Promise<unknown>).then === 'function'
        ) {
          return (result as unknown as Promise<unknown>).finally(() => {
            unblock();
          }) as unknown as T;
        }
        unblock();
        return result;
      } catch (err) {
        unblock();
        throw err;
      }
    }

    async wrapAsyncBlocking<T>(
      fn: () => Promise<T>,
      key = DEFAULT_BLOCK_KEY,
    ): Promise<T> {
      const unblock = this.startBlocking(key);
      try {
        return await fn();
      } finally {
        unblock();
      }
    }

    addNavigationBlockedCallback(
      callback: NavigationBlockedCallback,
    ): () => void {
      this.navigationBlockedCallbacks.add(callback);
      return () => {
        this.removeNavigationBlockedCallback(callback);
      };
    }

    removeNavigationBlockedCallback(callback: NavigationBlockedCallback): void {
      this.navigationBlockedCallbacks.delete(callback);
    }

    handleNavigationBlocked(detail: NavigationBlockedDetail): void {
      if (this.navigationBlockedCallback) {
        this.navigationBlockedCallback(detail);
      }
      for (const callback of this.navigationBlockedCallbacks) {
        callback(detail);
      }
      this.dispatchEvent(
        new CustomEvent<NavigationBlockedDetail>(
          NAVIGATION_BLOCKED_EVENT_NAME,
          {
            bubbles: true,
            composed: true,
            detail,
          },
        ),
      );
    }

    navigateToPath(
      path: string,
      rootPath?: string,
      openInNewWindow = false,
    ): boolean {
      if (this.isNavigationBlocked()) {
        this.handleNavigationBlocked({
          path,
          rootPath,
          openInNewWindow,
          source: 'navigateToPath',
          blockedKeys: this.getBlockedNavigationKeys(),
          retry: () => this.navigateToPath(path, rootPath, openInNewWindow),
        });
        return false;
      }

      const evt = navigateToPathEvent(path, rootPath, openInNewWindow);
      this.dispatchEvent(evt);
      return !evt.defaultPrevented;
    }

    handleNavigation(evt: CustomEvent<NavigationEvent>) {
      if (this.isNavigationBlocked()) {
        evt.preventDefault();
        this.handleNavigationBlocked({
          path: evt.detail.path,
          rootPath: evt.detail.rootPath,
          openInNewWindow: evt.detail.openInNewWindow,
          source: 'navigationEvent',
          blockedKeys: this.getBlockedNavigationKeys(),
          retry: () =>
            this.navigateToPath(
              evt.detail.path,
              evt.detail.rootPath,
              evt.detail.openInNewWindow,
            ),
        });
        return;
      }

      const nextUrl = new URL(window.location.href);

      const isDifferentRoot =
        evt.detail.rootPath !== undefined &&
        evt.detail.rootPath !== this.rootPath;
      const targetRootPath = evt.detail.rootPath ?? this.rootPath;

      if (this.routerMode === 'hash') {
        nextUrl.hash = evt.detail.path;
        if (isDifferentRoot) {
          nextUrl.pathname = targetRootPath;
        }
      } else {
        let constructedPath = targetRootPath;
        if (constructedPath.endsWith('/') && evt.detail.path.startsWith('/')) {
          constructedPath += evt.detail.path.slice(1);
        } else if (
          !constructedPath.endsWith('/') &&
          !evt.detail.path.startsWith('/') &&
          evt.detail.path !== ''
        ) {
          constructedPath += '/' + evt.detail.path;
        } else {
          constructedPath += evt.detail.path;
        }

        const pathUrl = new URL(constructedPath, window.location.origin);
        nextUrl.pathname = pathUrl.pathname;
        nextUrl.search = pathUrl.search;
        nextUrl.hash = pathUrl.hash;
      }

      // Check for new window triggering.
      if (evt.detail.openInNewWindow) {
        window.open(nextUrl.toString(), '_blank');
        return;
      }

      // Do a full redirect if the root paths have changed.
      if (isDifferentRoot) {
        window.location.href = nextUrl.toString();
        return;
      }

      // Handle internally, no full redirection
      if (this.routerMode === 'hash') {
        this.routePath = nextUrl.hash.slice(1);
      } else {
        let routePath = nextUrl.pathname;
        if (this.rootPath && routePath.startsWith(this.rootPath)) {
          routePath = routePath.slice(this.rootPath.length);
        }
        this.routePath = routePath;
      }

      history.pushState(evt.detail, '', nextUrl.toString());
    }

    handleRouteChange(evt: CustomEvent<RouteSetEvent<PageRoute>>) {
      // Allow nesting of routers by stopping propagation.
      evt.stopPropagation();

      // Set and overwite the route.
      this.routeTrie.set(evt.detail.path, evt.detail.value);
    }

    protected willUpdate(changedProperties: PropertyValueMap<this>): void {
      if (changedProperties.has('routePath')) {
        // Update the matched route when the path has changed.
        this.updateRouteTrieMatch();

        // Scroll to the top of the page on path change.
        window.scrollTo({
          top: 0,
          // Not smooth, so that it happens instantly.
          behavior: 'instant',
        });
      }
    }

    updateRouteTrieMatch() {
      this.routeTrieMatch = this.routeTrie.match(this.routePath);
      console.debug('Route changed', this.routeTrieMatch?.path);
      this.updatePageTitle();
    }

    updatePageTitle(title?: string): void {
      if (typeof document === 'undefined') {
        return;
      }

      if (title !== undefined) {
        document.title = title;
        return;
      }

      const routeMatch = this.routeTrieMatch?.value;
      const defaultTitle = this.routeTrie.defaultTitle;

      let pageTitle: string | undefined;
      if (routeMatch) {
        const pageOptions =
          typeof routeMatch.pageOptions === 'function'
            ? routeMatch.pageOptions()
            : routeMatch.pageOptions;

        if (pageOptions?.title) {
          pageTitle = pageOptions.title;
        }
      }

      if (pageTitle && defaultTitle) {
        document.title = `${pageTitle} - ${defaultTitle}`;
      } else if (pageTitle) {
        document.title = pageTitle;
      } else if (defaultTitle && document.title !== defaultTitle) {
        document.title = defaultTitle;
      }
    }
  }
  return RouterElement as Constructor<RouterInterface> & T;
};

declare global {
  interface GlobalEventHandlersEventMap {
    routeTrieSetRoute: CustomEvent<RouteSetEvent<PageRoute>>;
    navigationBlocked: CustomEvent<NavigationBlockedDetail>;
  }
}
