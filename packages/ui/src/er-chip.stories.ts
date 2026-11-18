import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import './er-chip';

const meta: Meta = {
  title: 'Components/ErChip',
  component: 'er-chip',
  render: (args: any) => {
    const classes = [];
    if (args.variant && args.variant !== 'default') {
      classes.push(args.variant);
    }
    if (args.theme) {
      classes.push(args.theme);
    }
    if (args.capitalize) {
      classes.push('capitalize');
    }
    if (args.fontSize) {
      classes.push(args.fontSize);
    }

    return html`
      <er-chip
        class="${classes.join(' ')}"
        icon-start=${ifDefined(args.iconStart || undefined)}
        icon-end=${ifDefined(args.iconEnd || undefined)}
      >
        ${args.label}
      </er-chip>
    `;
  },
  argTypes: {
    label: { control: 'text' },
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'tertiary'],
    },
    theme: {
      control: 'select',
      options: [
        '',
        'themePrimary',
        'themePrimaryContainer',
        'themeSecondary',
        'themeSecondaryContainer',
        'themeTertiary',
        'themeTertiaryContainer',
        'themeError',
        'themeErrorContainer',
        'themeSurface',
        'themeSurfaceVariant',
        'themeSurfaceContainer',
        'themeSurfaceContainerLow',
      ],
    },
    fontSize: {
      control: 'select',
      options: [
        '',
        'fontSizeXxsmall',
        'fontSizeXsmall',
        'fontSizeSmall',
        'fontSizeMedium',
        'fontSizeLarge',
        'fontSizeXlarge',
        'fontSizeXxlarge',
        'fontSizeXxxlarge',
      ],
    },
    capitalize: { control: 'boolean' },
    iconStart: { control: 'text' },
    iconEnd: { control: 'text' },
  },
  args: {
    label: 'Chip Label',
    variant: 'primary',
    theme: 'themePrimary',
    fontSize: '',
    capitalize: false,
    iconStart: '',
    iconEnd: '',
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'Default Chip',
    variant: 'default',
    theme: '',
  },
};

export const Primary: Story = {
  args: {
    label: 'Primary Chip',
    variant: 'primary',
    theme: 'themePrimary',
  },
};

export const Secondary: Story = {
  args: {
    label: 'Secondary Chip',
    variant: 'secondary',
    theme: 'themeSecondary',
  },
};

export const Tertiary: Story = {
  args: {
    label: 'Tertiary Chip',
    variant: 'tertiary',
    theme: 'themeTertiary',
  },
};

export const ErrorState: Story = {
  args: {
    label: 'Error Alert',
    variant: 'primary',
    theme: 'themeError',
    iconStart: 'warning',
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Settings',
    variant: 'primary',
    theme: 'themePrimary',
    iconStart: 'settings',
  },
};

export const Capitalized: Story = {
  args: {
    label: 'must capitalize me',
    variant: 'primary',
    theme: 'themePrimary',
    capitalize: true,
  },
};

export const AllChipsShowcase: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
      <er-chip class="themePrimary primary">Primary</er-chip>
      <er-chip class="themeSecondary secondary">Secondary</er-chip>
      <er-chip class="themeTertiary tertiary">Tertiary</er-chip>
      <er-chip class="themeError primary" icon-start="error">Error</er-chip>
      <er-chip class="themePrimary primary capitalize"
        >capitalized label</er-chip
      >
      <er-chip
        class="themeSecondary secondary"
        icon-start="star"
        icon-end="close"
        >With Both Icons</er-chip
      >
    </div>
  `,
};

export const FontSizes: StoryObj = {
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start;"
    >
      <er-chip class="themePrimary primary fontSizeXxsmall" icon-start="star"
        >xxsmall chip</er-chip
      >
      <er-chip class="themePrimary primary fontSizeXsmall" icon-start="star"
        >xsmall chip</er-chip
      >
      <er-chip class="themePrimary primary fontSizeSmall" icon-start="star"
        >small chip (default)</er-chip
      >
      <er-chip class="themePrimary primary fontSizeMedium" icon-start="star"
        >medium chip</er-chip
      >
      <er-chip class="themePrimary primary fontSizeLarge" icon-start="star"
        >large chip</er-chip
      >
      <er-chip class="themePrimary primary fontSizeXlarge" icon-start="star"
        >xlarge chip</er-chip
      >
      <er-chip class="themePrimary primary fontSizeXxlarge" icon-start="star"
        >xxlarge chip</er-chip
      >
      <er-chip class="themePrimary primary fontSizeXxxlarge" icon-start="star"
        >xxxlarge chip</er-chip
      >
    </div>
  `,
};
