import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import {
  type NavigationEvent,
  ROUTE_NAVIGATION_EVENT_NAME,
} from './router-mixin';

/**
 * In-app replacement for `<a>` links.
 *
 * @slot - Label for the link
 */
@customElement('er-a')
export class ErA extends LitElement {
  static styles = [
    css`
      :host {
        cursor: pointer;
      }

      :host(.block),
      :host(.block) a {
        display: block;
      }

      :host(.pad) a {
        padding: var(--er-a-padding, var(--space-medium));
      }
    `,
  ];

  @property({ attribute: 'path', reflect: true })
  path = '/';

  override connectedCallback(): void {
    super.connectedCallback();

    this.addEventListener('click', () => {
      this.dispatchEvent(navigateToPathEvent(this.path));
      return false;
    });
  }

  render() {
    return html`<a
      @click=${() => {
        this.dispatchEvent(navigateToPathEvent(this.path));
        return false;
      }}
      ><slot></slot
    ></a>`;
  }
}

/**
 * Call to action item.
 *
 * @slot - Label for the CTA
 */
@customElement('er-cta')
export class ErCTA extends LitElement {
  static styles = [
    css`
      :host {
        background-color: var(
          --er-cta-background-color,
          var(--md-sys-color-surface-variant)
        );
        color: var(--er-cta-color, var(--md-sys-color-on-surface-variant));
        cursor: pointer;
        padding: var(--er-cta-padding, var(--space-medium));
      }

      :host(:hover) {
        background-color: var(
          --er-cta-hover-background-color,
          var(--md-sys-color-tertiary-container)
        );
        color: var(
          --er-cta-hover-color,
          var(--md-sys-color-on-tertiary-container)
        );
      }

      :host(.block) {
        display: block;
      }
    `,
  ];

  @property({ attribute: 'path', reflect: true })
  path = '/';

  override connectedCallback(): void {
    super.connectedCallback();

    this.addEventListener('click', () => {
      this.dispatchEvent(navigateToPathEvent(this.path));
      return false;
    });
  }

  render() {
    return html`<slot></slot>`;
  }
}

/**
 * Easy navigation custom event creation.
 */
export function navigateToPathEvent(
  path: string,
): CustomEvent<NavigationEvent> {
  return new CustomEvent<NavigationEvent>(ROUTE_NAVIGATION_EVENT_NAME, {
    bubbles: true,
    composed: true,
    detail: {
      path: path,
    },
  });
}

declare global {
  interface HTMLElementTagNameMap {
    'er-a': ErA;
  }
}
