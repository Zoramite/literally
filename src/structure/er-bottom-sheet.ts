import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Bottom sheet for positioning content at the bottom of the page as a popup.
 */
@customElement('er-bottom-sheet')
export class ErBottomSheet extends LitElement {
  static styles = [
    css`
      :host {
        align-items: center;
        display: flex;
        flex-flow: column;
        pointer-events: none;
        justify-content: flex-end;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        top: 0;
        z-index: 1000;
      }

      :host([open]) {
        pointer-events: initial;
      }

      :host([open].scrim) {
        background-color: color-mix(
          in srgb,
          var(
              --er-bottom-sheet-scrim-background-color,
              var(--md-sys-color-scrim)
            )
            80%,
          transparent
        );
      }

      .container {
        background-color: var(
          --er-bottom-sheet-background-color,
          var(--md-sys-color-surface)
        );
        border-top-left-radius: var(--space-xlarge);
        border-top-right-radius: var(--space-xlarge);
        box-sizing: border-box;
        color: var(--er-bottom-sheet-color, var(--md-sys-color-on-surface));
        height: 0;
        max-width: 640px;
        max-height: 95vh;
        width: 100%;
        transition: height var(--animation-timing-xxshort) ease-in-out;
      }

      :host([open]) .container {
        /* TODO: Wait for auto height to work. */
        /* height: calc(auto); */
        height: 50vh;
      }

      slot {
        display: block;
        padding: var(--space-large);
      }
    `,
  ];

  @property({ type: Boolean, attribute: 'open', reflect: true })
  isOpen = false;

  connectedCallback(): void {
    super.connectedCallback();

    this.addEventListener('click', this.handleScrimClick.bind(this));
  }

  handleScrimClick(evt: MouseEvent) {
    const targets = evt.composedPath();

    for (const target of targets) {
      if (
        (target as HTMLElement).classList &&
        (target as HTMLElement).classList.contains('container')
      ) {
        // click came from within container, do not close the bottom sheet.
        break;
      }

      // Is the current element, just close the bottom sheet.
      if (target === this) {
        this.isOpen = false;
      }
    }
  }

  render() {
    return html`<div class="container"><slot></slot></div>`;
  }

  protected updated(changedProperties: PropertyValueMap<this>) {
    super.updated(changedProperties);

    if (changedProperties.has('isOpen')) {
      if (this.isOpen) {
        this.dispatchEvent(new CustomEvent('opened', { composed: true }));
      } else {
        this.dispatchEvent(new CustomEvent('closed', { composed: true }));
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'er-bottom-sheet': ErBottomSheet;
  }
}
