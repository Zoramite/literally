import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { tablet, desktop, mobile, print } from './devices';

/**
 * Grid for controlling the layout of the page.
 *
 * @slot - Grid contents.
 */
@customElement('er-grid')
export class ErGrid extends LitElement {
  static styles = [
    css`
      :host {
        column-gap: var(--grid-gap);
        display: grid;
        /* 4 Columns on mobile */
        grid-template-columns: repeat(4, 1fr);
        margin: 0 var(--grid-margin);
        row-gap: var(--grid-gap-row, var(--space-medium));
      }

      ${tablet.mediaQuery} {
        :host {
          /* 8 Columns on tablet */
          grid-template-columns: repeat(8, 1fr);
        }
      }

      ${desktop.mediaQuery} {
        :host {
          /* 12 Columns on desktop */
          grid-template-columns: repeat(12, 1fr);
        }
      }

      ${print.mediaQuery} {
        :host {
          /* 8 Columns on print */
          grid-template-columns: repeat(8, 1fr);
        }
      }
    `,
  ];

  render() {
    return html`<slot></slot>`;
  }
}

/**
 * Grid item for displaying content inside the grid.
 *
 * @slot - Grid item contents.
 */
@customElement('er-grid-item')
export class ErGridItem extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }

      /**
     * Default spans for all breakpoints to full width.
     */
      ${mobile.mediaQuery} {
        :host {
          grid-column-end: span 4;
        }
      }

      ${tablet.mediaQuery} {
        :host {
          grid-column-end: span 8;
        }
      }

      ${desktop.mediaQuery} {
        :host {
          grid-column-end: span 12;
        }
      }

      ${print.mediaQuery} {
        :host {
          grid-column-end: span 8;
        }
      }

      /**
     * Grid settings per attributes.
     */

      ${mobile.mediaQuery} {
        /* Mobile span attribute. */
        :host([span*='mobile:1']) {
          grid-column-end: span 1;
        }

        :host([span*='mobile:2']) {
          grid-column-end: span 2;
        }

        :host([span*='mobile:3']) {
          grid-column-end: span 3;
        }

        :host([span*='mobile:4']) {
          grid-column-end: span 4;
        }

        /* Mobile start attribute. */
        :host([start*='mobile:1']) {
          grid-column-start: 1;
        }

        :host([start*='mobile:2']) {
          grid-column-start: 2;
        }

        :host([start*='mobile:3']) {
          grid-column-start: 3;
        }

        :host([start*='mobile:4']) {
          grid-column-start: 4;
        }

        /* Mobile end attribute. */
        :host([end*='mobile:2']) {
          grid-column-end: 2;
        }

        :host([end*='mobile:3']) {
          grid-column-end: 3;
        }

        :host([end*='mobile:4']) {
          grid-column-end: 4;
        }

        :host([end*='mobile:5']) {
          grid-column-end: 5;
        }
      }

      ${tablet.mediaQuery} {
        /* Tablet span attribute. */
        :host([span*='tablet:1']) {
          grid-column-end: span 1;
        }

        :host([span*='tablet:2']) {
          grid-column-end: span 2;
        }

        :host([span*='tablet:3']) {
          grid-column-end: span 3;
        }

        :host([span*='tablet:4']) {
          grid-column-end: span 4;
        }

        :host([span*='tablet:5']) {
          grid-column-end: span 5;
        }

        :host([span*='tablet:6']) {
          grid-column-end: span 6;
        }

        :host([span*='tablet:7']) {
          grid-column-end: span 7;
        }

        :host([span*='tablet:8']) {
          grid-column-end: span 8;
        }

        /* Tablet start attribute. */
        :host([start*='tablet:1']) {
          grid-column-start: 1;
        }

        :host([start*='tablet:2']) {
          grid-column-start: 2;
        }

        :host([start*='tablet:3']) {
          grid-column-start: 3;
        }

        :host([start*='tablet:4']) {
          grid-column-start: 4;
        }

        :host([start*='tablet:5']) {
          grid-column-start: 5;
        }

        :host([start*='tablet:6']) {
          grid-column-start: 6;
        }

        :host([start*='tablet:7']) {
          grid-column-start: 7;
        }

        :host([start*='tablet:8']) {
          grid-column-start: 8;
        }

        /* Tablet end attribute. */
        :host([end*='tablet:2']) {
          grid-column-end: 2;
        }

        :host([end*='tablet:3']) {
          grid-column-end: 3;
        }

        :host([end*='tablet:4']) {
          grid-column-end: 4;
        }

        :host([end*='tablet:5']) {
          grid-column-end: 5;
        }

        :host([end*='tablet:6']) {
          grid-column-end: 6;
        }

        :host([end*='tablet:7']) {
          grid-column-end: 7;
        }

        :host([end*='tablet:8']) {
          grid-column-end: 8;
        }

        :host([end*='tablet:9']) {
          grid-column-end: 9;
        }
      }

      ${desktop.mediaQuery} {
        /* Desktop span attribute. */
        :host([span*='desktop:1']) {
          grid-column-end: span 1;
        }

        :host([span*='desktop:2']) {
          grid-column-end: span 2;
        }

        :host([span*='desktop:3']) {
          grid-column-end: span 3;
        }

        :host([span*='desktop:4']) {
          grid-column-end: span 4;
        }

        :host([span*='desktop:5']) {
          grid-column-end: span 5;
        }

        :host([span*='desktop:6']) {
          grid-column-end: span 6;
        }

        :host([span*='desktop:7']) {
          grid-column-end: span 7;
        }

        :host([span*='desktop:8']) {
          grid-column-end: span 8;
        }

        :host([span*='desktop:9']) {
          grid-column-end: span 9;
        }

        :host([span*='desktop:10']) {
          grid-column-end: span 10;
        }

        :host([span*='desktop:11']) {
          grid-column-end: span 11;
        }

        :host([span*='desktop:12']) {
          grid-column-end: span 12;
        }

        /* Desktop start attribute. */
        :host([start*='desktop:1']) {
          grid-column-start: 1;
        }

        :host([start*='desktop:2']) {
          grid-column-start: 2;
        }

        :host([start*='desktop:3']) {
          grid-column-start: 3;
        }

        :host([start*='desktop:4']) {
          grid-column-start: 4;
        }

        :host([start*='desktop:5']) {
          grid-column-start: 5;
        }

        :host([start*='desktop:6']) {
          grid-column-start: 6;
        }

        :host([start*='desktop:7']) {
          grid-column-start: 7;
        }

        :host([start*='desktop:8']) {
          grid-column-start: 8;
        }

        :host([start*='desktop:9']) {
          grid-column-start: 9;
        }

        :host([start*='desktop:10']) {
          grid-column-start: 10;
        }

        :host([start*='desktop:11']) {
          grid-column-start: 11;
        }

        :host([start*='desktop:12']) {
          grid-column-start: 12;
        }

        /* Desktop end attribute. */
        :host([end*='desktop:2']) {
          grid-column-end: 2;
        }

        :host([end*='desktop:3']) {
          grid-column-end: 3;
        }

        :host([end*='desktop:4']) {
          grid-column-end: 4;
        }

        :host([end*='desktop:5']) {
          grid-column-end: 5;
        }

        :host([end*='desktop:6']) {
          grid-column-end: 6;
        }

        :host([end*='desktop:7']) {
          grid-column-end: 7;
        }

        :host([end*='desktop:8']) {
          grid-column-end: 8;
        }

        :host([end*='desktop:9']) {
          grid-column-end: 9;
        }

        :host([end*='desktop:10']) {
          grid-column-end: 10;
        }

        :host([end*='desktop:11']) {
          grid-column-end: 11;
        }

        :host([end*='desktop:12']) {
          grid-column-end: 12;
        }

        :host([end*='desktop:13']) {
          grid-column-end: 13;
        }
      }

      ${print.mediaQuery} {
        /* Tablet span attribute. */
        :host([span*='print:1']) {
          grid-column-end: span 1;
        }

        :host([span*='print:2']) {
          grid-column-end: span 2;
        }

        :host([span*='print:3']) {
          grid-column-end: span 3;
        }

        :host([span*='print:4']) {
          grid-column-end: span 4;
        }

        :host([span*='print:5']) {
          grid-column-end: span 5;
        }

        :host([span*='print:6']) {
          grid-column-end: span 6;
        }

        :host([span*='print:7']) {
          grid-column-end: span 7;
        }

        :host([span*='print:8']) {
          grid-column-end: span 8;
        }

        /* Tablet start attribute. */
        :host([start*='print:1']) {
          grid-column-start: 1;
        }

        :host([start*='print:2']) {
          grid-column-start: 2;
        }

        :host([start*='print:3']) {
          grid-column-start: 3;
        }

        :host([start*='print:4']) {
          grid-column-start: 4;
        }

        :host([start*='print:5']) {
          grid-column-start: 5;
        }

        :host([start*='print:6']) {
          grid-column-start: 6;
        }

        :host([start*='print:7']) {
          grid-column-start: 7;
        }

        :host([start*='print:8']) {
          grid-column-start: 8;
        }

        /* Tablet end attribute. */
        :host([end*='print:2']) {
          grid-column-end: 2;
        }

        :host([end*='print:3']) {
          grid-column-end: 3;
        }

        :host([end*='print:4']) {
          grid-column-end: 4;
        }

        :host([end*='print:5']) {
          grid-column-end: 5;
        }

        :host([end*='print:6']) {
          grid-column-end: 6;
        }

        :host([end*='print:7']) {
          grid-column-end: 7;
        }

        :host([end*='print:8']) {
          grid-column-end: 8;
        }

        :host([end*='print:9']) {
          grid-column-end: 9;
        }
      }
    `,
  ];

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'er-grid': ErGrid;
    'er-grid-item': ErGridItem;
  }
}
