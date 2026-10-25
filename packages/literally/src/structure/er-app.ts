import { LitElement, type TemplateResult, css, html } from 'lit';
import { query, state } from 'lit/decorators.js';
import { until } from 'lit/directives/until.js';

import '../components/er-loading';
import {
  type AppElementEvent,
  type StickySize,
} from '../navigation/navigation';
import { type PageDetails } from '../routing/route';
import { RouterMixin } from '../routing/router.mixin';

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

  renderContent() {
    const routeMatch = this.routeTrieMatch?.value;

    // No route matched, nothing to show.
    if (!routeMatch) {
      return html``;
    }

    const contentResult = routeMatch.content();
    if (!contentResult) {
      return html``;
    }

    if (typeof (contentResult as Promise<PageDetails>).then === 'function') {
      return html`${until(
        (contentResult as Promise<PageDetails>).then(
          (details) => details?.template ?? html``,
        ),
        this.renderLoadingRoute(),
      )}`;
    }

    return (contentResult as PageDetails).template ?? html``;
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
