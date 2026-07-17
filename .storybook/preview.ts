import type { Preview } from '@storybook/web-components';

import { css, html } from 'lit';
import { LitElement } from 'lit';

import { ThemeMixin } from '../packages/literally/src/theme/theme.mixin';

class StorybookThemeWrapper extends ThemeMixin(LitElement) {
  static styles = [
    ...((ThemeMixin(LitElement) as any).styles ?? []),
    css`
      :host {
        display: block;
        border: 1px solid var(--md-sys-color-outline-variant);
        border-radius: 12px;
        overflow: hidden;
        background: var(--md-sys-color-background);
        color: var(--md-sys-color-on-background);
        font-family: sans-serif;
      }

      .header {
        padding: var(--space-small);
        border-bottom: 1px solid var(--md-sys-color-outline-variant);
        font-weight: bold;
        background: var(--md-sys-color-surface-container);
        color: var(--md-sys-color-on-surface);
        font-size: 13px;
      }

      .content {
        padding: 20px;
      }
    `,
  ];

  render() {
    return html`
      <div class="header">
        <slot name="header"></slot>
      </div>
      <div class="content">
        <slot></slot>
      </div>
    `;
  }
}
customElements.define('storybook-theme-wrapper', StorybookThemeWrapper);

const preview: Preview = {
  decorators: [
    (story) => html`
      <div style="display: grid; gap: 20px;">
        <!-- Light Mode -->
        <storybook-theme-wrapper light>
          <span slot="header">Light Mode</span>
          ${story()}
        </storybook-theme-wrapper>

        <!-- Dark Mode -->
        <storybook-theme-wrapper dark>
          <span slot="header">Dark Mode</span>
          ${story()}
        </storybook-theme-wrapper>
      </div>
    `,
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
