import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import './er-list-item';

const meta: Meta = {
  title: 'Components/ErListItem',
  component: 'er-list-item',
  render: (args: any) => {
    return html`
      <div
        style="max-width: 320px; background-color: var(--md-sys-color-surface-container-low, #f0f0f0); padding: 10px; border-radius: 8px;"
      >
        <er-list-item
          icon=${ifDefined(args.icon || undefined)}
          icon-color=${ifDefined(args.iconColor || undefined)}
          ?selected=${args.selected}
        >
          ${args.content}
        </er-list-item>
      </div>
    `;
  },
  argTypes: {
    content: { control: 'text' },
    icon: { control: 'text' },
    iconColor: { control: 'color' },
    selected: { control: 'boolean' },
  },
  args: {
    content: 'List Item Content',
    icon: 'star',
    iconColor: '',
    selected: false,
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    content: 'Regular list item',
    icon: 'star',
  },
};

export const Selected: Story = {
  args: {
    content: 'Selected list item',
    icon: 'check',
    selected: true,
  },
};

export const CustomIconColor: Story = {
  args: {
    content: 'Settings page option',
    icon: 'settings',
    iconColor: '#bb2025',
  },
};

export const ListExample: StoryObj = {
  render: () => html`
    <div
      style="max-width: 320px; display: flex; flex-direction: column; gap: 4px; background-color: var(--md-sys-color-surface-container-low, #f0f0f0); padding: 8px; border-radius: 8px;"
    >
      <er-list-item icon="home" selected>Home</er-list-item>
      <er-list-item icon="person">Camper Profile</er-list-item>
      <er-list-item icon="payments">Transactions</er-list-item>
      <er-list-item icon="settings">Settings</er-list-item>
    </div>
  `,
};
