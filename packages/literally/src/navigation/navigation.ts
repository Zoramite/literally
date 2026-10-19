import { type TemplateResult } from 'lit';

export const ROUTE_NAVIGATION_EVENT_NAME = 'routeNavigation';

export interface StickySize {
  position: 'top' | 'bottom';
  size: number;
}

/**
 * Allows for adding an app level element arbitrarily.
 * This allows for an element to not be constrained by the container for such
 * things as modals or other full screen elements.
 */
export interface AppElementEvent {
  element: TemplateResult;
}

/**
 * Navigation event for updating path.
 */
export interface NavigationEvent {
  // Path in the app to navigate to. Used as the hash value.
  path: string;
  // Root path to use in the domain. Allows for linking between sub apps.
  rootPath?: string;
  // Should it open in a new tab or window?
  openInNewWindow?: boolean;
}

/**
 * Navigation custom event creation.
 */
export function navigateToPathEvent(
  path: string,
  rootPath?: string,
  openInNewWindow = false,
): CustomEvent<NavigationEvent> {
  return new CustomEvent<NavigationEvent>(ROUTE_NAVIGATION_EVENT_NAME, {
    bubbles: true,
    composed: true,
    cancelable: true,
    detail: {
      path,
      rootPath: rootPath && rootPath !== '' ? rootPath : undefined,
      openInNewWindow,
    },
  });
}

export const ROUTE_BLOCK_NAVIGATION_EVENT_NAME = 'routeBlockNavigation';
export const ROUTE_UNBLOCK_NAVIGATION_EVENT_NAME = 'routeUnblockNavigation';

export interface RouteBlockNavigationEvent {
  key?: string;
}

/**
 * Event creation for blocking route navigation.
 */
export function blockNavigationEvent(
  key?: string,
): CustomEvent<RouteBlockNavigationEvent> {
  return new CustomEvent<RouteBlockNavigationEvent>(
    ROUTE_BLOCK_NAVIGATION_EVENT_NAME,
    {
      bubbles: true,
      composed: true,
      detail: { key },
    },
  );
}

/**
 * Event creation for unblocking route navigation.
 */
export function unblockNavigationEvent(
  key?: string,
): CustomEvent<RouteBlockNavigationEvent> {
  return new CustomEvent<RouteBlockNavigationEvent>(
    ROUTE_UNBLOCK_NAVIGATION_EVENT_NAME,
    {
      bubbles: true,
      composed: true,
      detail: { key },
    },
  );
}

declare global {
  interface GlobalEventHandlersEventMap {
    routeNavigation: CustomEvent<NavigationEvent>;
    routeBlockNavigation: CustomEvent<RouteBlockNavigationEvent>;
    routeUnblockNavigation: CustomEvent<RouteBlockNavigationEvent>;
    stickySizeUpdate: CustomEvent<StickySize>;
    appElement: CustomEvent<AppElementEvent>;
  }
}
