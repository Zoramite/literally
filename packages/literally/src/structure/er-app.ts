import { LitElement, type TemplateResult, css, html } from 'lit';
import { query, state } from 'lit/decorators.js';
import { until } from 'lit/directives/until.js';

import '../components/er-loading';
import {
  type AppElementEvent,
  type StickySize,
} from '../navigation/navigation';
import {
  type DefaultPageOptions,
  type PageDetails,
  type PageRoute,
  getRoutePageOptions,
} from '../routing/route';
import { type RouteTrieMatchValue } from '../routing/router';
import {
  RouterMixin,
  type UpdatePageTitleOptions,
} from '../routing/router.mixin';

/**
 * Base app for use in applications.
 */
export class ERApp extends RouterMixin(LitElement) {
  static styles = [
    css`
      /* Reduce layout shift while custom elements are loading dynamically. */
      :host :not(:defined) {
        display: block;
      }

      /* Development only styling to differentiate environments. */
      :host(.dev) .container {
        background-image: radial-gradient(
          color-mix(in srgb, var(--md-sys-color-primary) 40%, transparent) 0.5px,
          var(--md-sys-color-surface) 0.5px
        );
        background-size: 10px 10px;
      }

      @media print {
        :host(.dev) .container {
          background: none;
        }
      }

      :host {
        display: block;
      }

      .container {
        background-color: var(
          --sc-app-background-color,
          var(--md-sys-color-background)
        );
        box-sizing: border-box;
        color: var(--sc-app-color, var(--md-sys-color-on-background));
        display: flex;
        flex-flow: column;
        font-family: var(--sc-app-body-font-family, var(--body-font-family));
        font-optical-sizing: var(
          --sc-app-body-font-optical-sizing,
          var(--body-font-optical-sizing)
        );
        font-size: var(
          --sc-app-body-font-size,
          var(--er-sys-body-font-size-medium)
        );
        font-weight: var(--sc-app-body-font-weight, var(--body-font-weight));
        min-height: 100vh;
      }

      slot {
        display: block;
      }

      /* Adjustments for print. */
      @media print {
        /* Allow for not printing the title. */
        :host(.noPrintTitle) .title {
          display: none;
        }

        /* Allow printing landscape. */
        :host(.landscape) {
          size: letter landscape;
        }

        .container {
          background-color: transparent;
          padding: 0 !important;
          margin: 0 !important;
        }

        :host(.threeHoleMargins) .container {
          padding-left: 0.4in !important;
        }

        :host(:not(.largePrintTitle)) slot[name='title'] {
          --img-max-height: var(--space-xlarge);
        }
      }
    `,
  ];

  /**
   * Helper
   */

  @query('.container')
  container?: HTMLDivElement;

  @state()
  globalElements: TemplateResult[] = [];

  private _hasAppliedOnce = false;
  private _lastAppliedMatch?: RouteTrieMatchValue<PageRoute>;
  private _lastAppliedPermissions?: Record<string, boolean> | null;
  private _lastResolvedPageTitle?: string;
  private _contentOptionsToken = 0;
  private _pendingAsyncOptionsToken = 0;

  connectedCallback() {
    super.connectedCallback();

    // Allow setting a global sticky size offset.
    this.addEventListener(
      'stickySizeUpdate',
      (evt: CustomEvent<StickySize>) => {
        this.style.setProperty(
          `--sticky-${evt.detail.position}`,
          `${Math.max(0, evt.detail.size)}px`,
        );
      },
    );

    // Allow adding a global app element.
    this.addEventListener('appElement', (evt: CustomEvent<AppElementEvent>) => {
      this.globalElements.push(evt.detail.element);
      this.requestUpdate();
    });
  }

  render() {
    return html`
      <div class="container">${this.renderContent()}</div>
      ${this.globalElements}
    `;
  }

  override updateRouteTrieMatch() {
    this._lastResolvedPageTitle = undefined;
    super.updateRouteTrieMatch();
  }

  override updatePageTitle(
    title?: string,
    options?: UpdatePageTitleOptions,
  ): void {
    super.updatePageTitle(title ?? this._lastResolvedPageTitle, options);
  }

  applyPageOptions(
    pageOptions?: DefaultPageOptions,
    options?: { updateTitle?: boolean },
  ): void {
    if (options?.updateTitle ?? true) {
      this.updatePageTitle(pageOptions?.title);
    }
  }

  private _arePermissionsEqual(
    a?: Record<string, boolean> | null,
    b?: Record<string, boolean> | null,
  ): boolean {
    if (a === b) return true;
    if (!a || !b) return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k) => a[k] === b[k]);
  }

  private _applyResolvedPageOptions(
    pageOptions: DefaultPageOptions | undefined,
    forceTitleUpdate: boolean,
  ): void {
    const nextTitle = pageOptions?.title;
    const titleChanged = nextTitle !== this._lastResolvedPageTitle;
    this._lastResolvedPageTitle = nextTitle;
    this.applyPageOptions(pageOptions, {
      updateTitle: forceTitleUpdate || titleChanged,
    });
  }

  renderContent(permissions?: Record<string, boolean> | null) {
    const effectivePermissions =
      permissions !== undefined ? permissions : this.getRoutePermissions();
    const currentMatch = this.routeTrieMatch;
    const routeMatch = currentMatch?.value;

    const isNewRoute =
      !this._hasAppliedOnce || currentMatch !== this._lastAppliedMatch;
    const permissionsChanged = !this._arePermissionsEqual(
      effectivePermissions,
      this._lastAppliedPermissions,
    );
    const shouldSyncOptions = isNewRoute || permissionsChanged;

    let token = this._contentOptionsToken;
    if (shouldSyncOptions) {
      this._hasAppliedOnce = true;
      this._lastAppliedMatch = currentMatch;
      this._lastAppliedPermissions = effectivePermissions
        ? { ...effectivePermissions }
        : effectivePermissions;
      token = ++this._contentOptionsToken;
      this._pendingAsyncOptionsToken = 0;
    }

    // No route matched, nothing to show.
    if (!routeMatch) {
      if (shouldSyncOptions) {
        this._applyResolvedPageOptions(undefined, isNewRoute);
      }
      return this.renderMissingRoute();
    }

    const upfrontOptions = getRoutePageOptions(
      routeMatch,
      effectivePermissions,
    );
    const contentResult = routeMatch.content(effectivePermissions);
    if (!contentResult) {
      if (shouldSyncOptions) {
        this._applyResolvedPageOptions(upfrontOptions, isNewRoute);
      }
      return this.renderUnauthorizedRoute(effectivePermissions);
    }

    if (typeof (contentResult as Promise<PageDetails>).then === 'function') {
      if (shouldSyncOptions) {
        this._pendingAsyncOptionsToken = token;
        if (isNewRoute || upfrontOptions !== undefined) {
          this._applyResolvedPageOptions(upfrontOptions, isNewRoute);
        }
      }
      const forceTitleOnResolve = isNewRoute;
      return html`${until(
        (contentResult as Promise<PageDetails>)
          .then((details) => {
            if (
              this._pendingAsyncOptionsToken === token &&
              token === this._contentOptionsToken
            ) {
              this._pendingAsyncOptionsToken = 0;
              const mergedOptions =
                upfrontOptions || details?.pageOptions
                  ? { ...upfrontOptions, ...details?.pageOptions }
                  : undefined;
              this._applyResolvedPageOptions(
                mergedOptions,
                forceTitleOnResolve && Boolean(details?.pageOptions),
              );
            }
            return details?.template ?? html``;
          })
          .catch((err) => this.renderErrorRoute(err)),
        this.renderLoadingRoute(),
      )}`;
    }

    const syncDetails = contentResult as PageDetails;
    if (shouldSyncOptions) {
      const mergedOptions =
        upfrontOptions || syncDetails.pageOptions
          ? { ...upfrontOptions, ...syncDetails.pageOptions }
          : undefined;
      this._applyResolvedPageOptions(mergedOptions, isNewRoute);
    }

    return syncDetails.template ?? html``;
  }

  renderMissingRoute(): TemplateResult {
    return html``;
  }

  renderUnauthorizedRoute(
    _permissions?: Record<string, boolean> | null,
  ): TemplateResult {
    return html``;
  }

  renderErrorRoute(err: unknown): TemplateResult {
    console.error('Failed to load page module:', err);
    return html``;
  }

  renderLoadingRoute(): TemplateResult {
    return html`<er-loading></er-loading>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'er-app': ERApp;
  }
}
