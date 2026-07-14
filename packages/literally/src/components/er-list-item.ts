import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { NavigationMixin } from '../navigation/navigation.mixin';
import './er-icon';

/**
 * List item element for displaying interactive items with icons and content.
 *
 * @cssclass content - Style the main text/body container inside the list item.
 */
@customElement('er-list-item')
export class ErListItem extends NavigationMixin(LitElement) {
  static styles = [
    css`
      :host {
        align-items: center;
        background-color: var(--er-list-item-background-color, transparent);
        border-radius: var(--er-list-item-border-radius, var(--space-small));
        box-sizing: border-box;
        color: var(--er-list-item-color, var(--md-sys-color-on-surface));
        cursor: pointer;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        gap: var(--space-medium);
        padding: var(--space-small) var(--space-medium);
        transition:
          background-color 0.2s ease,
          transform 0.1s ease;
      }

      :host(:hover) {
        background-color: var(
          --md-sys-color-surface-container-highest,
          rgba(0, 0, 0, 0.05)
        );
        transform: translateX(4px);
      }

      :host([selected]) {
        background-color: var(
          --md-sys-color-primary-container,
          rgba(0, 120, 255, 0.15)
        );
        color: var(--md-sys-color-on-primary-container);
        font-weight: bold;
      }

      :host(:not([selected])) er-icon {
        opacity: 0.25;
      }

      .content {
        flex-grow: 1;
      }
    `,
  ];

  @property({ attribute: 'icon' })
  icon?: string;

  @property({ attribute: 'icon-color' })
  iconColor?: string;

  @property({ type: Boolean, reflect: true })
  selected = false;

  render() {
    return html`
      ${this.renderIcon()}
      <div class="content">
        <slot></slot>
      </div>
    `;
  }

  renderIcon() {
    if (!this.icon) {
      return nothing;
    }

    return html`
      <er-icon
        class="themePrimary rounded padSmall"
        icon=${this.icon}
        color=${this.iconColor || nothing}
      ></er-icon>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'er-list-item': ErListItem;
  }
}
