import { NavigationMixin } from '@littoral/literally/navigation/navigation.mixin';
import { breakpoints } from '@littoral/literally/structure/devices';
import { LitElement, type PropertyValues, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Card element for displaying information grouped together.
 *
 * @cssclass link - Makes the card hoverable with a pointer cursor.
 * @cssclass fullHeight - Sets height to 100%.
 * @cssclass hoverEffect - Applies elevation/transform hover transition.
 * @cssclass outlined - Applies a 1px border.
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
 * @cssclass padXsmall - Sets extra small padding. Supports breakpoint suffixes (e.g. padXsmallOnMobile).
 * @cssclass padSmall - Sets small padding. Supports breakpoint suffixes (e.g. padSmallOnMobile).
 * @cssclass padMedium - Sets medium padding. Supports breakpoint suffixes (e.g. padMediumOnMobile).
 * @cssclass padLarge - Sets large padding. Supports breakpoint suffixes (e.g. padLargeOnMobile).
 * @cssclass padXlarge - Sets extra large padding. Supports breakpoint suffixes (e.g. padXlargeOnMobile).
 * @cssclass padXxlarge - Sets double extra large padding. Supports breakpoint suffixes (e.g. padXxlargeOnMobile).
 * @cssclass padXxxlarge - Sets triple extra large padding. Supports breakpoint suffixes (e.g. padXxxlargeOnMobile).
 */
@customElement('er-card')
export class ErCard extends NavigationMixin(LitElement) {
  static styles = [
    css`
      :host {
        background-color: var(
          --er-card-background-color,
          var(--md-sys-color-surface)
        );
        border-radius: var(--er-card-border-radius, var(--space-medium));
        box-sizing: border-box;
        color: var(--er-card-color, var(--md-sys-color-on-surface));
        display: block;
        padding: var(--er-card-padding, var(--space-medium));
      }

      :host([path]:hover),
      :host(.link:hover) {
        /* background-color: var(--er-card-background-color-hover); */
        box-shadow:
          color-mix(in srgb, var(--md-sys-color-shadow) 12%, transparent) 0px
            1px 3px,
          color-mix(in srgb, var(--md-sys-color-shadow) 24%, transparent) 0px
            1px 2px;
        cursor: pointer;
      }

      :host(.fullHeight) {
        height: 100%;
      }

      :host(.hoverEffect) {
        transition:
          box-shadow 0.3s ease,
          transform 0.3s ease,
          background-color 0.3s ease;
      }

      :host(.hoverEffect:hover) {
        box-shadow: 0 8px 24px
          color-mix(
            in srgb,
            var(--md-sys-color-shadow, #000000) 8%,
            transparent
          );
        transform: translateY(-2px);
      }

      :host(.maybeHighlight) {
        border-bottom: 5px solid transparent;
        border-top: 5px solid transparent;
      }

      :host([highlight].maybeHighlight) {
        border-bottom-color: var(--er-card-highlight-color);
        border-top-color: var(--er-card-highlight-color);
      }

      :host([highlight]) {
        background:
          radial-gradient(
            ellipse at 85% 5%,
            color-mix(in srgb, var(--er-card-highlight-color) 32%, transparent),
            transparent 60%
          ),
          radial-gradient(
            ellipse at 10% 185%,
            color-mix(in srgb, var(--er-card-highlight-color) 35%, transparent),
            transparent 60%
          );
        background-color: var(
          --er-card-background-color,
          var(--md-sys-color-surface)
        );
      }

      :host(.outlined) {
        border: 1px solid
          var(--er-card-border-color, var(--md-sys-color-on-surface));
      }

      :host(.themeSurfaceVariant) {
        --er-card-background-color: var(--md-sys-color-surface-variant);
        --er-card-background-color-hover: color-mix(
          in srgb,
          var(--er-card-background-color) 80%,
          transparent
        );
        --er-card-color: var(--md-sys-color-on-surface-variant);
      }

      :host(.themeSurfaceContainer) {
        --er-card-background-color: var(--md-sys-color-surface-container);
        --er-card-background-color-hover: color-mix(
          in srgb,
          var(--er-card-background-color) 80%,
          transparent
        );
        --er-card-color: var(--md-sys-color-on-surface);
      }

      :host(.themePrimary) {
        --er-card-background-color: var(--md-sys-color-primary);
        --er-card-background-color-hover: color-mix(
          in srgb,
          var(--er-card-background-color) 80%,
          transparent
        );
        --er-card-color: var(--md-sys-color-on-primary);
      }

      :host(.themePrimaryContainer) {
        --er-card-background-color: var(--md-sys-color-primary-container);
        --er-card-background-color-hover: color-mix(
          in srgb,
          var(--er-card-background-color) 80%,
          transparent
        );
        --er-card-color: var(--md-sys-color-on-primary-container);
      }

      :host(.themeSecondary) {
        --er-card-background-color: var(--md-sys-color-secondary);
        --er-card-background-color-hover: color-mix(
          in srgb,
          var(--er-card-background-color) 80%,
          transparent
        );
        --er-card-color: var(--md-sys-color-on-secondary);
      }

      :host(.themeSecondaryContainer) {
        --er-card-background-color: var(--md-sys-color-secondary-container);
        --er-card-background-color-hover: color-mix(
          in srgb,
          var(--er-card-background-color) 80%,
          transparent
        );
        --er-card-color: var(--md-sys-color-on-secondary-container);
      }

      :host(.themeTertiary) {
        --er-card-background-color: var(--md-sys-color-tertiary);
        --er-card-background-color-hover: color-mix(
          in srgb,
          var(--er-card-background-color) 80%,
          transparent
        );
        --er-card-color: var(--md-sys-color-on-tertiary);
      }

      :host(.themeTertiaryContainer) {
        --er-card-background-color: var(--md-sys-color-tertiary-container);
        --er-card-background-color-hover: color-mix(
          in srgb,
          var(--er-card-background-color) 80%,
          transparent
        );
        --er-card-color: var(--md-sys-color-on-tertiary-container);
      }

      :host(.themeError) {
        --er-card-background-color: var(--md-sys-color-error);
        --er-card-background-color-hover: color-mix(
          in srgb,
          var(--er-card-background-color) 80%,
          transparent
        );
        --er-card-color: var(--md-sys-color-on-error);
      }

      :host(.themeErrorContainer) {
        --er-card-background-color: var(--md-sys-color-error-container);
        --er-card-background-color-hover: color-mix(
          in srgb,
          var(--er-card-background-color) 80%,
          transparent
        );
        --er-card-color: var(--md-sys-color-on-error-container);
      }
    `,
    // Targeted breakpoint styles.
    ...breakpoints.mixupStyles((breakpoint) => {
      const styling = css`
        :host(.padXsmall${breakpoint?.targetClass ?? css``}) {
          --er-card-padding: var(--space-xsmall);
        }

        :host(.padSmall${breakpoint?.targetClass ?? css``}) {
          --er-card-padding: var(--space-small);
        }

        :host(.padMedium${breakpoint?.targetClass ?? css``}) {
          --er-card-padding: var(--space-medium);
        }

        :host(.padLarge${breakpoint?.targetClass ?? css``}) {
          --er-card-padding: var(--space-large);
        }

        :host(.padXlarge${breakpoint?.targetClass ?? css``}) {
          --er-card-padding: var(--space-xlarge);
        }

        :host(.padXxlarge${breakpoint?.targetClass ?? css``}) {
          --er-card-padding: var(--space-xxlarge);
        }

        :host(.padXxxlarge${breakpoint?.targetClass ?? css``}) {
          --er-card-padding: var(--space-xxxlarge);
        }
      `;

      if (!breakpoint) {
        return styling;
      }

      return css`
        ${breakpoint.mediaQuery} {
          ${styling}
        }
      `;
    }),
  ];

  @property({ reflect: true })
  highlight?: string;

  connectedCallback(): void {
    super.connectedCallback();

    this.updateHighlight();
  }

  render() {
    return html` <slot></slot> `;
  }

  protected updated(changedProperties: PropertyValues<this>): void {
    super.updated(changedProperties);

    if (changedProperties.has('highlight')) {
      this.updateHighlight();
    }
  }

  updateHighlight() {
    if (!this.highlight) {
      this.style.setProperty('--er-card-highlight-color', 'transparent');
      return;
    }

    this.style.setProperty('--er-card-highlight-color', this.highlight);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'er-card': ErCard;
  }
}
