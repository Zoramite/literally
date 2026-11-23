import { type TemplateResult, html } from 'lit';

import { type RouteTrieParamValue } from './router';

export type PageTitleResolver = string | (() => string);

export interface DefaultPageOptions {
  // Title of the page used to update the browser title.
  title?: PageTitleResolver;
  // Optional translation key for localized page titles.
  titleKey?: string;
  [key: string]: unknown;
}

export interface RedirectTarget {
  path: string;
  rootPath?: string;
  /**
   * Whether to replace the current history entry instead of pushing a new one.
   * Defaults to true for redirects.
   */
  replace?: boolean;
}

export interface PageDetails {
  pageOptions?: DefaultPageOptions;
  template: TemplateResult;
  redirect?: RedirectTarget;
}

export type PageDetailsResolver = (
  permissions?: Record<string, boolean> | null,
) => PageDetails | Promise<PageDetails>;

export type PageRouteValue = PageDetails | PageDetailsResolver;

/**
 * Resolves a PageRouteValue (either a static PageDetails or a resolver function).
 */
export function resolvePageDetails(
  value?: PageRouteValue,
  permissions?: Record<string, boolean> | null,
): PageDetails | Promise<PageDetails> | undefined {
  if (value === undefined) {
    return undefined;
  }
  return typeof value === 'function' ? value(permissions) : value;
}

/**
 * Resolves the page options from a route if available, without executing the content loader.
 */
export function getRoutePageOptions(
  route?: PageRoute,
  permissions?: Record<string, boolean> | null,
): DefaultPageOptions | undefined {
  if (!route) {
    return undefined;
  }
  if (typeof route.getPageOptions === 'function') {
    return route.getPageOptions(permissions);
  }
  if (typeof route.pageOptions === 'function') {
    return route.pageOptions(permissions);
  }
  return route.pageOptions;
}

export interface PageRoute {
  /**
   * Optional page options/metadata available upfront without executing the content loader.
   */
  pageOptions?:
    | DefaultPageOptions
    | ((
        permissions?: Record<string, boolean> | null,
      ) => DefaultPageOptions | undefined);

  /**
   * Optional permission-aware page options accessor without executing dynamic content loaders.
   */
  getPageOptions?: (
    permissions?: Record<string, boolean> | null,
  ) => DefaultPageOptions | undefined;

  /**
   * If no permissions provided it is considered looking for a public page.
   * If no result it is considered a permission error.
   */
  content: (
    permissions?: Record<string, boolean> | null,
  ) => PageDetails | Promise<PageDetails> | undefined;
}

/**
 * Public route, simple pass through with no permission checking.
 * Supports static PageDetails or dynamic resolver functions for code-splitting.
 */
export class PublicRoute implements PageRoute {
  private _pageOptions?: DefaultPageOptions;

  constructor(
    public value: PageRouteValue,
    pageOptions?: DefaultPageOptions,
  ) {
    this._pageOptions = pageOptions;
  }

  get pageOptions(): DefaultPageOptions | undefined {
    if (this._pageOptions) {
      return this._pageOptions;
    }
    if (typeof this.value !== 'function') {
      return this.value.pageOptions;
    }
    return undefined;
  }

  content(
    permissions?: Record<string, boolean> | null,
  ): PageDetails | Promise<PageDetails> | undefined {
    return resolvePageDetails(this.value, permissions);
  }
}

export interface LazyRouteConfig {
  pageOptions?: DefaultPageOptions;
  /**
   * Dynamic import trigger (e.g. () => import('./my-page')).
   */
  loader: () => Promise<unknown> | void;
  /**
   * Template factory called to produce the Lit template.
   */
  template: (module?: unknown) => TemplateResult;
  /**
   * If true, content() returns a Promise<PageDetails> that awaits loader().
   * If false (default), content() triggers loader() asynchronously and returns
   * template() immediately, leveraging Web Components in-place upgrade.
   */
  async?: boolean;
}

/**
 * Lazy route for code-splitting page components.
 *
 * When async is false (default), triggers the loader function and renders
 * the template immediately so that the Web Component upgrades in place when the
 * module finishes loading.
 *
 * When async is true, returns a Promise that awaits the module before rendering.
 */
export class LazyRoute implements PageRoute {
  constructor(public config: LazyRouteConfig) {}

  get pageOptions(): DefaultPageOptions | undefined {
    return this.config.pageOptions;
  }

  content(): PageDetails | Promise<PageDetails> {
    if (this.config.async) {
      return Promise.resolve(this.config.loader()).then((mod) => ({
        pageOptions: this.config.pageOptions,
        template: this.config.template(mod),
      }));
    }

    try {
      this.config.loader();
    } catch (err) {
      console.error('Failed to execute route loader:', err);
    }

    return {
      pageOptions: this.config.pageOptions,
      template: this.config.template(),
    };
  }
}

/**
 * Route guard that requires the user to be authenticated and have at least one allowed role.
 * Supports static PageDetails or dynamic resolver functions.
 */
export class RoleRoute implements PageRoute {
  private _pageOptions?: DefaultPageOptions;

  constructor(
    public allowedRoles: string[],
    public value: PageRouteValue,
    public customFallback?: (
      reason: 'unauthenticated' | 'forbidden',
    ) => PageRouteValue,
    pageOptions?: DefaultPageOptions,
  ) {
    this._pageOptions = pageOptions;
  }

  get pageOptions(): DefaultPageOptions | undefined {
    if (this._pageOptions) {
      return this._pageOptions;
    }
    if (typeof this.value !== 'function') {
      return this.value.pageOptions;
    }
    return undefined;
  }

  getPageOptions(
    permissions?: Record<string, boolean> | null,
  ): DefaultPageOptions | undefined {
    const isAuthenticated = permissions && (permissions.authenticated ?? true);
    if (!permissions || !isAuthenticated) {
      const fallback = this.customFallback?.('unauthenticated');
      return fallback && typeof fallback !== 'function'
        ? fallback.pageOptions
        : undefined;
    }

    const hasAllowedRole = this.allowedRoles.some((role) =>
      Boolean(permissions[role]),
    );
    if (!hasAllowedRole) {
      const fallback = this.customFallback?.('forbidden');
      return fallback && typeof fallback !== 'function'
        ? fallback.pageOptions
        : undefined;
    }

    return this.pageOptions;
  }

  content(
    permissions?: Record<string, boolean> | null,
  ): PageDetails | Promise<PageDetails> | undefined {
    // 1. Check if user is authenticated
    const isAuthenticated = permissions && (permissions.authenticated ?? true);
    if (!permissions || !isAuthenticated) {
      if (this.customFallback) {
        return resolvePageDetails(
          this.customFallback('unauthenticated'),
          permissions,
        );
      }
      return undefined;
    }

    // 2. Check if user has any of the allowed roles
    const hasAllowedRole = this.allowedRoles.some((role) =>
      Boolean(permissions[role]),
    );

    if (!hasAllowedRole) {
      if (this.customFallback) {
        return resolvePageDetails(
          this.customFallback('forbidden'),
          permissions,
        );
      }
      return undefined;
    }

    return resolvePageDetails(this.value, permissions);
  }
}

export interface RoleSwitchRouteOptions {
  rolePriority?: string[];
  fallbackRole?: string;
  customFallback?: (reason: 'unauthenticated' | 'forbidden') => PageRouteValue;
  pageOptions?: DefaultPageOptions;
}

/**
 * Route guard that selects and returns different PageDetails based on the user's role.
 * Checks roles in order of priority (defaulting to the keys of rolePages).
 */
export class RoleSwitchRoute implements PageRoute {
  constructor(
    public rolePages: Partial<Record<string, PageRouteValue>>,
    public options?: RoleSwitchRouteOptions,
  ) {}

  get pageOptions(): DefaultPageOptions | undefined {
    return this.options?.pageOptions;
  }

  getPageOptions(
    permissions?: Record<string, boolean> | null,
  ): DefaultPageOptions | undefined {
    const isAuthenticated = permissions && (permissions.authenticated ?? true);
    if (!permissions || !isAuthenticated) {
      const fallback = this.options?.customFallback?.('unauthenticated');
      return fallback && typeof fallback !== 'function'
        ? fallback.pageOptions
        : undefined;
    }

    const priority = this.options?.rolePriority ?? Object.keys(this.rolePages);
    for (const role of priority) {
      const pageVal = this.rolePages[role];
      if (permissions[role] && pageVal) {
        if (typeof pageVal !== 'function' && pageVal.pageOptions) {
          return this.options?.pageOptions
            ? { ...this.options.pageOptions, ...pageVal.pageOptions }
            : pageVal.pageOptions;
        }
        return this.options?.pageOptions;
      }
    }

    if (this.options?.fallbackRole) {
      const fallbackVal = this.rolePages[this.options.fallbackRole];
      if (fallbackVal) {
        if (typeof fallbackVal !== 'function' && fallbackVal.pageOptions) {
          return this.options?.pageOptions
            ? { ...this.options.pageOptions, ...fallbackVal.pageOptions }
            : fallbackVal.pageOptions;
        }
        return this.options?.pageOptions;
      }
    }

    const fallback = this.options?.customFallback?.('forbidden');
    return fallback && typeof fallback !== 'function'
      ? fallback.pageOptions
      : undefined;
  }

  content(
    permissions?: Record<string, boolean> | null,
  ): PageDetails | Promise<PageDetails> | undefined {
    // 1. Check if user is authenticated
    const isAuthenticated = permissions && (permissions.authenticated ?? true);
    if (!permissions || !isAuthenticated) {
      if (this.options?.customFallback) {
        return resolvePageDetails(
          this.options.customFallback('unauthenticated'),
          permissions,
        );
      }
      return undefined;
    }

    // 2. Check roles in priority order
    const priority = this.options?.rolePriority ?? Object.keys(this.rolePages);
    for (const role of priority) {
      const pageVal = this.rolePages[role];
      if (permissions[role] && pageVal) {
        return resolvePageDetails(pageVal, permissions);
      }
    }

    // 3. Fallback role if configured
    if (this.options?.fallbackRole) {
      const fallbackVal = this.rolePages[this.options.fallbackRole];
      if (fallbackVal) {
        return resolvePageDetails(fallbackVal, permissions);
      }
    }

    if (this.options?.customFallback) {
      return resolvePageDetails(
        this.options.customFallback('forbidden'),
        permissions,
      );
    }

    return undefined;
  }
}

export type RedirectDestination = string | RedirectTarget;

export type RedirectResolver = (
  permissions?: Record<string, boolean> | null,
) => RedirectDestination | undefined;

export type RoleRedirectMap = Partial<Record<string, RedirectDestination>>;

export type RedirectRouteTarget =
  | RedirectDestination
  | RedirectResolver
  | RoleRedirectMap;

export interface RedirectRouteOptions {
  /**
   * Order in which roles are checked when using a role-based redirect map.
   * Defaults to the key order of the role map.
   */
  rolePriority?: string[];
  /**
   * Role key in the role map to use if the authenticated user has none of the
   * configured roles.
   */
  fallbackRole?: string;
  /**
   * Destination to redirect to when the user is authenticated but has no
   * matching role (and no fallbackRole matched).
   */
  fallback?: RedirectDestination;
  /**
   * Destination to redirect to when the user is unauthenticated.
   * If omitted, returns undefined so the router renders the unauthorized route.
   */
  unauthenticated?: RedirectDestination;
  /**
   * Custom fallback when unauthenticated or forbidden, matching RoleRoute/RoleSwitchRoute.
   */
  customFallback?: (
    reason: 'unauthenticated' | 'forbidden',
  ) => PageRouteValue | undefined;
  /**
   * Whether to replace the current history entry instead of pushing (default: true).
   */
  replace?: boolean;
  /**
   * Optional rootPath applied to destinations that do not specify one.
   */
  rootPath?: string;
  /**
   * Optional page options while redirecting.
   */
  pageOptions?: DefaultPageOptions;
}

/**
 * Interpolates route params (e.g. `{campId}`) in a redirect path.
 */
export function resolveRedirectPath(
  path: string,
  params?: Record<string, RouteTrieParamValue>,
): string {
  if (!params) {
    return path;
  }
  return path.replace(/\{([^}]+)\}/g, (match, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : match;
  });
}

function isRedirectTarget(value: unknown): value is RedirectTarget {
  return (
    typeof value === 'object' &&
    value !== null &&
    'path' in value &&
    typeof (value as RedirectTarget).path === 'string' &&
    Object.keys(value).every(
      (k) => k === 'path' || k === 'rootPath' || k === 'replace',
    )
  );
}

/**
 * Route helper that redirects to another path.
 *
 * Supports:
 * - Normal redirects via a path string or `RedirectTarget` object
 * - Dynamic redirects via a resolver function
 * - Role-based redirects via a role-to-path map (checked in `rolePriority` or key order)
 */
export class RedirectRoute implements PageRoute {
  constructor(
    public target: RedirectRouteTarget,
    public options?: RedirectRouteOptions,
  ) {}

  get pageOptions(): DefaultPageOptions | undefined {
    return this.options?.pageOptions;
  }

  private _normalizeTarget(dest: RedirectDestination): RedirectTarget {
    if (typeof dest === 'string') {
      return {
        path: dest,
        rootPath: this.options?.rootPath,
        replace: this.options?.replace ?? true,
      };
    }
    return {
      ...dest,
      rootPath: dest.rootPath ?? this.options?.rootPath,
      replace: dest.replace ?? this.options?.replace ?? true,
    };
  }

  private _isRoleMap(target: RedirectRouteTarget): target is RoleRedirectMap {
    return (
      typeof target === 'object' && target !== null && !isRedirectTarget(target)
    );
  }

  /**
   * Resolves the redirect target for the given permissions, or undefined if
   * no redirect applies (e.g. unauthenticated or forbidden without fallback).
   */
  getRedirect(
    permissions?: Record<string, boolean> | null,
  ): RedirectTarget | undefined {
    if (typeof this.target === 'string' || isRedirectTarget(this.target)) {
      return this._normalizeTarget(this.target);
    }

    if (typeof this.target === 'function') {
      const resolved = this.target(permissions);
      return resolved !== undefined
        ? this._normalizeTarget(resolved)
        : undefined;
    }

    // Role-based redirect map
    const isAuthenticated = permissions && (permissions.authenticated ?? true);
    if (!permissions || !isAuthenticated) {
      if (this.options?.unauthenticated) {
        return this._normalizeTarget(this.options.unauthenticated);
      }
      return undefined;
    }

    const priority = this.options?.rolePriority ?? Object.keys(this.target);
    for (const role of priority) {
      const dest = this.target[role];
      if (permissions[role] && dest) {
        return this._normalizeTarget(dest);
      }
    }

    if (this.options?.fallbackRole) {
      const fallbackDest = this.target[this.options.fallbackRole];
      if (fallbackDest) {
        return this._normalizeTarget(fallbackDest);
      }
    }

    if (this.options?.fallback) {
      return this._normalizeTarget(this.options.fallback);
    }

    return undefined;
  }

  getPageOptions(
    permissions?: Record<string, boolean> | null,
  ): DefaultPageOptions | undefined {
    const redirect = this.getRedirect(permissions);
    if (redirect) {
      return this.pageOptions;
    }

    if (this._isRoleMap(this.target)) {
      const isAuthenticated =
        permissions && (permissions.authenticated ?? true);
      const reason =
        !permissions || !isAuthenticated ? 'unauthenticated' : 'forbidden';
      const fallback = this.options?.customFallback?.(reason);
      return fallback && typeof fallback !== 'function'
        ? fallback.pageOptions
        : undefined;
    }

    const fallback = this.options?.customFallback?.('forbidden');
    return fallback && typeof fallback !== 'function'
      ? fallback.pageOptions
      : undefined;
  }

  content(
    permissions?: Record<string, boolean> | null,
  ): PageDetails | Promise<PageDetails> | undefined {
    const redirect = this.getRedirect(permissions);
    if (redirect) {
      return {
        pageOptions: this.pageOptions,
        template: html``,
        redirect,
      };
    }

    if (this.options?.customFallback) {
      const isAuthenticated =
        permissions && (permissions.authenticated ?? true);
      const reason =
        this._isRoleMap(this.target) && (!permissions || !isAuthenticated)
          ? 'unauthenticated'
          : 'forbidden';
      return resolvePageDetails(
        this.options.customFallback(reason),
        permissions,
      );
    }

    return undefined;
  }
}
