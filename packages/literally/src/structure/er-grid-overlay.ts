import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { desktop, mobile, tablet } from './devices';

/**
 * Dev grid overlay component for aligning and debugging layouts on page.
 *
 * Toggles a translucent grid matching the er-grid structure (4 cols mobile, 8 cols tablet, 12 cols desktop).
 * Can be toggled via keyboard shortcut Shift+G or the `visible` property.
 */
@customElement('er-grid-overlay')
export class ErGridOverlay extends LitElement {
  static styles = [
    css`
      :host {
        --grid-margin: clamp(18px, 2.6042vw, 24px);
        --grid-gap: clamp(14px, 2.0833vw, 18px);

        bottom: 0;
        display: block;
        left: 0;
        pointer-events: none;
        position: fixed;
        right: 0;
        top: 0;
        z-index: 999999;
      }

      .gridContainer {
        box-sizing: border-box;
        column-gap: var(--grid-gap-column, var(--grid-gap));
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        height: 100%;
        margin: 0 var(--grid-margin);
        pointer-events: none;
      }

      ${tablet.mediaQuery} {
        .gridContainer {
          grid-template-columns: repeat(8, 1fr);
        }
      }

      ${desktop.mediaQuery} {
        .gridContainer {
          grid-template-columns: repeat(12, 1fr);
        }
      }

      .gridCol {
        background-color: color-mix(
          in srgb,
          var(--md-sys-color-primary, #6750a4) 8%,
          transparent
        );
        border-inline: 1px dashed
          color-mix(
            in srgb,
            var(--md-sys-color-primary, #6750a4) 30%,
            transparent
          );
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        height: 100%;
        justify-content: flex-start;
        pointer-events: none;
      }

      .gridColNumber {
        align-items: center;
        background-color: color-mix(
          in srgb,
          var(--md-sys-color-primary-container, #eaddff) 85%,
          transparent
        );
        border-radius: var(--space-xsmall, 4px);
        box-sizing: border-box;
        color: var(--md-sys-color-on-primary-container, #21005d);
        display: inline-flex;
        font-family: monospace;
        font-size: var(--er-sys-body-font-size-xxsmall, 11px);
        font-weight: 700;
        justify-content: center;
        line-height: 1;
        margin: var(--space-small, 8px) auto;
        padding: var(--space-xxsmall, 2px) var(--space-small, 6px);
        user-select: none;
      }

      ${mobile.mediaQuery} {
        .gridCol:nth-child(n + 5) {
          display: none;
        }
      }

      ${tablet.mediaQuery} {
        .gridCol:nth-child(n + 9) {
          display: none;
        }
      }
    `,
  ];

  @property({ type: Boolean, reflect: true })
  visible = false;

  private _onKeyDown = (event: KeyboardEvent) => {
    if (
      event.shiftKey &&
      (event.key === 'G' || event.key === 'g' || event.code === 'KeyG') &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      const target = event.composedPath()[0] as HTMLElement | null;
      if (
        target?.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '')
      ) {
        return;
      }

      event.preventDefault();
      this.visible = !this.visible;
    }
  };

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('keydown', this._onKeyDown);
  }

  disconnectedCallback() {
    window.removeEventListener('keydown', this._onKeyDown);
    super.disconnectedCallback();
  }

  render() {
    if (!this.visible) {
      return nothing;
    }

    return html`
      <div class="gridContainer">
        ${Array.from({ length: 12 }, (_, i) => i + 1).map(
          (num) => html`
            <div class="gridCol">
              <span class="gridColNumber">${num}</span>
            </div>
          `,
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'er-grid-overlay': ErGridOverlay;
  }
}
