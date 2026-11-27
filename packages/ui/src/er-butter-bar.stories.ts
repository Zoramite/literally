import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';

import './er-butter-bar';

const meta: Meta = {
  title: 'Feedback/ErButterBar',
  component: 'er-butter-bar',
  render: (args: any) => html`
    <er-butter-bar
      ?open=${args.open}
      type=${args.type}
      position=${args.position}
      message=${args.message}
      detail=${args.detail}
      ?dismissible=${args.dismissible}
      auto-dismiss-ms=${args.autoDismissMs}
    ></er-butter-bar>
  `,
  argTypes: {
    open: { control: 'boolean' },
    type: {
      control: 'select',
      options: ['info', 'progress', 'success', 'warning', 'error'],
    },
    position: {
      control: 'select',
      options: ['bottom', 'top', 'inline'],
    },
    message: { control: 'text' },
    detail: { control: 'text' },
    dismissible: { control: 'boolean' },
    autoDismissMs: { control: 'number' },
  },
  args: {
    open: true,
    type: 'progress',
    position: 'inline',
    message: 'Publishing course release…',
    detail: 'Syncing draft changes and creating version snapshot',
    dismissible: false,
    autoDismissMs: 0,
  },
};

export default meta;
type Story = StoryObj;

export const Progress: Story = {};

export const Success: Story = {
  args: {
    type: 'success',
    message: 'Published release v1.2.0',
    detail: 'All units and media assets are live.',
    dismissible: true,
  },
};

export const Warning: Story = {
  args: {
    type: 'warning',
    message: 'Saved locally (offline)',
    detail: 'Changes will sync automatically once reconnected.',
    dismissible: true,
  },
};

export const Error: Story = {
  args: {
    type: 'error',
    message: 'Publish failed',
    detail: 'Permission denied while writing release metadata.',
    dismissible: true,
  },
};
