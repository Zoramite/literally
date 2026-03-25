import { LitElement, PropertyValueMap, TemplateResult, html } from 'lit';

import { Constructor } from '../mixins/mixin';
import { RouteTrie, RouteTrieMatchValue } from './router';
import { state } from 'lit/decorators.js';
import { provide } from '@lit/context';
import { routeTrieContext, routeTrieMatchContext } from './context';

/**
 * Navigation event for updating path.
 */
export interface NavigationEvent {
  path: string;
}

/**
 * Set a route value event.
 */
export interface RouteSetEvent<Type> {
  path: string;
  value: Type;
}

export interface PageRoute {
  pageOptions?: {
    print?: {
      hideTitle?: boolean;
      largeTitle?: boolean;
    };
  };
  template: TemplateResult;
}

export const ROUTE_TRIE_SET_EVENT_NAME = 'routeTrieSetRoute';
export const ROUTE_NAVIGATION_EVENT_NAME = 'routeNavigation';

interface RouterInterface {
  routeTrieMatch: RouteTrieMatchValue<PageRoute> | undefined;
  routeTrie: RouteTrie<PageRoute>;
  routePath: string;
  renderCurrentRoute: () => TemplateResult;
}

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
    }

    get currentHash() {
      if (window.location.hash) {
        return window.location.hash.slice(1);
      }

      return undefined;
    }

    handleNavigation(evt: CustomEvent<NavigationEvent>) {
      this.routePath = evt.detail.path;

      // Push the new location to the history.
      history.pushState(evt.detail, '', `#${this.routePath}`);
    }

    handleRouteChange(evt: CustomEvent<RouteSetEvent<PageRoute>>) {
      // Allow nesting of routers by stopping propagation.
      evt.stopPropagation();

      // Set and overwite the route.
      this.routeTrie.set(evt.detail.path, evt.detail.value);
    }

    renderCurrentRoute() {
      // No route matched, nothing to show.
      if (!this.routeTrieMatch?.value?.template) {
        return html``;
      }

      // Return the template result from the route
      return this.routeTrieMatch.value.template;
    }

    protected willUpdate(changedProperties: PropertyValueMap<this>): void {
      if (changedProperties.has('routePath')) {
        // Update the matched route when the path has changed.
        this.updateRouteTrieMatch();
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
    routeNavigation: CustomEvent<NavigationEvent>;
  }
}
