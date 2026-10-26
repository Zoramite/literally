import { type TemplateResult } from 'lit';

export interface DefaultPageOptions {
  // Title of the page used to update the browser title.
  title?: string;
  [key: string]: unknown;
}

export interface PageDetails {
  pageOptions?: DefaultPageOptions;
  template: TemplateResult;
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
