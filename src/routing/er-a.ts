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
export class ERA extends LitElement {
  static styles = [css``];

  @property({ attribute: 'path', reflect: true })
  path = '/';

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
    'er-a': ERA;
  }
}
