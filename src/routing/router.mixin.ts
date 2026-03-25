import { consume, provide } from '@lit/context';
import { LitElement, PropertyValueMap, TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';

import { Constructor } from '../mixins/mixin';
import {
  NavigationEvent,
  ROUTE_NAVIGATION_EVENT_NAME,
} from '../navigation/navigation';
import { routeTrieContext, routeTrieMatchContext } from './context';
import { RouteTrie, RouteTrieMatchValue } from './router';

export const ROUTE_TRIE_SET_EVENT_NAME = 'routeTrieSetRoute';

/**
 * Set a route value event.
 */
export interface RouteSetEvent<Type> {
  path: string;
  value: Type;
}

export interface DefaultPageOptions {
  // Title of the page used to update the browser title.
  title?: string;
}

export interface PageDetails {
  pageOptions?: DefaultPageOptions;
  template: TemplateResult;
}

export interface PageRoute {
  // If no permissions provided it is considered looking for a public page.
  // If no result it is considered a permission error.
  content: (
    permissions?: Record<string, boolean> | null,
  ) => PageDetails | undefined;
}

interface RouterInterface {
  routeTrieMatch: RouteTrieMatchValue<PageRoute> | undefined;
  routeTrie: RouteTrie<PageRoute>;
  routePath: string;
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

      // Determine the initial path based on the url hash of the page.
      if (this.currentHash) {
        this.routePath = this.currentHash;
      }

      // Listen for route navigation.
      this.addEventListener(
        ROUTE_NAVIGATION_EVENT_NAME,
        this.handleNavigation.bind(this),
      );

      // Add pop state listener for navigation.
      window.addEventListener('popstate', (event: PopStateEvent) => {
        if (event.state?.path) {
          this.routePath = event.state.path;
          this.updateRouteTrieMatch();
        }
      });

      // Add listener for anchor changes
      window.addEventListener('hashchange', () => {
        const newPath = this.currentHash;

        if (newPath && this.routePath !== newPath) {
          this.routePath = newPath;
          this.updateRouteTrieMatch();
        }
      });
    }

    get currentHash() {
      if (window.location.hash) {
        return window.location.hash.slice(1);
      }

      return undefined;
    }

    handleNavigation(evt: CustomEvent<NavigationEvent>) {
      const currentUrl = new URL(window.location.href);
      const nextUrl = new URL(window.location.href);
      nextUrl.hash = evt.detail.path;

      // Check if we are moving to a different root path.
      if (evt.detail.rootPath) {
        const currentRootPath = currentUrl.pathname;

        if (currentRootPath !== evt.detail.rootPath) {
          nextUrl.pathname = evt.detail.rootPath;
        }
      }

      // Check for new window triggering.
      if (evt.detail.openInNewWindow) {
        window.open(nextUrl.toString(), '_blank');
        return;
      }

      // Do a full redirect if the paths have changed.
      if (currentUrl.pathname !== nextUrl.pathname) {
        window.location.href = nextUrl.toString();
        return;
      }

      // Handle internally, no full redirection
      this.routePath = nextUrl.hash.slice(1);
      history.pushState(evt.detail, '', nextUrl.hash);
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
