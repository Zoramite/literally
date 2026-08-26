import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';

import './er-grid-overlay';

const meta: Meta = {
  title: 'Structure/ErGridOverlay',
  component: 'er-grid-overlay',
  render: (args: any) => html`
    <div style="font-family: sans-serif; padding: 24px;">
      <p>
        Press <strong>Shift + G</strong> to toggle the overlay on/off, or use
        the control below.
      </p>
      <er-grid-overlay ?visible=${args.visible}></er-grid-overlay>
    </div>
  `,
  argTypes: {
    visible: {
      control: 'boolean',
      name: 'Visible',
    },
  },
  args: {
    visible: true,
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    visible: true,
  },
};
