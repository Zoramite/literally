import type { Preview } from '@storybook/web-components';

import { html } from 'lit';
import { LitElement } from 'lit';

import { ThemeMixin } from '../packages/literally/src/theme/theme.mixin';

class StorybookThemeProvider extends ThemeMixin(LitElement) {}
customElements.define('storybook-theme-provider', StorybookThemeProvider);

const preview: Preview = {
  decorators: [
    (story) => html`
      <storybook-theme-provider style="display: block; padding: 20px;">
        ${story()}
      </storybook-theme-provider>
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
