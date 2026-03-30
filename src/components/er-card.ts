import { NavigationMixin } from '@littoral/literally/navigation/navigation.mixin';
import { breakpoints } from '@littoral/literally/structure/devices';
import { LitElement, PropertyValues, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Card element for displaying information grouped together.
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

      :host(.maybeHighlight) {
        border-bottom: 5px solid transparent;
        border-top: 5px solid transparent;
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

      :host(.themePrimary) {
        --er-card-background-color: var(--md-sys-color-primary);
        --er-card-background-color-hover: color-mix(
          in srgb,
          var(--er-card-background-color) 80%,
          transparent
        );
        --er-card-color: var(--md-sys-color-on-primary);
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

      :host(.themeTertiary) {
        --er-card-background-color: var(--md-sys-color-tertiary);
        --er-card-background-color-hover: color-mix(
          in srgb,
          var(--er-card-background-color) 80%,
          transparent
        );
        --er-card-color: var(--md-sys-color-on-tertiary);
      }

      :host(.themeError) {
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
        :host(.pad-xsmall${breakpoint?.targetClass ?? css``}) {
          --er-card-padding: var(--space-xsmall);
        }

        :host(.pad-small${breakpoint?.targetClass ?? css``}) {
          --er-card-padding: var(--space-small);
        }

        :host(.pad-medium${breakpoint?.targetClass ?? css``}) {
          --er-card-padding: var(--space-medium);
        }

        :host(.pad-large${breakpoint?.targetClass ?? css``}) {
          --er-card-padding: var(--space-large);
        }

        :host(.pad-xlarge${breakpoint?.targetClass ?? css``}) {
          --er-card-padding: var(--space-xlarge);
        }

        :host(.pad-xxlarge${breakpoint?.targetClass ?? css``}) {
          --er-card-padding: var(--space-xxlarge);
        }

        :host(.pad-xxxlarge${breakpoint?.targetClass ?? css``}) {
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

  @property()
  accessor highlight: string | undefined;

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
