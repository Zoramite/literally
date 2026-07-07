import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import './er-icon';

const meta: Meta = {
  title: 'Components/ErIcon',
  component: 'er-icon',
  render: (args: any) => {
    const classes = [];
    if (args.theme) {
      classes.push(args.theme);
    }
    if (args.rounded) {
      classes.push('rounded');
    }
    if (args.roundish) {
      classes.push('roundish');
    }
    if (args.padMedium) {
      classes.push('padMedium');
    }
    if (args.padSmall) {
      classes.push('padSmall');
    }

    return html`
      <er-icon
        class="${classes.join(' ')}"
        icon=${ifDefined(args.icon || undefined)}
        color=${ifDefined(args.color || undefined)}
        highlight=${ifDefined(args.highlight || undefined)}
        ?disabled=${args.disabled}
        ?keep-color=${args.keepColor}
      >
      </er-icon>
    `;
  },
  argTypes: {
    icon: { control: 'text' },
    color: { control: 'color' },
    highlight: { control: 'color' },
    disabled: { control: 'boolean' },
    keepColor: { control: 'boolean' },
    theme: {
      control: 'select',
      options: [
        '',
        'themePrimary',
        'themePrimarySurface',
        'themeSecondary',
        'themeTertiary',
      ],
    },
    rounded: { control: 'boolean' },
    roundish: { control: 'boolean' },
    padMedium: { control: 'boolean' },
    padSmall: { control: 'boolean' },
  },
  args: {
    icon: 'star',
    disabled: false,
    keepColor: false,
    theme: '',
    rounded: false,
    roundish: false,
    padMedium: false,
    padSmall: false,
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    icon: 'star',
  },
};

export const ThemePrimary: Story = {
  args: {
    icon: 'home',
    theme: 'themePrimary',
    rounded: true,
    padMedium: true,
  },
};

export const Highlighted: Story = {
  args: {
    icon: 'verified',
    highlight: '#ffb4b5',
    theme: 'themePrimary',
  },
};

export const HighlightedBig: Story = {
  args: {
    icon: 'celebration',
    highlight: '#2266ff',
  },
  render: (args) => html`
    <div style="--er-icon-font-size: 64px;">
      <er-icon
        class="themePrimary"
        icon=${args.icon}
        highlight=${ifDefined(args.highlight)}
      ></er-icon>
    </div>
  `,
};
