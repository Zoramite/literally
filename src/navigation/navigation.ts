export const ROUTE_NAVIGATION_EVENT_NAME = 'routeNavigation';

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
    detail: {
      path,
      rootPath: rootPath && rootPath !== '' ? rootPath : undefined,
      openInNewWindow,
    },
  });
}

declare global {
  interface GlobalEventHandlersEventMap {
    routeNavigation: CustomEvent<NavigationEvent>;
  }
}
