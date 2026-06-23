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
        'themeSecondary',
        'themeTertiary',
        'themeError',
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
