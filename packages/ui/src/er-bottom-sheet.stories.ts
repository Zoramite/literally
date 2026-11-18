import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import './er-bottom-sheet';

const meta: Meta = {
  title: 'Structure/ErBottomSheet',
  component: 'er-bottom-sheet',
  render: (args: any) => {
    return html`
      <div>
        <p style="font-family: sans-serif;">
          Click the button below to toggle the bottom sheet state. Click the
          scrim background (outside the sheet) to close it.
        </p>
        <button
          style="padding: 10px 16px; font-family: sans-serif; font-size: 14px; cursor: pointer;"
          @click=${() => {
            const sheet = document.querySelector('er-bottom-sheet');
            if (sheet) sheet.isOpen = !sheet.isOpen;
          }}
        >
          Toggle Bottom Sheet
        </button>

        <er-bottom-sheet
          ?open=${args.isOpen}
          ?no-auto-close=${args.noAutoClose}
          class=${ifDefined(args.className || undefined)}
        >
          <div
            style="font-family: sans-serif; display: flex; flex-direction: column; gap: 12px;"
          >
            <h3 style="margin: 0;">Bottom Sheet Content</h3>
            <p style="margin: 0; line-height: 1.5;">
              This is content loaded dynamically inside the bottom sheet. You
              can put forms, details, lists, or any other widgets here.
            </p>
            <button
              style="align-self: flex-start; padding: 6px 12px; cursor: pointer;"
              @click=${() => {
                const sheet = document.querySelector('er-bottom-sheet');
                if (sheet) sheet.isOpen = false;
              }}
            >
              Close
            </button>
          </div>
        </er-bottom-sheet>
      </div>
    `;
  },
  argTypes: {
    isOpen: { control: 'boolean', name: 'isOpen / open' },
    noAutoClose: { control: 'boolean', name: 'noAutoClose / no-auto-close' },
    className: {
      control: 'select',
      options: ['', 'full'],
      name: 'CSS Class',
    },
  },
  args: {
    isOpen: false,
    noAutoClose: false,
    className: '',
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    isOpen: false,
  },
};

export const OpenByDefault: Story = {
  args: {
    isOpen: true,
  },
};

export const FullWidth: Story = {
  args: {
    isOpen: true,
    className: 'full',
  },
};

export const PersistentNoAutoClose: Story = {
  args: {
    isOpen: true,
    noAutoClose: true,
  },
};
