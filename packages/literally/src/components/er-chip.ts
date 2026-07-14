import './er-icon';
import { NavigationMixin } from '@littoral/literally/navigation/navigation.mixin';
import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Chip element for displaying info in a stylized way.
 *
 * @cssclass alignSelfCenter - Align the chip to the center of the cross axis.
 * @cssclass justifySelfCenter - Justify the chip to the center of the main axis.
 * @cssclass justifySelfFlexEnd - Justify the chip to the flex-end.
 * @cssclass full - Make the chip take the full width of its parent container.
 * @cssclass center - Center the text inside the chip.
 * @cssclass primary - Style the chip with the primary theme color.
 * @cssclass secondary - Style the chip with the secondary outline theme.
 * @cssclass tertiary - Style the chip with the tertiary text theme.
 * @cssclass capitalize - Capitalize the text in the chip.
 * @cssclass wrap - Enable text wrapping for the chip contents.
 * @cssclass themePrimary - Apply primary theme color.
 * @cssclass themeSecondary - Apply secondary theme color.
 * @cssclass themeTertiary - Apply tertiary theme color.
 * @cssclass themeError - Apply error theme color.
 * @cssclass link - Make the chip hoverable with a pointer cursor.
 */
@customElement('er-chip')
export class ErChip extends NavigationMixin(LitElement) {
  static styles = [
    css`
      :host {
        display: inline-grid;
        line-height: 1;
        white-space: nowrap;
        align-items: center;
        background-color: var(
          --er-chip-background-color,
          var(--md-sys-color-surface)
        );
        border: 1px solid var(--er-chip-border-color, transparent);
        border-radius: var(--er-chip-border-radius, var(--space-small));
        color: var(--er-chip-color, var(--md-sys-color-on-surface));
        font-family: var(--er-chip-font-family, var(--body-font-family));
        font-optical-sizing: var(
          --er-chip-font-optical-sizing,
          var(--body-font-optical-sizing)
        );
        font-size: var(--er-chip-font-size, var(--er-sys-body-font-size-small));
        font-weight: var(--er-chip-font-weight, var(--body-font-weight));
        grid-gap: var(--space-small);
        grid-template-columns: 1fr;
        padding: var(--space-xsmall) var(--space-small);
      }

      :host(.alignSelfCenter) {
        align-self: center;
      }

      :host(.justifySelfCenter) {
        justify-self: center;
      }

      :host(.justifySelfFlexEnd) {
        justify-self: flex-end;
      }

      :host(.full) {
        box-sizing: border-box;
        width: 100%;
      }

      :host(.center) {
        text-align: center;
      }

      :host(.primary) {
        --er-chip-background-color: var(--er-chip-theme-background-color);
        --er-chip-color: var(--er-chip-theme-color);
      }

      :host(.secondary) {
        --er-chip-border-color: var(--er-chip-theme-background-color);
        --er-chip-color: var(--er-chip-theme-background-color);
      }

      :host(.tertiary) {
        --er-chip-color: var(--er-chip-theme-color);
      }

      :host([icon-end]) {
        grid-template-columns: auto min-content;
      }

      :host([icon-start]) {
        grid-template-columns: min-content auto;
      }

      :host([icon-start][icon-end]) {
        grid-template-columns: min-content auto min-content;
      }

      :host(.themePrimary) {
        --er-chip-theme-background-color: var(--md-sys-color-primary);
        --er-chip-theme-color: var(--md-sys-color-on-primary);
      }

      :host(.themeSecondary) {
        --er-chip-theme-background-color: var(--md-sys-color-secondary);
        --er-chip-theme-color: var(--md-sys-color-on-secondary);
      }

      :host(.themeTertiary) {
        --er-chip-theme-background-color: var(--md-sys-color-tertiary);
        --er-chip-theme-color: var(--md-sys-color-on-tertiary);
      }

      :host(.themeError) {
        --er-chip-theme-background-color: var(--md-sys-color-error);
        --er-chip-theme-color: var(--md-sys-color-on-error);
      }

      :host(.link:hover),
      :host([path]:hover) {
        cursor: pointer;
      }

      :host(.link.secondary:hover),
      :host([path].secondary:hover) {
        --er-chip-background-color: var(--md-sys-color-surface-variant);
      }

      :host(.capitalize) {
        text-transform: capitalize;
      }

      ::slotted(*) {
        text-wrap: nowrap;
        white-space: nowrap;
      }

      :host(.wrap) {
        white-space: wrap;
        text-wrap: pretty;
      }

      :host(.wrap)::slotted(*) {
        text-wrap: pretty;
        white-space: wrap;
      }
    `,
  ];

  @property({ attribute: 'icon-start' })
  iconStart?: string;

  @property({ attribute: 'icon-end' })
  iconEnd?: string;

  render() {
    return html`
      ${this.renderStartIcon()}
      <slot></slot>
      ${this.renderEndIcon()}
    `;
  }

  renderEndIcon() {
    if (!this.iconEnd) {
      return nothing;
    }

    return html` <er-icon icon=${this.iconEnd}></er-icon> `;
  }

  renderStartIcon() {
    if (!this.iconStart) {
      return nothing;
    }

    return html` <er-icon icon=${this.iconStart}></er-icon> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'er-chip': ErChip;
  }
}
