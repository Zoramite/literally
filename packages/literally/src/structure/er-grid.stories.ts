import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';

import './er-grid';

const meta: Meta = {
  title: 'Structure/ErGrid',
  component: 'er-grid',
  render: (args: any) => {
    const classes = [];
    if (args.gapRow) classes.push(args.gapRow);
    if (args.gapCol) classes.push(args.gapCol);
    if (args.align) classes.push(args.align);

    return html`
      <div style="font-family: sans-serif;">
        <p style="margin-bottom: 16px;">
          Resizes based on screen size: Mobile (4 cols), Tablet (8 cols),
          Desktop (12 cols).
        </p>
        <er-grid
          class="${classes.join(' ')}"
          style="background: var(--md-sys-color-surface-container-low); padding: 16px; border-radius: 8px;"
        >
          <er-grid-item span="desktop:4; tablet:4; mobile:2">
            <div
              style="background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); padding: 20px; border-radius: 4px; text-align: center;"
            >
              Item 1 (Span 4)
            </div>
          </er-grid-item>
          <er-grid-item span="desktop:4; tablet:4; mobile:2">
            <div
              style="background: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container); padding: 20px; border-radius: 4px; text-align: center;"
            >
              Item 2 (Span 4)
            </div>
          </er-grid-item>
          <er-grid-item span="desktop:4; tablet:8; mobile:4">
            <div
              style="background: var(--md-sys-color-tertiary-container); color: var(--md-sys-color-on-tertiary-container); padding: 20px; border-radius: 4px; text-align: center;"
            >
              Item 3 (Span 4)
            </div>
          </er-grid-item>
          <er-grid-item span="desktop:6; tablet:4; mobile:4">
            <div
              style="background: var(--md-sys-color-error-container); color: var(--md-sys-color-on-error-container); padding: 20px; border-radius: 4px; text-align: center;"
            >
              Item 4 (Span 6)
            </div>
          </er-grid-item>
          <er-grid-item span="desktop:6; tablet:4; mobile:4">
            <div
              style="background: var(--md-sys-color-surface-variant); color: var(--md-sys-color-on-surface-variant); padding: 20px; border-radius: 4px; text-align: center;"
            >
              Item 5 (Span 6)
            </div>
          </er-grid-item>
        </er-grid>
      </div>
    `;
  },
  argTypes: {
    gapRow: {
      control: 'select',
      options: [
        '',
        'gapRowSmall',
        'gapRowMedium',
        'gapRowLarge',
        'gapRowXlarge',
        'gapRowXxlarge',
        'gapRowXxxlarge',
      ],
      name: 'Row Gap Size',
    },
    gapCol: {
      control: 'select',
      options: [
        '',
        'gapColSmall',
        'gapColMedium',
        'gapColLarge',
        'gapColXlarge',
        'gapColXxlarge',
        'gapColXxxlarge',
      ],
      name: 'Column Gap Size',
    },
    align: {
      control: 'select',
      options: ['', 'alignBaseline', 'alignEnd', 'alignCenter', 'alignStart'],
      name: 'Align Items',
    },
  },
  args: {
    gapRow: 'gapRowMedium',
    gapCol: 'gapColMedium',
    align: '',
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    gapRow: 'gapRowMedium',
    gapCol: 'gapColMedium',
  },
};

export const LargeGaps: Story = {
  args: {
    gapRow: 'gapRowLarge',
    gapCol: 'gapColLarge',
  },
};

export const MixedSpansShowcase: StoryObj = {
  render: () => html`
    <er-grid
      style="background: var(--md-sys-color-surface-container-low); padding: 16px; border-radius: 8px; font-family: sans-serif;"
    >
      <er-grid-item span="desktop:12; tablet:8; mobile:4">
        <div
          style="background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary); padding: 12px; border-radius: 4px; text-align: center; margin-bottom: 8px;"
        >
          Full Width Banner (Span 12)
        </div>
      </er-grid-item>

      <er-grid-item span="desktop:8; tablet:5; mobile:4">
        <div
          style="background: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-outline-variant); padding: 40px 12px; border-radius: 4px; text-align: center;"
        >
          Main Content (Span 8)
        </div>
      </er-grid-item>

      <er-grid-item span="desktop:4; tablet:3; mobile:4">
        <div
          style="background: var(--md-sys-color-surface-container-high); border: 1px solid var(--md-sys-color-outline-variant); padding: 40px 12px; border-radius: 4px; text-align: center;"
        >
          Sidebar (Span 4)
        </div>
      </er-grid-item>

      <er-grid-item span="desktop:3; tablet:2; mobile:2">
        <div
          style="background: var(--md-sys-color-secondary-container); padding: 12px; border-radius: 4px; text-align: center;"
        >
          Grid Box 1 (Span 3)
        </div>
      </er-grid-item>
      <er-grid-item span="desktop:3; tablet:2; mobile:2">
        <div
          style="background: var(--md-sys-color-secondary-container); padding: 12px; border-radius: 4px; text-align: center;"
        >
          Grid Box 2 (Span 3)
        </div>
      </er-grid-item>
      <er-grid-item span="desktop:3; tablet:2; mobile:2">
        <div
          style="background: var(--md-sys-color-secondary-container); padding: 12px; border-radius: 4px; text-align: center;"
        >
          Grid Box 3 (Span 3)
        </div>
      </er-grid-item>
      <er-grid-item span="desktop:3; tablet:2; mobile:2">
        <div
          style="background: var(--md-sys-color-secondary-container); padding: 12px; border-radius: 4px; text-align: center;"
        >
          Grid Box 4 (Span 3)
        </div>
      </er-grid-item>
    </er-grid>
  `,
};
