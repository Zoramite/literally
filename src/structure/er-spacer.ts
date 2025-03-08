import { LitElement, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Spacer for controlling the spacing between vertical elements of the page.
 */
@customElement('er-spacer')
export class ErSpacer extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        min-height: var(--spacer-height);
      }

      :host([size='medium']) {
        --spacer-height: var(--space-medium);
      }

      :host([size='none']) {
        --spacer-height: var(--space-none);
      }

      :host([size='xxsmall']) {
        --spacer-height: var(--space-xxsmall);
      }

      :host([size='xsmall']) {
        --spacer-height: var(--space-xsmall);
      }

      :host([size='small']) {
        --spacer-height: var(--space-small);
      }

      :host([size='medium']) {
        --spacer-height: var(--space-medium);
      }

      :host([size='large']) {
        --spacer-height: var(--space-large);
      }

      :host([size='xlarge']) {
        --spacer-height: var(--space-xlarge);
      }

      :host([size='xxlarge']) {
        --spacer-height: var(--space-xxlarge);
      }

      :host([size='xxxlarge']) {
        --spacer-height: var(--space-xxxlarge);
      }

      :host([size='xxxxlarge']) {
        --spacer-height: var(--space-xxxxlarge);
      }
    `,
  ];

  @property({ reflect: true })
  size = 'medium';

  render() {
    return nothing;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'er-spacer': ErSpacer;
  }
}
