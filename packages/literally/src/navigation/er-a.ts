import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { NavigationMixin } from './navigation.mixin';

/**
 * In-app replacement for `<a>` links.
 *
 * @slot - Label for the link
 */
@customElement('er-a')
export class ErA extends NavigationMixin(LitElement) {
  static styles = [
    css`
      :host {
        cursor: pointer;
        text-decoration: underline var(--md-sys-color-outline);
      }

      :host(.block) {
        display: block;
      }

      :host(.inline-block) {
        display: inline-block;
      }

      :host(.ellipsis) {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      :host(:hover) {
        text-decoration: underline var(--md-sys-color-outline-variant);
      }
    `,
  ];

  render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'er-a': ErA;
  }
}
