import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import './er-flex';
import '../components/er-card';

const meta: Meta = {
  title: 'Structure/ErFlex',
  component: 'er-flex',
  render: (args: any) => {
    const classes = [];
    if (args.direction) classes.push(args.direction);
    if (args.wrap) classes.push('wrap');
    if (args.gap) classes.push(args.gap);
    if (args.align) classes.push(args.align);
    if (args.justify) classes.push(args.justify);
    if (args.basis) classes.push(args.basis);
    if (args.fullWidth) classes.push('full');
    if (args.inline) classes.push('inline');

    return html`
      <er-flex
        class="${classes.join(' ')}"
        style="background: var(--md-sys-color-surface-container-low); padding: 12px; border-radius: 8px;"
      >
        <div
          style="background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); padding: 16px; border-radius: 4px; text-align: center;"
        >
          Item 1
        </div>
        <div
          style="background: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container); padding: 16px; border-radius: 4px; text-align: center;"
        >
          Item 2
        </div>
        <div
          style="background: var(--md-sys-color-tertiary-container); color: var(--md-sys-color-on-tertiary-container); padding: 16px; border-radius: 4px; text-align: center;"
        >
          Item 3
        </div>
      </er-flex>
    `;
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['flowRow', 'flowColumn'],
      name: 'Flex Direction',
    },
    wrap: { control: 'boolean', name: 'Wrap' },
    gap: {
      control: 'select',
      options: ['', 'gapSmall', 'gapLarge', 'gapXlarge'],
      name: 'Gap Size',
    },
    align: {
      control: 'select',
      options: [
        '',
        'alignFlexStart',
        'alignFlexEnd',
        'alignBaseline',
        'alignCenter',
        'alignSpaceBetween',
        'alignSpaceAround',
        'alignSpaceEvenly',
      ],
      name: 'Align Items',
    },
    justify: {
      control: 'select',
      options: [
        '',
        'justifyFlexStart',
        'justifyFlexEnd',
        'justifyCenter',
        'justifySpaceBetween',
        'justifySpaceAround',
        'justifySpaceEvenly',
      ],
      name: 'Justify Content',
    },
    basis: {
      control: 'select',
      options: ['', 'basis20', 'basis25', 'basis33', 'basis50'],
      name: 'Slotted Child Basis',
    },
    fullWidth: { control: 'boolean', name: 'Full Width (class="full")' },
    inline: { control: 'boolean', name: 'Inline Flex (class="inline")' },
  },
  args: {
    direction: 'flowRow',
    wrap: false,
    gap: '',
    align: 'alignCenter',
    justify: 'justifyFlexStart',
    basis: '',
    fullWidth: true,
    inline: false,
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    direction: 'flowRow',
  },
};

export const ColumnLayout: Story = {
  args: {
    direction: 'flowColumn',
    align: 'alignFlexStart',
  },
};

export const GridBasis50: Story = {
  args: {
    direction: 'flowRow',
    basis: 'basis50',
    wrap: true,
  },
};

export const GridBasis33: Story = {
  args: {
    direction: 'flowRow',
    basis: 'basis33',
    wrap: true,
  },
};
