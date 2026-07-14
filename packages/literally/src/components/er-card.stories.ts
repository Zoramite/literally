import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import './er-card';

const meta: Meta = {
  title: 'Components/ErCard',
  component: 'er-card',
  render: (args: any) => {
    const classes = [];
    if (args.theme) classes.push(args.theme);
    if (args.outlined) classes.push('outlined');
    if (args.hoverEffect) classes.push('hoverEffect');
    if (args.link) classes.push('link');
    if (args.padding) classes.push(args.padding);

    return html`
      <er-card
        class="${classes.join(' ')}"
        highlight=${ifDefined(args.highlight || undefined)}
      >
        <h3 style="margin-top: 0; font-family: sans-serif;">${args.title}</h3>
        <p style="margin-bottom: 0; font-family: sans-serif;">
          ${args.content}
        </p>
      </er-card>
    `;
  },
  argTypes: {
    title: { control: 'text' },
    content: { control: 'text' },
    theme: {
      control: 'select',
      options: [
        '',
        'themeSurfaceVariant',
        'themeSurfaceContainer',
        'themePrimary',
        'themePrimaryContainer',
        'themeSecondary',
        'themeSecondaryContainer',
        'themeTertiary',
        'themeTertiaryContainer',
        'themeError',
      ],
    },
    outlined: { control: 'boolean' },
    hoverEffect: { control: 'boolean' },
    link: { control: 'boolean' },
    highlight: { control: 'color' },
    padding: {
      control: 'select',
      options: [
        '',
        'padXsmall',
        'padSmall',
        'padMedium',
        'padLarge',
        'padXlarge',
        'padXxlarge',
        'padXxxlarge',
      ],
    },
  },
  args: {
    title: 'Card Title',
    content:
      'This is some generic body text inside the custom Lit card element. It inherits typography styles from the theme.',
    theme: 'themeSurfaceVariant',
    outlined: false,
    hoverEffect: true,
    link: false,
    highlight: '',
    padding: 'padMedium',
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    theme: '',
    outlined: true,
  },
};

export const SurfaceVariantTheme: Story = {
  args: {
    theme: 'themeSurfaceVariant',
    outlined: false,
  },
};

export const SurfaceContainerTheme: Story = {
  args: {
    theme: 'themeSurfaceContainer',
    outlined: false,
  },
};

export const PrimaryTheme: Story = {
  args: {
    theme: 'themePrimary',
    outlined: false,
  },
};

export const PrimaryContainerTheme: Story = {
  args: {
    theme: 'themePrimaryContainer',
    outlined: false,
  },
};

export const SecondaryTheme: Story = {
  args: {
    theme: 'themeSecondary',
    outlined: false,
  },
};

export const SecondaryContainerTheme: Story = {
  args: {
    theme: 'themeSecondaryContainer',
    outlined: false,
  },
};

export const TertiaryTheme: Story = {
  args: {
    theme: 'themeTertiary',
    outlined: false,
  },
};

export const TertiaryContainerTheme: Story = {
  args: {
    theme: 'themeTertiaryContainer',
    outlined: false,
  },
};

export const ErrorTheme: Story = {
  args: {
    theme: 'themeError',
    outlined: false,
  },
};

export const WithHighlight: Story = {
  args: {
    theme: '',
    outlined: true,
    highlight: '#ffb4b5',
  },
};

export const InteractiveLink: Story = {
  args: {
    theme: 'themeSecondary',
    outlined: false,
    link: true,
    hoverEffect: true,
  },
};

export const AllThemesShowcase: StoryObj = {
  render: () => html`
    <div
      style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;"
    >
      <er-card class="themeSurfaceVariant">
        <h4 style="margin: 0 0 8px 0; font-family: sans-serif;">
          Surface Variant
        </h4>
        <p style="margin: 0; font-size: 14px; font-family: sans-serif;">
          Default styled card theme.
        </p>
      </er-card>
      <er-card class="themeSurfaceContainer">
        <h4 style="margin: 0 0 8px 0; font-family: sans-serif;">
          Surface Container
        </h4>
        <p style="margin: 0; font-size: 14px; font-family: sans-serif;">
          Alternative surface container theme.
        </p>
      </er-card>
      <er-card class="themePrimary">
        <h4 style="margin: 0 0 8px 0; font-family: sans-serif;">Primary</h4>
        <p style="margin: 0; font-size: 14px; font-family: sans-serif;">
          High emphasis primary action theme.
        </p>
      </er-card>
      <er-card class="themePrimaryContainer">
        <h4 style="margin: 0 0 8px 0; font-family: sans-serif;">
          Primary Container
        </h4>
        <p style="margin: 0; font-size: 14px; font-family: sans-serif;">
          Medium emphasis primary container theme.
        </p>
      </er-card>
      <er-card class="themeSecondary">
        <h4 style="margin: 0 0 8px 0; font-family: sans-serif;">Secondary</h4>
        <p style="margin: 0; font-size: 14px; font-family: sans-serif;">
          High emphasis secondary action theme.
        </p>
      </er-card>
      <er-card class="themeSecondaryContainer">
        <h4 style="margin: 0 0 8px 0; font-family: sans-serif;">
          Secondary Container
        </h4>
        <p style="margin: 0; font-size: 14px; font-family: sans-serif;">
          Medium emphasis secondary theme.
        </p>
      </er-card>
      <er-card class="themeTertiary">
        <h4 style="margin: 0 0 8px 0; font-family: sans-serif;">Tertiary</h4>
        <p style="margin: 0; font-size: 14px; font-family: sans-serif;">
          High emphasis tertiary theme.
        </p>
      </er-card>
      <er-card class="themeTertiaryContainer">
        <h4 style="margin: 0 0 8px 0; font-family: sans-serif;">
          Tertiary Container
        </h4>
        <p style="margin: 0; font-size: 14px; font-family: sans-serif;">
          Medium emphasis tertiary theme.
        </p>
      </er-card>
      <er-card class="themeError">
        <h4 style="margin: 0 0 8px 0; font-family: sans-serif;">
          Error Container
        </h4>
        <p style="margin: 0; font-size: 14px; font-family: sans-serif;">
          Alert state container style.
        </p>
      </er-card>
    </div>
  `,
};
