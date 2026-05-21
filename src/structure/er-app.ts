import { provide } from '@lit/context';
import { LitElement, TemplateResult, css, html } from 'lit';
import { query, state } from 'lit/decorators.js';

import { AppElementEvent, StickySize } from '../navigation/navigation';
import { RouterMixin } from '../routing/router.mixin';
import { AppServices, AppServicesInfo } from './appServices';
import { appServicesContext } from './context';

/**
 * Base app for use in applications.
 */
export class ERApp extends RouterMixin(LitElement) {
  static styles = [
    css`
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
   * App services manager.
   */

  @provide({ context: appServicesContext })
  @state()
  services: AppServicesInfo = new AppServices();

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

    return routeMatch.content()?.template ?? html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'er-app': ERApp;
  }
}
