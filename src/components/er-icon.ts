import { NavigationMixin } from '@littoral/literally/navigation/navigation.mixin';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { contrast, hexToRgb } from '../utils/color';

/**
 * Element for displaying material symbol icons.
 */
@customElement('er-icon')
export class ErIcon extends NavigationMixin(LitElement) {
  static styles = [
    css`
      :host {
        --color: var(
          --er-icon-color,
          var(--color-default, var(--md-sys-color-container))
        );
        --on-color: var(
          --er-icon-on-color,
          var(--on-color-default, var(--md-sys-color-on-container))
        );

        aspect-ratio: 1;
        background-color: var(--color);
        border: 1px solid transparent;
        box-sizing: border-box;
        color: var(--on-color);
        display: inline-block;
        /* Hack to get around extra whitespace around icon. */
        font-size: 0;
        font-variation-settings:
          'FILL' 0,
          'wght' 400,
          'GRAD' 0,
          'opsz' 24;
        line-height: 1;
        padding: 0;
        text-align: center;
      }

      :host([disabled]) {
        opacity: 0.25;
      }

      :host(.dim) {
        opacity: 0.25;
        transition: opacity 0.25s ease-in-out;
      }

      :host(.dim.link:hover) {
        opacity: 0.75;
      }

      :host(.link) {
        cursor: pointer;
      }

      :host(.outline) {
        background-color: var(--on-color);
        border-color: var(--color);
        color: var(--color);
      }

      :host(.rounded) {
        border-radius: 50%;
      }

      :host(.roundish) {
        border-radius: var(--er-icon-border-radius, var(--space-small));
      }

      :host(.padSmall) {
        padding: var(--space-small);
      }

      :host(.padMedium) {
        padding: var(--space-medium);
      }

      :host(.themePrimary) {
        --color-default: var(--md-sys-color-primary);
        --on-color-default: var(--md-sys-color-on-primary);
      }

      :host(.themePrimarySurface) {
        --color-default: var(--md-sys-color-primary-surface);
        --on-color-default: var(--md-sys-color-on-primary-surface);
      }

      :host(.themeSecondary) {
        --color-default: var(--md-sys-color-secondary);
        --on-color-default: var(--md-sys-color-on-secondary);
      }

      :host(.themeTertiary) {
        --color-default: var(--md-sys-color-secondary);
        --on-color-default: var(--md-sys-color-on-secondary);
      }

      .material-symbols-outlined {
        display: inline-block;
        line-height: 1;
        overflow: hidden;
        max-width: 24px;
      }

      @media print {
        :host {
          color: var(--er-icon-color, #000);
          background-color: transparent;
        }
      }
    `,
  ];

  @property({ reflect: true })
  accessor icon = '';

  @property({ reflect: true })
  accessor color: string | undefined;

  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  @property({ type: Boolean, attribute: 'keep-color', reflect: true })
  accessor keepColor = false;

  render() {
    if (this.color) {
      this.style.setProperty('--er-icon-color', this.color);

      // Determine which color has the greates constrast on the color to
      // determine icon color.
      const colorRGB = hexToRgb(this.color);

      if (colorRGB && !this.keepColor) {
        const whiteContrast = contrast(
          {
            red: 255,
            green: 255,
            blue: 255,
          },
          colorRGB,
        );
        const blackContrast = contrast(
          {
            red: 0,
            green: 0,
            blue: 0,
          },
          colorRGB,
        );
        this.style.setProperty(
          '--er-icon-on-color',
          whiteContrast > blackContrast ? '#ffffff' : '#000000',
        );
      }
    }

    return html`
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />
      <span class="material-symbols-outlined">${this.icon}</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'er-icon': ErIcon;
  }
}
