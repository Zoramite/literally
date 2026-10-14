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
    if (args.fontSize) {
      classes.push(args.fontSize);
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
        'themePrimaryContainer',
        'themeSecondary',
        'themeSecondaryContainer',
        'themeTertiary',
        'themeTertiaryContainer',
        'themeError',
        'themeErrorContainer',
        'themeSurface',
        'themeSurfaceVariant',
        'themeSurfaceContainer',
      ],
    },
    fontSize: {
      control: 'select',
      options: [
        '',
        'fontSizeXxsmall',
        'fontSizeXsmall',
        'fontSizeSmall',
        'fontSizeMedium',
        'fontSizeLarge',
        'fontSizeXlarge',
        'fontSizeXxlarge',
        'fontSizeXxxlarge',
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
    fontSize: '',
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

export const FontSizes: StoryObj = {
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start;"
    >
      <div style="display: flex; gap: 12px; align-items: center;">
        <er-fab
          class="primary themePrimary fontSizeXxsmall"
          icon="edit"
          label="xxsmall fab"
          expanded
        ></er-fab>
        <er-fab
          class="primary themePrimary fontSizeXxsmall"
          icon="edit"
        ></er-fab>
      </div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <er-fab
          class="primary themePrimary fontSizeXsmall"
          icon="edit"
          label="xsmall fab"
          expanded
        ></er-fab>
        <er-fab
          class="primary themePrimary fontSizeXsmall"
          icon-start="edit"
          icon="edit"
        ></er-fab>
      </div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <er-fab
          class="primary themePrimary fontSizeSmall"
          icon="edit"
          label="small fab"
          expanded
        ></er-fab>
        <er-fab class="primary themePrimary fontSizeSmall" icon="edit"></er-fab>
      </div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <er-fab
          class="primary themePrimary fontSizeMedium"
          icon="edit"
          label="medium fab (default)"
          expanded
        ></er-fab>
        <er-fab
          class="primary themePrimary fontSizeMedium"
          icon="edit"
        ></er-fab>
      </div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <er-fab
          class="primary themePrimary fontSizeLarge"
          icon="edit"
          label="large fab"
          expanded
        ></er-fab>
        <er-fab class="primary themePrimary fontSizeLarge" icon="edit"></er-fab>
      </div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <er-fab
          class="primary themePrimary fontSizeXlarge"
          icon="edit"
          label="xlarge fab"
          expanded
        ></er-fab>
        <er-fab
          class="primary themePrimary fontSizeXlarge"
          icon="edit"
        ></er-fab>
      </div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <er-fab
          class="primary themePrimary fontSizeXxlarge"
          icon="edit"
          label="xxlarge fab"
          expanded
        ></er-fab>
        <er-fab
          class="primary themePrimary fontSizeXxlarge"
          icon="edit"
        ></er-fab>
      </div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <er-fab
          class="primary themePrimary fontSizeXxxlarge"
          icon="edit"
          label="xxxlarge fab"
          expanded
        ></er-fab>
        <er-fab
          class="primary themePrimary fontSizeXxxlarge"
          icon="edit"
        ></er-fab>
      </div>
    </div>
  `,
};
