import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { breakpoints } from '../structure/devices';

/**
 * Spacer for controlling the spacing between flex elements of the page.
 */
@customElement('er-flex')
export class ErFlex extends LitElement {
  static styles = [
    css`
      :host {
        display: flex;
        flex-flow: row;
        gap: var(--er-flex-gap, var(--space-medium));
        max-width: 100%;
      }

      :host(.full) {
        width: 100%;
      }

      :host(.inline) {
        display: inline-flex;
      }

      :host(.overflow-hidden) {
        overflow: hidden;
      }

      :host(.gap-small) {
        --er-flex-gap: var(--space-small);
      }

      :host(.gap-large) {
        --er-flex-gap: var(--space-large);
      }

      :host(.gap-xlarge) {
        --er-flex-gap: var(--space-xlarge);
      }

      ::slotted(.grow) {
        flex-grow: 1;
      }

      ::slotted(.shrink) {
        flex-shrink: 1;
      }
    `,
    // Targeted breakpoint styles.
    ...breakpoints.mixupStyles((breakpoint) => {
      const styling = css`
        :host(.flow-column${breakpoint?.targetClass ?? css``}) {
          flex-flow: column;
        }

        :host(.flow-row${breakpoint?.targetClass ?? css``}) {
          flex-flow: row;
        }

        :host(.wrap${breakpoint?.targetClass ?? css``}) {
          flex-wrap: wrap;
        }

        :host(.align-flex-start${breakpoint?.targetClass ?? css``}) {
          align-items: flex-start;
        }

        :host(.align-flex-end${breakpoint?.targetClass ?? css``}) {
          align-items: flex-end;
        }

        :host(.align-baseline${breakpoint?.targetClass ?? css``}) {
          align-items: baseline;
        }

        :host(.align-center${breakpoint?.targetClass ?? css``}) {
          align-items: center;
        }

        :host(.align-space-between${breakpoint?.targetClass ?? css``}) {
          align-items: space-between;
        }

        :host(.align-space-around${breakpoint?.targetClass ?? css``}) {
          align-items: space-around;
        }

        :host(.align-space-evenly${breakpoint?.targetClass ?? css``}) {
          align-items: space-evenly;
        }

        :host(.justify-flex-start${breakpoint?.targetClass ?? css``}) {
          justify-content: flex-start;
        }

        :host(.justify-flex-end${breakpoint?.targetClass ?? css``}) {
          justify-content: flex-end;
        }

        :host(.justify-center${breakpoint?.targetClass ?? css``}) {
          justify-content: center;
        }

        :host(.justify-space-between${breakpoint?.targetClass ?? css``}) {
          justify-content: space-between;
        }

        :host(.justify-space-around${breakpoint?.targetClass ?? css``}) {
          justify-content: space-around;
        }

        :host(.justify-space-evenly${breakpoint?.targetClass ?? css``}) {
          justify-content: space-evenly;
        }

        :host(.basis-33${breakpoint?.targetClass ?? css``}) ::slotted(*) {
          flex-basis: calc(
            (100% - (var(--er-flex-gap, var(--space-medium)) * 2)) / 3
          );
        }

        :host(.basis-50${breakpoint?.targetClass ?? css``}) ::slotted(*) {
          flex-basis: calc(
            (100% - (var(--er-flex-gap, var(--space-medium)) * 1)) / 2
          );
        }

        :host(.basis-25${breakpoint?.targetClass ?? css``}) ::slotted(*) {
          flex-basis: calc(
            (100% - (var(--er-flex-gap, var(--space-medium)) * 3)) / 4
          );
        }

        :host(.basis-20${breakpoint?.targetClass ?? css``}) ::slotted(*) {
          flex-basis: calc(
            (100% - (var(--er-flex-gap, var(--space-medium)) * 4)) / 5
          );
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
  size = 'medium';

  render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'er-flex': ErFlex;
  }
}
