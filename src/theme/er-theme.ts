import { LitElement, css, html } from 'lit';

/**
 * Theme element for controlling the css variables for all elements contained
 * within.
 *
 * Theme variables created using:
 * https://material-foundation.github.io/material-theme-builder/
 *
 * @slot - All elements to be themed.
 */
export class ErTheme extends LitElement {
  static darkTheme = css`
    /*  Dark theme css variables. */
    --md-sys-color-primary: rgb(177 197 255);
    --md-sys-color-surface-tint: rgb(177 197 255);
    --md-sys-color-on-primary: rgb(22 46 96);
    --md-sys-color-primary-container: rgb(47 69 120);
    --md-sys-color-on-primary-container: rgb(217 226 255);
    --md-sys-color-secondary: rgb(192 198 220);
    --md-sys-color-on-secondary: rgb(42 48 66);
    --md-sys-color-secondary-container: rgb(64 70 89);
    --md-sys-color-on-secondary-container: rgb(220 226 249);
    --md-sys-color-tertiary: rgb(224 187 221);
    --md-sys-color-on-tertiary: rgb(65 39 66);
    --md-sys-color-tertiary-container: rgb(89 61 89);
    --md-sys-color-on-tertiary-container: rgb(253 215 250);
    --md-sys-color-error: rgb(255 180 171);
    --md-sys-color-on-error: rgb(105 0 5);
    --md-sys-color-error-container: rgb(147 0 10);
    --md-sys-color-on-error-container: rgb(255 218 214);
    --md-sys-color-background: rgb(18 19 24);
    --md-sys-color-on-background: rgb(226 226 233);
    --md-sys-color-surface: rgb(18 19 24);
    --md-sys-color-on-surface: rgb(226 226 233);
    --md-sys-color-surface-variant: rgb(68 70 79);
    --md-sys-color-on-surface-variant: rgb(197 198 208);
    --md-sys-color-outline: rgb(143 144 153);
    --md-sys-color-outline-variant: rgb(68 70 79);
    --md-sys-color-shadow: rgb(0 0 0);
    --md-sys-color-scrim: rgb(0 0 0);
    --md-sys-color-inverse-surface: rgb(226 226 233);
    --md-sys-color-inverse-on-surface: rgb(47 48 54);
    --md-sys-color-inverse-primary: rgb(71 93 146);
    --md-sys-color-primary-fixed: rgb(217 226 255);
    --md-sys-color-on-primary-fixed: rgb(0 25 70);
    --md-sys-color-primary-fixed-dim: rgb(177 197 255);
    --md-sys-color-on-primary-fixed-variant: rgb(47 69 120);
    --md-sys-color-secondary-fixed: rgb(220 226 249);
    --md-sys-color-on-secondary-fixed: rgb(21 27 44);
    --md-sys-color-secondary-fixed-dim: rgb(192 198 220);
    --md-sys-color-on-secondary-fixed-variant: rgb(64 70 89);
    --md-sys-color-tertiary-fixed: rgb(253 215 250);
    --md-sys-color-on-tertiary-fixed: rgb(42 18 44);
    --md-sys-color-tertiary-fixed-dim: rgb(224 187 221);
    --md-sys-color-on-tertiary-fixed-variant: rgb(89 61 89);
    --md-sys-color-surface-dim: rgb(18 19 24);
    --md-sys-color-surface-bright: rgb(56 57 63);
    --md-sys-color-surface-container-lowest: rgb(12 14 19);
    --md-sys-color-surface-container-low: rgb(26 27 33);
    --md-sys-color-surface-container: rgb(30 31 37);
    --md-sys-color-surface-container-high: rgb(40 42 47);
    --md-sys-color-surface-container-highest: rgb(51 52 58);
  `;

  static lightTheme = css`
    /*  Light theme css variables. */
    --md-sys-color-primary: rgb(71 93 146);
    --md-sys-color-surface-tint: rgb(71 93 146);
    --md-sys-color-on-primary: rgb(255 255 255);
    --md-sys-color-primary-container: rgb(217 226 255);
    --md-sys-color-on-primary-container: rgb(0 25 70);
    --md-sys-color-secondary: rgb(88 94 113);
    --md-sys-color-on-secondary: rgb(255 255 255);
    --md-sys-color-secondary-container: rgb(220 226 249);
    --md-sys-color-on-secondary-container: rgb(21 27 44);
    --md-sys-color-tertiary: rgb(114 85 114);
    --md-sys-color-on-tertiary: rgb(255 255 255);
    --md-sys-color-tertiary-container: rgb(253 215 250);
    --md-sys-color-on-tertiary-container: rgb(42 18 44);
    --md-sys-color-error: rgb(186 26 26);
    --md-sys-color-on-error: rgb(255 255 255);
    --md-sys-color-error-container: rgb(255 218 214);
    --md-sys-color-on-error-container: rgb(65 0 2);
    --md-sys-color-background: rgb(250 248 255);
    --md-sys-color-on-background: rgb(26 27 33);
    --md-sys-color-surface: rgb(250 248 255);
    --md-sys-color-on-surface: rgb(26 27 33);
    --md-sys-color-surface-variant: rgb(225 226 236);
    --md-sys-color-on-surface-variant: rgb(68 70 79);
    --md-sys-color-outline: rgb(117 119 128);
    --md-sys-color-outline-variant: rgb(197 198 208);
    --md-sys-color-shadow: rgb(0 0 0);
    --md-sys-color-scrim: rgb(0 0 0);
    --md-sys-color-inverse-surface: rgb(47 48 54);
    --md-sys-color-inverse-on-surface: rgb(241 240 247);
    --md-sys-color-inverse-primary: rgb(177 197 255);
    --md-sys-color-primary-fixed: rgb(217 226 255);
    --md-sys-color-on-primary-fixed: rgb(0 25 70);
    --md-sys-color-primary-fixed-dim: rgb(177 197 255);
    --md-sys-color-on-primary-fixed-variant: rgb(47 69 120);
    --md-sys-color-secondary-fixed: rgb(220 226 249);
    --md-sys-color-on-secondary-fixed: rgb(21 27 44);
    --md-sys-color-secondary-fixed-dim: rgb(192 198 220);
    --md-sys-color-on-secondary-fixed-variant: rgb(64 70 89);
    --md-sys-color-tertiary-fixed: rgb(253 215 250);
    --md-sys-color-on-tertiary-fixed: rgb(42 18 44);
    --md-sys-color-tertiary-fixed-dim: rgb(224 187 221);
    --md-sys-color-on-tertiary-fixed-variant: rgb(89 61 89);
    --md-sys-color-surface-dim: rgb(218 217 224);
    --md-sys-color-surface-bright: rgb(250 248 255);
    --md-sys-color-surface-container-lowest: rgb(255 255 255);
    --md-sys-color-surface-container-low: rgb(244 243 250);
    --md-sys-color-surface-container: rgb(238 237 244);
    --md-sys-color-surface-container-high: rgb(232 231 239);
    --md-sys-color-surface-container-highest: rgb(226 226 233);
  `;

  static styles = [
    css`
      /**
     * General, non-color variables.
     *
     * Dynamic clamps from:
     * https://docs.google.com/spreadsheets/d/19SINDcV-eMSv1A4VSwGY-Ltl5v7y4DBE1dPQj26VLTg
     */
      :host {
        --er-sys-body-font-size-xsmall: clamp(10px, 1.4323vw, 12px);
        --er-sys-body-font-size-small: clamp(14px, 1.9531vw, 16px);
        --er-sys-body-font-size-medium: clamp(16px, 2.2135vw, 18px);
        --er-sys-body-font-size-large: clamp(18px, 2.6042vw, 22px);

        --er-sys-title-font-size-h1: clamp(32px, 4.6875vw, 40px);
        --er-sys-title-font-size-h2: clamp(28px, 3.9063vw, 34px);
        --er-sys-title-font-size-h3: clamp(22px, 3.125vw, 28px);
        --er-sys-title-font-size-h4: clamp(18px, 2.6042vw, 22px);
        --er-sys-title-font-size-h5: clamp(16px, 2.3438vw, 20px);
        --er-sys-title-font-size-h6: clamp(14px, 2.0833vw, 18px);

        --space-none: clamp(0px, 0vw, 0px);
        --space-xxsmall: clamp(1px, 0.2604vw, 2px);
        --space-xsmall: clamp(2px, 0.3906vw, 4px);
        --space-small: clamp(5px, 0.7813vw, 8px);
        --space-medium: clamp(12px, 1.8229vw, 16px);
        --space-large: clamp(18px, 2.6042vw, 24px);
        --space-xlarge: clamp(24px, 3.3854vw, 30px);
        --space-xxlarge: clamp(30px, 4.2969vw, 36px);
        --space-xxxlarge: clamp(36px, 5.0781vw, 42px);
        --space-xxxxlarge: clamp(42px, 6.5104vw, 58px);

        --animation-timing-xxxshort: 120ms;
        --animation-timing-xxshort: 250ms;
        --animation-timing-xshort: 500ms;
        --animation-timing-short: 1s;
        --animation-timing-medium: 2s;
        --animation-timing-long: 3s;
        --animation-timing-xlong: 5s;

        --grid-margin: clamp(18px, 2.6042vw, 24px);
        --grid-gap: clamp(14px, 2.0833vw, 18px);

        --body-font-family: 'Comfortaa', sans-serif;
        --body-font-optical-sizing: auto;
        --body-font-weight: 400;

        --title-font-family: 'Titillium Web', sans-serif;
        --title-font-optical-sizing: auto;
        --title-font-weight: 700;
      }

      @media (prefers-color-scheme: light) {
        :host {
          ${ErTheme.lightTheme};
        }
      }

      @media (prefers-color-scheme: dark) {
        :host {
          ${ErTheme.darkTheme};
        }
      }

      :host(.light) {
        ${ErTheme.lightTheme};
      }

      :host(.dark) {
        ${ErTheme.darkTheme};
      }
    `,
  ];

  render() {
    return html` <slot></slot> `;
  }
}
