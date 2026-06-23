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

export const WithIcon: Story = {
  args: {
    label: 'Settings',
    variant: 'primary',
    theme: 'themePrimary',
    iconStart: 'settings',
  },
};
