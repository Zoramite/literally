import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { breakpoints } from './devices';

/**
 * Spacer for controlling the spacing between vertical elements of the page.
 */
@customElement('er-flex')
export class ErFlex extends LitElement {
  static styles = [
    css`
      :host {
        display: flex;
        flex-flow: row;
        gap: var(--er-flex-gap, var(--space-medium));
      }

      :host(.full) {
        width: 100%;
      }

      :host(.overflow-hidden) {
        overflow: hidden;
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
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'er-flex': ErFlex;
  }
}
