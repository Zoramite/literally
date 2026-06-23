import type { Preview } from '@storybook/web-components';

import { html } from 'lit';
import { LitElement } from 'lit';

import { ThemeMixin } from '../packages/literally/src/theme/theme.mixin';

class StorybookThemeProvider extends ThemeMixin(LitElement) {}
customElements.define('storybook-theme-provider', StorybookThemeProvider);

const preview: Preview = {
  decorators: [
    (story) => html`
      <div style="display: grid; gap: 20px;">
        <!-- Light Mode -->
        <div
          style="border: 1px solid #e1e2ec; border-radius: 12px; overflow: hidden; background: #faf8ff;"
        >
          <div
            style="padding: 8px 16px; border-bottom: 1px solid #e1e2ec; font-weight: bold; background: #f4f3fa; color: #1a1b21; font-size: 13px;"
          >
            Light Mode
          </div>
          <storybook-theme-provider
            light
            style="display: block; padding: 20px;"
          >
            ${story()}
          </storybook-theme-provider>
        </div>

        <!-- Dark Mode -->
        <div
          style="border: 1px solid #44454f; border-radius: 12px; overflow: hidden; background: #121318;"
        >
          <div
            style="padding: 8px 16px; border-bottom: 1px solid #44454f; font-weight: bold; background: #1a1b21; color: #e2e2e9; font-size: 13px;"
          >
            Dark Mode
          </div>
          <storybook-theme-provider dark style="display: block; padding: 20px;">
            ${story()}
          </storybook-theme-provider>
        </div>
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
