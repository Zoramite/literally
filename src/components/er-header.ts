import { breakpoints } from '@littoral/literally/structure/devices';
import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
 * Customized header styling.
 */
export class ErHeader extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        font-family: var(
          --er-header-title-font-family,
          var(--title-font-family)
        );
        font-optical-sizing: var(
          --er-header-title-font-optical-sizing,
          var(--title-font-optical-sizing)
        );
        font-size: var(--er-header-title-font-size);
        font-weight: var(
          --er-header-title-font-weight,
          var(--title-font-weight)
        );
        margin: var(--er-header-margin-top, 0) 0
          var(--er-header-margin-bottom, 0) 0;
        padding: 0;
      }

      :host(.margin-after-medium) {
        --er-header-margin-bottom: var(--space-medium);
      }
    `,
    // Targeted breakpoint styles.
    ...breakpoints.mixupStyles((breakpoint) => {
      const styling = css`
        :host(.center${breakpoint?.targetClass ?? css``}) {
          text-align: center;
        }

        :host(.right${breakpoint?.targetClass ?? css``}) {
          text-align: right;
        }

        :host(.left${breakpoint?.targetClass ?? css``}) {
          text-align: left;
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
}

/**
 * Customized h1
 */
@customElement('er-h1')
export class ErH1 extends ErHeader {
  static styles = [
    ...ErHeader.styles,
    css`
      :host {
        --er-header-title-font-family: var(
            --er-h1-title-font-family,
            var(--title-font-family)
          )
          --er-header-title-font-optical-sizing: var(
            --er-h1-title-font-optical-sizing,
            var(--title-font-optical-sizing)
          );
        --er-header-title-font-size: var(
          --er-h1-title-font-size,
          var(--er-sys-title-font-size-h1)
        );
        --er-header-title-font-weight: var(
          --er-h1-title-font-weight,
          var(--title-font-weight)
        );
      }
    `,
  ];

  render() {
    return html` <h1><slot></slot></h1> `;
  }
}

/**
 * Customized h2
 */
@customElement('er-h2')
export class ErH2 extends ErHeader {
  static styles = [
    ...ErHeader.styles,
    css`
      :host {
        --er-header-title-font-family: var(
            --er-h2-title-font-family,
            var(--title-font-family)
          )
          --er-header-title-font-optical-sizing: var(
            --er-h2-title-font-optical-sizing,
            var(--title-font-optical-sizing)
          );
        --er-header-title-font-size: var(
          --er-h2-title-font-size,
          var(--er-sys-title-font-size-h2)
        );
        --er-header-title-font-weight: var(
          --er-h2-title-font-weight,
          var(--title-font-weight)
        );
      }
    `,
  ];

  render() {
    return html` <h2><slot></slot></h2> `;
  }
}

/**
 * Customized h3
 */
@customElement('er-h3')
export class ErH3 extends ErHeader {
  static styles = [
    ...ErHeader.styles,
    css`
      :host {
        --er-header-title-font-family: var(
            --er-h3-title-font-family,
            var(--title-font-family)
          )
          --er-header-title-font-optical-sizing: var(
            --er-h3-title-font-optical-sizing,
            var(--title-font-optical-sizing)
          );
        --er-header-title-font-size: var(
          --er-h3-title-font-size,
          var(--er-sys-title-font-size-h3)
        );
        --er-header-title-font-weight: var(
          --er-h3-title-font-weight,
          var(--title-font-weight)
        );
      }
    `,
  ];

  render() {
    return html` <h3><slot></slot></h3> `;
  }
}

/**
 * Customized h4
 */
@customElement('er-h4')
export class ErH4 extends ErHeader {
  static styles = [
    ...ErHeader.styles,
    css`
      :host {
        --er-header-title-font-family: var(
            --er-h4-title-font-family,
            var(--title-font-family)
          )
          --er-header-title-font-optical-sizing: var(
            --er-h4-title-font-optical-sizing,
            var(--title-font-optical-sizing)
          );
        --er-header-title-font-size: var(
          --er-h4-title-font-size,
          var(--er-sys-title-font-size-h4)
        );
        --er-header-title-font-weight: var(
          --er-h4-title-font-weight,
          var(--title-font-weight)
        );
      }
    `,
  ];

  render() {
    return html` <h4><slot></slot></h4> `;
  }
}

/**
 * Customized h5
 */
@customElement('er-h5')
export class ErH5 extends ErHeader {
  static styles = [
    ...ErHeader.styles,
    css`
      :host {
        --er-header-title-font-family: var(
            --er-h5-title-font-family,
            var(--title-font-family)
          )
          --er-header-title-font-optical-sizing: var(
            --er-h5-title-font-optical-sizing,
            var(--title-font-optical-sizing)
          );
        --er-header-title-font-size: var(
          --er-h5-title-font-size,
          var(--er-sys-title-font-size-h5)
        );
        --er-header-title-font-weight: var(
          --er-h5-title-font-weight,
          var(--title-font-weight)
        );
      }
    `,
  ];

  render() {
    return html` <h5><slot></slot></h5> `;
  }
}

/**
 * Customized h6
 */
@customElement('er-h6')
export class ErH6 extends ErHeader {
  static styles = [
    ...ErHeader.styles,
    css`
      :host {
        --er-header-title-font-family: var(
            --er-h6-title-font-family,
            var(--title-font-family)
          )
          --er-header-title-font-optical-sizing: var(
            --er-h6-title-font-optical-sizing,
            var(--title-font-optical-sizing)
          );
        --er-header-title-font-size: var(
          --er-h6-title-font-size,
          var(--er-sys-title-font-size-h6)
        );
        --er-header-title-font-weight: var(
          --er-h6-title-font-weight,
          var(--title-font-weight)
        );
      }
    `,
  ];

  render() {
    return html` <h6><slot></slot></h6> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'er-h1': ErH1;
    'er-h2': ErH2;
    'er-h3': ErH3;
    'er-h4': ErH4;
    'er-h5': ErH5;
    'er-h6': ErH6;
  }
}
