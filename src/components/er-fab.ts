import { LitElement, PropertyValues, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { NavigationMixin } from '../navigation/navigation.mixin';
import { BreakpointDevice, breakpoints } from '../structure/devices';

/**
 * Fab visual element for collapsable button/links.
 */
@customElement('er-fab')
export class ErFab extends NavigationMixin(LitElement) {
  static styles = [
    css`
      :host {
        align-items: center;
        background-color: var(--er-fab-background-color, var(--md-sys-color-surface));
        border: 1px solid var(--er-fab-border-color, transparent);
        border-radius: var(--er-fab-border-radius, var(--space-small));
        box-sizing: border-box;
        color: var(--er-fab-color, var(--md-sys-color-on-surface));
        display: inline-flex;
        flex-direction: row;
        flex-wrap: nowrap;
        gap: var(--space-small);
        line-height: 1;
        padding: var(--space-small) var(--space-medium);
        white-space: nowrap;
      }

      :host([disabled]) {
        opacity: 0.5;
      }

      :host([highlight]) {
        background:
          radial-gradient(
            ellipse at 70% 5%,
            color-mix(in srgb, var(--er-fab-highlight-color) 32%, transparent),
            transparent 60%
          ),
          radial-gradient(
            ellipse at 12% 185%,
            color-mix(in srgb, var(--er-fab-highlight-color) 35%, transparent),
            transparent 60%
          );
      }

      :host(.primary) {
        --er-fab-background-color: var(--er-fab-theme-background-color);
        --er-fab-color: var(--er-fab-theme-color);
        --er-icon-color: var(--er-fab-theme-background-color);
        --er-icon-on-color: var(--er-fab-theme-color);
      }

      :host(.secondary) {
        --er-fab-border-color: var(--er-fab-theme-background-color);
        --er-fab-color: var(--er-fab-theme-background-color);
        --er-icon-on-color: var(--er-fab-theme-background-color);
      }

      :host(.tertiary) {
        --er-fab-background-color: transparent;
        --er-fab-color: var(--er-fab-theme-background-color);
        --er-icon-on-color: var(--er-fab-theme-background-color);
      }

      :host(.themePrimary) {
        --er-fab-theme-background-color: var(--md-sys-color-primary);
        --er-fab-theme-color: var(--md-sys-color-on-primary);
      }

      :host(.themeSecondary) {
        --er-fab-theme-background-color: var(--md-sys-color-secondary);
        --er-fab-theme-color: var(--md-sys-color-on-secondary);
      }

      :host(.themeTertiary) {
        --er-fab-theme-background-color: var(--md-sys-color-tertiary);
        --er-fab-theme-color: var(--md-sys-color-on-tertiary);
      }

      :host(.themeError) {
        --er-fab-theme-background-color: var(--md-sys-color-error);
        --er-fab-theme-color: var(--md-sys-color-on-error);
      }

      :host([path]:hover:not([disabled])),
      :host(.link:hover:not([disabled])) {
        outline: 1px solid
          color-mix(in srgb, var(--er-fab-theme-background-color) 60%, transparent);
        outline-offset: -1px;
        cursor: pointer;
      }
    `,
    // Targeted breakpoint styles.
    ...breakpoints.mixupStyles((breakpoint) => {
      const styling = css`
        :host(.full${breakpoint?.targetClass ?? css``}) {
          width: 100%;
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

  @property({ attribute: 'expanded', type: Boolean })
  expanded = false;

  @property({})
  highlight?: string;

  @property({})
  label?: string;

  connectedCallback(): void {
    super.connectedCallback();

    this.title = this.label ?? '';

    this.updateHighlight();
  }

  get isExpanded(): boolean {
    if (this.expanded) {
      return true;
    }

    let matchingBreakpoints: BreakpointDevice[] | undefined;

    for (const className of this.classList) {
      if (className === 'expanded') {
        return true;
      }

      // Allow expanding based on breakpoints using css classes.
      if (className.startsWith('expanded-')) {
        if (matchingBreakpoints === undefined) {
          matchingBreakpoints = breakpoints.findActiveBreakpoints();
        }

        for (const matchingBreakpoint of matchingBreakpoints) {
          if (
            className === `expanded${matchingBreakpoint.targetClass.toString()}`
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }

  render() {
    return html`${this.renderIcon()}${this.renderLabel()}`;
  }

  renderIcon() {
    if (!this.icon) {
      return nothing;
    }

    return html`<er-icon icon=${this.icon}></er-icon>`;
  }

  renderLabel() {
    const shouldCollapse = this.icon && !this.isExpanded;

    if (!this.label || shouldCollapse) {
      return nothing;
    }

    return html`<div class="label">${this.label}</div>`;
  }

  protected updated(changedProperties: PropertyValues<this>): void {
    super.updated(changedProperties);

    if (changedProperties.has('highlight')) {
      this.updateHighlight();
    }
  }

  updateHighlight() {
    if (!this.highlight) {
      this.style.setProperty('--er-fab-highlight-color', 'transparent');
      return;
    }

    this.style.setProperty('--er-fab-highlight-color', this.highlight);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'er-fab': ErFab;
  }
}
