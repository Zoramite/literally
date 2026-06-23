import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import './er-fab';

const meta: Meta = {
  title: 'Components/ErFab',
  component: 'er-fab',
  render: (args: any) => {
    const classes = [];
    if (args.variant && args.variant !== 'default') {
      classes.push(args.variant);
    }
    if (args.theme) {
      classes.push(args.theme);
    }
    if (args.fullWidth) {
      classes.push('full');
    }
    if (args.centered) {
      classes.push('center');
    }

    return html`
      <er-fab
        class="${classes.join(' ')}"
        icon=${ifDefined(args.icon || undefined)}
        label=${ifDefined(args.label || undefined)}
        ?expanded=${args.expanded}
        ?disabled=${args.disabled}
        highlight=${ifDefined(args.highlight || undefined)}
      ></er-fab>
    `;
  },
  argTypes: {
    label: { control: 'text' },
    icon: { control: 'text' },
    expanded: { control: 'boolean' },
    disabled: { control: 'boolean' },
    highlight: { control: 'color' },
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
    fullWidth: { control: 'boolean' },
    centered: { control: 'boolean' },
  },
  args: {
    label: 'Create New',
    icon: 'add',
    expanded: true,
    disabled: false,
    variant: 'primary',
    theme: 'themePrimary',
    highlight: '',
    fullWidth: false,
    centered: false,
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    variant: 'default',
    theme: '',
    expanded: false,
  },
};

export const PrimaryExpanded: Story = {
  args: {
    variant: 'primary',
    theme: 'themePrimary',
    expanded: true,
  },
};

export const SecondaryCollapsed: Story = {
  args: {
    variant: 'secondary',
    theme: 'themeSecondary',
    expanded: false,
  },
};

export const TertiaryAction: Story = {
  args: {
    variant: 'tertiary',
    theme: 'themeTertiary',
    expanded: true,
    icon: 'delete',
    label: 'Delete Item',
  },
};

export const DisabledFab: Story = {
  args: {
    variant: 'primary',
    theme: 'themePrimary',
    disabled: true,
  },
};
