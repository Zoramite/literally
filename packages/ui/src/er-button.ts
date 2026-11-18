import { LitElement, type PropertyValues, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { NavigationMixin } from '../navigation/navigation.mixin';
import { breakpoints } from '../structure/devices';
import './er-icon';

/**
 * Button visual element for actions and links.
 *
 * @cssclass noLink - Disable the pointer cursor.
 * @cssclass primary - Style the button with the primary theme color.
 * @cssclass secondary - Style the button with the secondary outline theme.
 * @cssclass tertiary - Style the button with the tertiary text theme.
 * @cssclass themePrimary - Apply primary theme color.
 * @cssclass themePrimaryContainer - Apply primary-container theme color.
 * @cssclass themeSecondary - Apply secondary theme color.
 * @cssclass themeSecondaryContainer - Apply secondary-container theme color.
 * @cssclass themeTertiary - Apply tertiary theme color.
 * @cssclass themeTertiaryContainer - Apply tertiary-container theme color.
 * @cssclass themeError - Apply error theme color.
 * @cssclass themeErrorContainer - Apply error-container theme color.
 * @cssclass themeSurface - Apply surface theme color.
 * @cssclass themeSurfaceVariant - Apply surface-variant theme color.
 * @cssclass themeSurfaceContainer - Apply surface-container theme color.
 * @cssclass link - Make the button hoverable with an outline.
 * @cssclass full - Make the button take the full width of its parent container. Supports breakpoint suffixes (e.g. fullOnMobile).
 * @cssclass center - Center the content inside the button. Supports breakpoint suffixes (e.g. centerOnMobile).
 * @cssclass fontSizeXxsmall - Apply extra-extra-small body font size. Supports breakpoint suffixes (e.g. fontSizeXxsmallOnMobile).
 * @cssclass fontSizeXsmall - Apply extra-small body font size. Supports breakpoint suffixes (e.g. fontSizeXsmallOnMobile).
 * @cssclass fontSizeSmall - Apply small body font size. Supports breakpoint suffixes (e.g. fontSizeSmallOnMobile).
 * @cssclass fontSizeMedium - Apply medium body font size. Supports breakpoint suffixes (e.g. fontSizeMediumOnMobile).
 * @cssclass fontSizeLarge - Apply large body font size. Supports breakpoint suffixes (e.g. fontSizeLargeOnMobile).
 * @cssclass fontSizeXlarge - Apply extra-large body font size. Supports breakpoint suffixes (e.g. fontSizeXlargeOnMobile).
 * @cssclass fontSizeXxlarge - Apply double-extra-large body font size. Supports breakpoint suffixes (e.g. fontSizeXxlargeOnMobile).
 * @cssclass fontSizeXxxlarge - Apply triple-extra-large body font size. Supports breakpoint suffixes (e.g. fontSizeXxxlargeOnMobile).
 * @cssclass fontXxsmall - Alias for fontSizeXxsmall. Supports breakpoint suffixes.
 * @cssclass fontXsmall - Alias for fontSizeXsmall. Supports breakpoint suffixes.
 * @cssclass fontSmall - Alias for fontSizeSmall. Supports breakpoint suffixes.
 * @cssclass fontMedium - Alias for fontSizeMedium. Supports breakpoint suffixes.
 * @cssclass fontLarge - Alias for fontSizeLarge. Supports breakpoint suffixes.
 * @cssclass fontXlarge - Alias for fontSizeXlarge. Supports breakpoint suffixes.
 * @cssclass fontXxlarge - Alias for fontSizeXxlarge. Supports breakpoint suffixes.
 * @cssclass fontXxxlarge - Alias for fontSizeXxxlarge. Supports breakpoint suffixes.
 */
@customElement('er-button')
export class ErButton extends NavigationMixin(LitElement) {
  static styles = [
    css`
      :host {
        align-items: center;
        background-color: var(
          --er-button-background-color,
          var(--md-sys-color-surface)
        );
        border: 1px solid var(--er-button-border-color, transparent);
        border-radius: var(--er-button-border-radius, var(--space-small));
        box-sizing: border-box;
        color: var(--er-button-color, var(--md-sys-color-on-surface));
        cursor: pointer;
        display: inline-flex;
        flex-direction: row;
        flex-wrap: nowrap;
        font-family: var(--er-button-font-family, var(--body-font-family));
        font-optical-sizing: var(
          --er-button-font-optical-sizing,
          var(--body-font-optical-sizing)
        );
        font-size: var(
          --er-button-font-size,
          var(--er-sys-body-font-size-medium)
        );
        font-weight: var(--er-button-font-weight, var(--body-font-weight));
        --er-icon-font-size: var(
          --er-button-icon-font-size,
          var(--er-button-font-size, 1em)
        );
        gap: var(--space-small);
        line-height: 1;
        padding: var(--space-small) var(--space-medium);
        user-select: none;
        vertical-align: middle;
        white-space: nowrap;
      }

      :host([disabled]) {
        cursor: initial;
        opacity: 0.5;
      }

      :host([highlight]) {
        background:
          radial-gradient(
            ellipse at 70% 5%,
            color-mix(
              in srgb,
              var(--er-button-highlight-color) 32%,
              transparent
            ),
            transparent 60%
          ),
          radial-gradient(
            ellipse at 12% 185%,
            color-mix(
              in srgb,
              var(--er-button-highlight-color) 35%,
              transparent
            ),
            transparent 60%
          );
      }

      :host(.noLink) {
        cursor: initial;
      }

      :host(.primary) {
        --er-button-background-color: var(--er-button-theme-background-color);
        --er-button-color: var(--er-button-theme-color);
        --er-icon-color: var(--er-button-theme-background-color);
        --er-icon-on-color: var(--er-button-theme-color);
      }

      :host(.secondary) {
        --er-button-border-color: var(--er-button-theme-background-color);
        --er-button-color: var(--er-button-theme-background-color);
        --er-icon-on-color: var(--er-button-theme-background-color);
      }

      :host(.tertiary) {
        --er-button-background-color: transparent;
        --er-button-color: var(--er-button-theme-background-color);
        --er-icon-on-color: var(--er-button-theme-background-color);
      }

      :host(.themePrimary) {
        --er-button-theme-background-color: var(--md-sys-color-primary);
        --er-button-theme-color: var(--md-sys-color-on-primary);
      }

      :host(.themePrimaryContainer) {
        --er-button-theme-background-color: var(
          --md-sys-color-primary-container
        );
        --er-button-theme-color: var(--md-sys-color-on-primary-container);
      }

      :host(.themeSecondary) {
        --er-button-theme-background-color: var(--md-sys-color-secondary);
        --er-button-theme-color: var(--md-sys-color-on-secondary);
      }

      :host(.themeSecondaryContainer) {
        --er-button-theme-background-color: var(
          --md-sys-color-secondary-container
        );
        --er-button-theme-color: var(--md-sys-color-on-secondary-container);
      }

      :host(.themeTertiary) {
        --er-button-theme-background-color: var(--md-sys-color-tertiary);
        --er-button-theme-color: var(--md-sys-color-on-tertiary);
      }

      :host(.themeTertiaryContainer) {
        --er-button-theme-background-color: var(
          --md-sys-color-tertiary-container
        );
        --er-button-theme-color: var(--md-sys-color-on-tertiary-container);
      }

      :host(.themeError) {
        --er-button-theme-background-color: var(--md-sys-color-error);
        --er-button-theme-color: var(--md-sys-color-on-error);
      }

      :host(.themeErrorContainer) {
        --er-button-theme-background-color: var(--md-sys-color-error-container);
        --er-button-theme-color: var(--md-sys-color-on-error-container);
      }

      :host(.themeSurface) {
        --er-button-theme-background-color: var(--md-sys-color-surface);
        --er-button-theme-color: var(--md-sys-color-on-surface);
      }

      :host(.themeSurfaceVariant) {
        --er-button-theme-background-color: var(--md-sys-color-surface-variant);
        --er-button-theme-color: var(--md-sys-color-on-surface-variant);
      }

      :host(.themeSurfaceContainer) {
        --er-button-theme-background-color: var(
          --md-sys-color-surface-container
        );
        --er-button-theme-color: var(--md-sys-color-on-surface);
      }

      :host([path]:hover:not([disabled])),
      :host(.link:hover:not([disabled])) {
        outline: 1px solid
          color-mix(
            in srgb,
            var(--er-button-theme-background-color) 60%,
            transparent
          );
        outline-offset: -1px;
      }

      er-icon {
        background-color: transparent;
        border: none;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: var(--er-icon-font-size, 1em);
        height: 1em;
        line-height: 1;
        max-height: 1em;
        max-width: 1em;
        width: 1em;
      }

      .label {
        align-items: center;
        box-sizing: border-box;
        display: inline-flex;
        height: 1em;
        line-height: 1;
      }
    `,
    // Targeted breakpoint styles.
    ...breakpoints.mixupStyles((breakpoint) => {
      const styling = css`
        :host(.full${breakpoint?.targetClass ?? css``}) {
          width: 100%;
        }

        :host(.center${breakpoint?.targetClass ?? css``}) {
          justify-content: center;
        }

        :host(.fontSizeXxsmall${breakpoint?.targetClass ?? css``}),
        :host(.fontXxsmall${breakpoint?.targetClass ?? css``}) {
          --er-button-font-size: var(--er-sys-body-font-size-xxsmall);
          font-size: var(--er-sys-body-font-size-xxsmall);
        }

        :host(.fontSizeXsmall${breakpoint?.targetClass ?? css``}),
        :host(.fontXsmall${breakpoint?.targetClass ?? css``}) {
          --er-button-font-size: var(--er-sys-body-font-size-xsmall);
          font-size: var(--er-sys-body-font-size-xsmall);
        }

        :host(.fontSizeSmall${breakpoint?.targetClass ?? css``}),
        :host(.fontSmall${breakpoint?.targetClass ?? css``}) {
          --er-button-font-size: var(--er-sys-body-font-size-small);
          font-size: var(--er-sys-body-font-size-small);
        }

        :host(.fontSizeMedium${breakpoint?.targetClass ?? css``}),
        :host(.fontMedium${breakpoint?.targetClass ?? css``}) {
          --er-button-font-size: var(--er-sys-body-font-size-medium);
          font-size: var(--er-sys-body-font-size-medium);
        }

        :host(.fontSizeLarge${breakpoint?.targetClass ?? css``}),
        :host(.fontLarge${breakpoint?.targetClass ?? css``}) {
          --er-button-font-size: var(--er-sys-body-font-size-large);
          font-size: var(--er-sys-body-font-size-large);
        }

        :host(.fontSizeXlarge${breakpoint?.targetClass ?? css``}),
        :host(.fontXlarge${breakpoint?.targetClass ?? css``}) {
          --er-button-font-size: var(--er-sys-body-font-size-xlarge);
          font-size: var(--er-sys-body-font-size-xlarge);
        }

        :host(.fontSizeXxlarge${breakpoint?.targetClass ?? css``}),
        :host(.fontXxlarge${breakpoint?.targetClass ?? css``}) {
          --er-button-font-size: var(--er-sys-body-font-size-xxlarge);
          font-size: var(--er-sys-body-font-size-xxlarge);
        }

        :host(.fontSizeXxxlarge${breakpoint?.targetClass ?? css``}),
        :host(.fontXxxlarge${breakpoint?.targetClass ?? css``}) {
          --er-button-font-size: var(--er-sys-body-font-size-xxxlarge);
          font-size: var(--er-sys-body-font-size-xxxlarge);
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

  @property({ attribute: 'icon' })
  icon?: string;

  @property({ attribute: 'icon-start' })
  iconStart?: string;

  @property({ attribute: 'icon-end' })
  iconEnd?: string;

  @property({})
  highlight?: string;

  @property({})
  label?: string;

  @state()
  private hasSlottedContent = false;

  connectedCallback(): void {
    super.connectedCallback();

    this.title = this.label ?? '';
    this.updateHighlight();

    if (!this.label) {
      this.hasSlottedContent = Array.from(this.childNodes).some(
        (n) => (n.textContent ?? '').trim().length > 0,
      );
    }
  }

  private handleSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    this.hasSlottedContent = slot
      .assignedNodes({ flatten: true })
      .some((node) => (node.textContent ?? '').trim().length > 0);
  }

  render() {
    return html`${this.renderStartIcon()}${this.renderLabel()}${this.renderEndIcon()}`;
  }

  renderStartIcon() {
    const icon = this.iconStart ?? this.icon;
    if (!icon) {
      return nothing;
    }

    return html`<er-icon icon=${icon}></er-icon>`;
  }

  renderEndIcon() {
    if (!this.iconEnd) {
      return nothing;
    }

    return html`<er-icon icon=${this.iconEnd}></er-icon>`;
  }

  renderLabel() {
    if (this.label) {
      return html`<div class="label"><slot>${this.label}</slot></div>`;
    }

    if (this.hasSlottedContent) {
      return html`<div class="label">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>`;
    }

    return html`<slot
      @slotchange=${this.handleSlotChange}
      style="display: none;"
    ></slot>`;
  }

  protected updated(changedProperties: PropertyValues<this>): void {
    super.updated(changedProperties);

    if (changedProperties.has('highlight')) {
      this.updateHighlight();
    }

    if (changedProperties.has('label') && !this.title) {
      this.title = this.label ?? '';
    }
  }

  updateHighlight() {
    if (!this.highlight) {
      this.style.setProperty('--er-button-highlight-color', 'transparent');
      return;
    }

    this.style.setProperty('--er-button-highlight-color', this.highlight);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'er-button': ErButton;
  }
}
