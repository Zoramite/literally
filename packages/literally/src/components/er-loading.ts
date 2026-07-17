import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Loading placeholder/skeleton component with fade animation and theme variable support.
 *
 * @cssclass themeSurfaceVariant - Sets surface-variant theme colors.
 * @cssclass themeSurfaceContainer - Sets surface-container theme colors.
 * @cssclass themePrimary - Sets primary theme colors.
 * @cssclass themePrimaryContainer - Sets primary-container theme colors.
 * @cssclass themeSecondary - Sets secondary theme colors.
 * @cssclass themeSecondaryContainer - Sets secondary-container theme colors.
 * @cssclass themeTertiary - Sets tertiary theme colors.
 * @cssclass themeTertiaryContainer - Sets tertiary-container theme colors.
 * @cssclass themeError - Sets error theme colors.
 * @cssclass themeErrorContainer - Sets error-container theme colors.
 * @cssclass w25 - Sets width to 25%.
 * @cssclass w33 - Sets width to 33.333%.
 * @cssclass w50 - Sets width to 50%.
 * @cssclass w75 - Sets width to 75%.
 * @cssclass w100 - Sets width to 100%.
 * @cssclass pulse - Forces the pulse animation style.
 * @cssclass glow - Forces the glow animation style.
 * @cssclass none - Disables animation.
 */
@customElement('er-loading')
export class ErLoading extends LitElement {
  static styles = [
    css`
      :host {
        display: inline-block;
        height: 0.8em;
        width: 100%;
        border-radius: var(--er-loading-border-radius, var(--space-xsmall));
        vertical-align: baseline;
        position: relative;
        box-sizing: border-box;
        overflow: hidden;

        /* Default theme variables: uses on-surface or text color */
        --er-loading-color: color-mix(
          in srgb,
          var(--md-sys-color-on-surface, currentColor) 12%,
          transparent
        );
        --er-loading-highlight-color: color-mix(
          in srgb,
          var(--md-sys-color-on-surface, currentColor) 24%,
          transparent
        );

        /* Default animation: shimmer */
        background: linear-gradient(
          90deg,
          var(--er-loading-color) 25%,
          var(--er-loading-highlight-color) 50%,
          var(--er-loading-color) 75%
        );
        background-size: 200% 100%;
        animation: er-loading-shimmer 1.5s infinite linear;
      }

      /* Pulse animation option */
      :host(.pulse),
      :host([animation='pulse']) {
        background: var(--er-loading-color);
        animation: er-loading-pulse 1.5s ease-in-out infinite;
      }

      /* Glow animation option */
      :host(.glow),
      :host([animation='glow']) {
        background: var(--er-loading-color);
        animation: er-loading-glow 1.8s ease-in-out infinite;
      }

      /* None option (static placeholder) */
      :host(.none),
      :host([animation='none']) {
        background: var(--er-loading-color);
        animation: none;
      }

      /* Animated shimmer/wave effect */
      @keyframes er-loading-shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      /* Animated fade effect */
      @keyframes er-loading-pulse {
        0%,
        100% {
          opacity: 0.6;
        }
        50% {
          opacity: 0.25;
        }
      }

      /* Animated glow effect */
      @keyframes er-loading-glow {
        0%,
        100% {
          opacity: 0.6;
          box-shadow: 0 0 2px var(--er-loading-highlight-color);
        }
        50% {
          opacity: 0.9;
          box-shadow: 0 0 10px var(--er-loading-highlight-color);
        }
      }

      /* Width attributes/properties */
      :host([width='25']),
      :host(.w25) {
        width: 25%;
      }
      :host([width='33']),
      :host(.w33) {
        width: 33.333%;
      }
      :host([width='50']),
      :host(.w50) {
        width: 50%;
      }
      :host([width='75']),
      :host(.w75) {
        width: 75%;
      }
      :host([width='100']),
      :host(.w100) {
        width: 100%;
      }

      /* Theme colors using 'on' color mixed with transparent */
      :host(.themeSurfaceVariant) {
        --er-loading-color: color-mix(
          in srgb,
          var(--md-sys-color-on-surface-variant) 12%,
          transparent
        );
        --er-loading-highlight-color: color-mix(
          in srgb,
          var(--md-sys-color-on-surface-variant) 24%,
          transparent
        );
      }
      :host(.themeSurfaceContainer) {
        --er-loading-color: color-mix(
          in srgb,
          var(--md-sys-color-on-surface) 12%,
          transparent
        );
        --er-loading-highlight-color: color-mix(
          in srgb,
          var(--md-sys-color-on-surface) 24%,
          transparent
        );
      }
      :host(.themePrimary) {
        --er-loading-color: color-mix(
          in srgb,
          var(--md-sys-color-on-primary) 12%,
          transparent
        );
        --er-loading-highlight-color: color-mix(
          in srgb,
          var(--md-sys-color-on-primary) 24%,
          transparent
        );
      }
      :host(.themePrimaryContainer) {
        --er-loading-color: color-mix(
          in srgb,
          var(--md-sys-color-on-primary-container) 12%,
          transparent
        );
        --er-loading-highlight-color: color-mix(
          in srgb,
          var(--md-sys-color-on-primary-container) 24%,
          transparent
        );
      }
      :host(.themeSecondary) {
        --er-loading-color: color-mix(
          in srgb,
          var(--md-sys-color-on-secondary) 12%,
          transparent
        );
        --er-loading-highlight-color: color-mix(
          in srgb,
          var(--md-sys-color-on-secondary) 24%,
          transparent
        );
      }
      :host(.themeSecondaryContainer) {
        --er-loading-color: color-mix(
          in srgb,
          var(--md-sys-color-on-secondary-container) 12%,
          transparent
        );
        --er-loading-highlight-color: color-mix(
          in srgb,
          var(--md-sys-color-on-secondary-container) 24%,
          transparent
        );
      }
      :host(.themeTertiary) {
        --er-loading-color: color-mix(
          in srgb,
          var(--md-sys-color-on-tertiary) 12%,
          transparent
        );
        --er-loading-highlight-color: color-mix(
          in srgb,
          var(--md-sys-color-on-tertiary) 24%,
          transparent
        );
      }
      :host(.themeTertiaryContainer) {
        --er-loading-color: color-mix(
          in srgb,
          var(--md-sys-color-on-tertiary-container) 12%,
          transparent
        );
        --er-loading-highlight-color: color-mix(
          in srgb,
          var(--md-sys-color-on-tertiary-container) 24%,
          transparent
        );
      }
      :host(.themeError) {
        --er-loading-color: color-mix(
          in srgb,
          var(--md-sys-color-on-error) 12%,
          transparent
        );
        --er-loading-highlight-color: color-mix(
          in srgb,
          var(--md-sys-color-on-error) 24%,
          transparent
        );
      }
      :host(.themeErrorContainer) {
        --er-loading-color: color-mix(
          in srgb,
          var(--md-sys-color-on-error-container) 12%,
          transparent
        );
        --er-loading-highlight-color: color-mix(
          in srgb,
          var(--md-sys-color-on-error-container) 24%,
          transparent
        );
      }
    `,
  ];

  @property({ type: String, reflect: true })
  width?: string;

  @property({ type: String, reflect: true })
  animation?: string;

  render() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'er-loading': ErLoading;
  }
}
