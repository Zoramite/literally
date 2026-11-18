import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import './er-spacer';

const meta: Meta = {
  title: 'Structure/ErSpacer',
  component: 'er-spacer',
  render: (args: any) => {
    return html`
      <div
        style="font-family: sans-serif; max-width: 400px; border: 1px solid var(--md-sys-color-outline-variant); padding: 16px; border-radius: 8px; background: var(--md-sys-color-surface-container-low);"
      >
        <div
          style="background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); padding: 12px; border-radius: 4px; text-align: center;"
        >
          Element A
        </div>

        <er-spacer size=${ifDefined(args.size || undefined)}></er-spacer>

        <div
          style="background: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container); padding: 12px; border-radius: 4px; text-align: center;"
        >
          Element B
        </div>
      </div>
    `;
  },
  argTypes: {
    size: {
      control: 'select',
      options: [
        'none',
        'xxsmall',
        'xsmall',
        'small',
        'medium',
        'large',
        'xlarge',
        'xxlarge',
        'xxxlarge',
        'xxxxlarge',
      ],
      name: 'Spacer Size',
    },
  },
  args: {
    size: 'medium',
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    size: 'medium',
  },
};

export const Small: Story = {
  args: {
    size: 'small',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xlarge',
  },
};

export const None: Story = {
  args: {
    size: 'none',
  },
};
