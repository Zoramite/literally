import { consume, provide } from '@lit/context';
import { LitElement, type PropertyValueMap } from 'lit';
import { property, state } from 'lit/decorators.js';

import { type Constructor } from '../mixins/mixin';
import {
  type NavigationEvent,
  ROUTE_NAVIGATION_EVENT_NAME,
} from '../navigation/navigation';
import { routeTrieContext, routeTrieMatchContext } from './context';
import { type PageRoute } from './route';
import { RouteTrie, type RouteTrieMatchValue } from './router';

export const ROUTE_TRIE_SET_EVENT_NAME = 'routeTrieSetRoute';

/**
 * Set a route value event.
 */
export interface RouteSetEvent<Type> {
  path: string;
  value: Type;
}

export interface RouterInterface {
  routeTrieMatch: RouteTrieMatchValue<PageRoute> | undefined;
  routeTrie: RouteTrie<PageRoute>;
  routePath: string;
  routerMode: 'hash' | 'path';
  rootPath: string;
}

export interface RouteMatchInterface {
  routeMatch: RouteTrieMatchValue<PageRoute> | undefined;
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

    @state()
    routePath = '';

    @provide({ context: routeTrieMatchContext })
    @state()
    routeTrieMatch: RouteTrieMatchValue<PageRoute> | undefined;

    @provide({ context: routeTrieContext })
    routeTrie = new RouteTrie<PageRoute>();

    connectedCallback(): void {
      super.connectedCallback();

      // Listen for updating routes.
      this.addEventListener(
        ROUTE_TRIE_SET_EVENT_NAME,
        this.handleRouteChange.bind(this),
      );

      // Update the match whenever the trie routes are updated.
      this.routeTrie.addCallback(() => {
        this.updateRouteTrieMatch();
      });

      // Determine the initial path based on the url of the page.
      if (this.currentRoutePath !== undefined) {
        this.routePath = this.currentRoutePath;
      }

      // Listen for route navigation.
      this.addEventListener(
        ROUTE_NAVIGATION_EVENT_NAME,
        this.handleNavigation.bind(this),
      );

      // Add pop state listener for navigation.
      window.addEventListener('popstate', (event: PopStateEvent) => {
        const nextPath = event.state?.path ?? this.currentRoutePath ?? '';
        if (this.routePath !== nextPath) {
          this.routePath = nextPath;
          this.updateRouteTrieMatch();
        }
      });

      // Add listener for anchor changes
      window.addEventListener('hashchange', () => {
        if (this.routerMode === 'hash') {
          const newPath = this.currentRoutePath ?? '';

          if (this.routePath !== newPath) {
            this.routePath = newPath;
            this.updateRouteTrieMatch();
          }
        }
      });
    }

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

    handleNavigation(evt: CustomEvent<NavigationEvent>) {
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
    }
  }
  return RouterElement as Constructor<RouterInterface> & T;
};

declare global {
  interface GlobalEventHandlersEventMap {
    routeTrieSetRoute: CustomEvent<RouteSetEvent<PageRoute>>;
  }
}
