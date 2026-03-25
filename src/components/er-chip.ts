import './er-icon';
import { NavigationMixin } from '@littoral/literally/navigation/navigation.mixin';
import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Chip element for displaying info in a stylized way.
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

      :host(.align-self-center) {
        align-self: center;
      }

      :host(.justify-self-center) {
        justify-self: center;
      }

      :host(.justify-self-flex-end) {
        justify-self: flex-end;
      }

      :host(.primary) {
        --er-chip-background-color: var(--er-chip-theme-background-color);
        --er-chip-color: var(--er-chip-theme-color);
      }

      :host(.secondary) {
        --er-chip-border-color: var(--er-chip-theme-background-color);
        --er-chip-color: var(--er-chip-theme-background-color);
      }

      :host(.secondary:hover) {
        --er-chip-background-color: var(--md-sys-color-surface-variant);
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

      ::slotted(*) {
        text-wrap: nowrap;
        white-space: nowrap;
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
