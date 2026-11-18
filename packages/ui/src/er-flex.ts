import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { breakpoints } from '../structure/devices';

/**
 * Spacer for controlling the spacing between flex elements of the page.
 *
 * @cssclass full - Make the flex container take 100% width.
 * @cssclass inline - Set display to inline-flex.
 * @cssclass overflowHidden - Set overflow to hidden.
 * @cssclass gapSmall - Set small gap spacing.
 * @cssclass gapLarge - Set large gap spacing.
 * @cssclass gapXlarge - Set extra large gap spacing.
 * @cssclass flowColumn - Set flex direction to column. Supports breakpoint suffixes (e.g. flowColumnOnMobile).
 * @cssclass flowRow - Set flex direction to row. Supports breakpoint suffixes (e.g. flowRowOnMobile).
 * @cssclass wrap - Enable flex wrapping. Supports breakpoint suffixes (e.g. wrapOnMobile).
 * @cssclass alignFlexStart - Align items to flex-start. Supports breakpoint suffixes (e.g. alignFlexStartOnMobile).
 * @cssclass alignFlexEnd - Align items to flex-end. Supports breakpoint suffixes (e.g. alignFlexEndOnMobile).
 * @cssclass alignBaseline - Align items to baseline. Supports breakpoint suffixes (e.g. alignBaselineOnMobile).
 * @cssclass alignCenter - Align items to center. Supports breakpoint suffixes (e.g. alignCenterOnMobile).
 * @cssclass alignSpaceBetween - Align items with space-between. Supports breakpoint suffixes (e.g. alignSpaceBetweenOnMobile).
 * @cssclass alignSpaceAround - Align items with space-around. Supports breakpoint suffixes (e.g. alignSpaceAroundOnMobile).
 * @cssclass alignSpaceEvenly - Align items with space-evenly. Supports breakpoint suffixes (e.g. alignSpaceEvenlyOnMobile).
 * @cssclass justifyFlexStart - Justify content to flex-start. Supports breakpoint suffixes (e.g. justifyFlexStartOnMobile).
 * @cssclass justifyFlexEnd - Justify content to flex-end. Supports breakpoint suffixes (e.g. justifyFlexEndOnMobile).
 * @cssclass justifyCenter - Justify content to center. Supports breakpoint suffixes (e.g. justifyCenterOnMobile).
 * @cssclass justifySpaceBetween - Justify content with space-between. Supports breakpoint suffixes (e.g. justifySpaceBetweenOnMobile).
 * @cssclass justifySpaceAround - Justify content with space-around. Supports breakpoint suffixes (e.g. justifySpaceAroundOnMobile).
 * @cssclass justifySpaceEvenly - Justify content with space-evenly. Supports breakpoint suffixes (e.g. justifySpaceEvenlyOnMobile).
 * @cssclass basis33 - Set flex basis to 33.3% for slotted items. Supports breakpoint suffixes (e.g. basis33OnMobile).
 * @cssclass basis50 - Set flex basis to 50% for slotted items. Supports breakpoint suffixes (e.g. basis50OnMobile).
 * @cssclass basis25 - Set flex basis to 25% for slotted items. Supports breakpoint suffixes (e.g. basis25OnMobile).
 * @cssclass basis20 - Set flex basis to 20% for slotted items. Supports breakpoint suffixes (e.g. basis20OnMobile).
 * @cssclass grow - Set flex grow to 1 on slotted children.
 * @cssclass shrink - Set flex shrink to 1 on slotted children.
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

      :host(.overflowHidden) {
        overflow: hidden;
      }

      :host(.gapSmall) {
        --er-flex-gap: var(--space-small);
      }

      :host(.gapLarge) {
        --er-flex-gap: var(--space-large);
      }

      :host(.gapXlarge) {
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
        :host(.flowColumn${breakpoint?.targetClass ?? css``}) {
          flex-flow: column;
        }

        :host(.flowRow${breakpoint?.targetClass ?? css``}) {
          flex-flow: row;
        }

        :host(.wrap${breakpoint?.targetClass ?? css``}) {
          flex-wrap: wrap;
        }

        :host(.alignFlexStart${breakpoint?.targetClass ?? css``}) {
          align-items: flex-start;
        }

        :host(.alignFlexEnd${breakpoint?.targetClass ?? css``}) {
          align-items: flex-end;
        }

        :host(.alignBaseline${breakpoint?.targetClass ?? css``}) {
          align-items: baseline;
        }

        :host(.alignCenter${breakpoint?.targetClass ?? css``}) {
          align-items: center;
        }

        :host(.alignSpaceBetween${breakpoint?.targetClass ?? css``}) {
          align-items: space-between;
        }

        :host(.alignSpaceAround${breakpoint?.targetClass ?? css``}) {
          align-items: space-around;
        }

        :host(.alignSpaceEvenly${breakpoint?.targetClass ?? css``}) {
          align-items: space-evenly;
        }

        :host(.justifyFlexStart${breakpoint?.targetClass ?? css``}) {
          justify-content: flex-start;
        }

        :host(.justifyFlexEnd${breakpoint?.targetClass ?? css``}) {
          justify-content: flex-end;
        }

        :host(.justify-center${breakpoint?.targetClass ?? css``}) {
          justify-content: center;
        }

        :host(.justifySpaceBetween${breakpoint?.targetClass ?? css``}) {
          justify-content: space-between;
        }

        :host(.justifySpaceAround${breakpoint?.targetClass ?? css``}) {
          justify-content: space-around;
        }

        :host(.justifySpaceEvenly${breakpoint?.targetClass ?? css``}) {
          justify-content: space-evenly;
        }

        :host(.basis33${breakpoint?.targetClass ?? css``}) ::slotted(*) {
          flex-basis: calc(
            (100% - (var(--er-flex-gap, var(--space-medium)) * 2)) / 3
          );
        }

        :host(.basis50${breakpoint?.targetClass ?? css``}) ::slotted(*) {
          flex-basis: calc(
            (100% - (var(--er-flex-gap, var(--space-medium)) * 1)) / 2
          );
        }

        :host(.basis25${breakpoint?.targetClass ?? css``}) ::slotted(*) {
          flex-basis: calc(
            (100% - (var(--er-flex-gap, var(--space-medium)) * 3)) / 4
          );
        }

        :host(.basis20${breakpoint?.targetClass ?? css``}) ::slotted(*) {
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
