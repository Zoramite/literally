import { NavigationMixin } from '@littoral/literally/navigation/navigation.mixin';
import { LitElement, css, html, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { contrast, hexToRgb } from '../utils/color';

/**
 * Element for displaying material symbol icons.
 *
 * @cssclass dim - Apply 25% opacity to the icon.
 * @cssclass link - Make the icon hoverable with a pointer cursor.
 * @cssclass outline - Apply outlined style (swaps background and color).
 * @cssclass rounded - Apply a circular border radius (50%).
 * @cssclass roundish - Apply a small border radius.
 * @cssclass padSmall - Set small padding.
 * @cssclass padMedium - Set medium padding.
 * @cssclass themePrimary - Apply primary theme colors.
 * @cssclass themePrimaryContainer - Apply primary-container theme colors.
 * @cssclass themeSecondary - Apply secondary theme colors.
 * @cssclass themeSecondaryContainer - Apply secondary-container theme colors.
 * @cssclass themeTertiary - Apply tertiary theme colors.
 * @cssclass themeTertiaryContainer - Apply tertiary-container theme colors.
 * @cssclass themeError - Apply error theme colors.
 * @cssclass themeErrorContainer - Apply error-container theme colors.
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

      :host(.themePrimaryContainer) {
        --color-default: var(--md-sys-color-primary-container);
        --on-color-default: var(--md-sys-color-on-primary-container);
      }

      :host(.themeSecondary) {
        --color-default: var(--md-sys-color-secondary);
        --on-color-default: var(--md-sys-color-on-secondary);
      }

      :host(.themeSecondaryContainer) {
        --color-default: var(--md-sys-color-secondary-container);
        --on-color-default: var(--md-sys-color-on-secondary-container);
      }

      :host(.themeTertiary) {
        --color-default: var(--md-sys-color-tertiary);
        --on-color-default: var(--md-sys-color-on-tertiary);
      }

      :host(.themeTertiaryContainer) {
        --color-default: var(--md-sys-color-tertiary-container);
        --on-color-default: var(--md-sys-color-on-tertiary-container);
      }

      :host(.themeError) {
        --color-default: var(--md-sys-color-error);
        --on-color-default: var(--md-sys-color-on-error);
      }

      :host(.themeErrorContainer) {
        --color-default: var(--md-sys-color-error-container);
        --on-color-default: var(--md-sys-color-on-error-container);
      }

      .material-symbols-outlined {
        display: inline-block;
        font-size: var(--er-icon-font-size, 24px);
        line-height: 1;
        overflow: hidden;
        max-width: var(--er-icon-font-size, 24px);
      }

      :host([highlight]) {
        background: transparent;
        background-color: transparent;
        border-color: transparent;
      }

      :host([highlight]) .material-symbols-outlined {
        background: linear-gradient(
          135deg,
          var(--er-icon-highlight-color) 0%,
          color-mix(in srgb, var(--er-icon-highlight-color) 40%, var(--color))
            60%,
          var(--color) 100%
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        display: inline-block;
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
  icon = '';

  @property({ reflect: true })
  color?: string;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, attribute: 'keep-color', reflect: true })
  keepColor = false;

  @property({ reflect: true })
  highlight?: string;

  protected override willUpdate(changedProperties: PropertyValues) {
    if (changedProperties.has('highlight')) {
      if (!this.highlight) {
        this.style.setProperty('--er-icon-highlight-color', 'transparent');
      } else {
        this.style.setProperty('--er-icon-highlight-color', this.highlight);
      }
    }
  }

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
