import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import './er-button';

const meta: Meta = {
  title: 'Components/ErButton',
  component: 'er-button',
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
      <er-button
        class="${classes.join(' ')}"
        icon=${ifDefined(args.icon || undefined)}
        icon-start=${ifDefined(args.iconStart || undefined)}
        icon-end=${ifDefined(args.iconEnd || undefined)}
        label=${ifDefined(args.label || undefined)}
        ?disabled=${args.disabled}
        highlight=${ifDefined(args.highlight || undefined)}
      ></er-button>
    `;
  },
  argTypes: {
    label: { control: 'text' },
    icon: { control: 'text' },
    iconStart: { control: 'text' },
    iconEnd: { control: 'text' },
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
    label: 'Default Button',
    icon: '',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    theme: 'themePrimary',
    label: 'Primary Button',
    icon: 'check',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    theme: 'themeSecondary',
    label: 'Secondary Button',
    icon: 'edit',
  },
};

export const TertiaryAction: Story = {
  args: {
    variant: 'tertiary',
    theme: 'themeTertiary',
    icon: 'delete',
    label: 'Delete Item',
  },
};

export const DisabledButton: Story = {
  args: {
    variant: 'primary',
    theme: 'themePrimary',
    label: 'Disabled Action',
    icon: 'lock',
    disabled: true,
  },
};

export const MixedRow: StoryObj = {
  render: () => html`
    <div
      style="display: flex; gap: 12px; align-items: center; padding: 16px; border: 1px dashed #ccc; border-radius: 8px;"
    >
      <er-button
        class="primary themePrimary"
        icon="add"
        label="With Icon"
      ></er-button>
      <er-button class="primary themePrimary" label="No Icon"></er-button>
      <er-button
        class="secondary themePrimary"
        icon="filter_list"
        label="Filter"
      ></er-button>
      <er-button class="secondary themePrimary" label="Reset"></er-button>
      <er-button class="tertiary themePrimary" icon="more_vert"></er-button>
    </div>
  `,
};

export const FontSizes: StoryObj = {
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start;"
    >
      <div style="display: flex; gap: 12px; align-items: center;">
        <er-button
          class="primary themePrimary fontSizeXxsmall"
          icon="edit"
          label="xxsmall button"
        ></er-button>
        <er-button
          class="secondary themePrimary fontSizeXxsmall"
          label="xxsmall (no icon)"
        ></er-button>
        <er-button
          class="primary themePrimary fontSizeXxsmall"
          icon="edit"
        ></er-button>
      </div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <er-button
          class="primary themePrimary fontSizeXsmall"
          icon="edit"
          label="xsmall button"
        ></er-button>
        <er-button
          class="secondary themePrimary fontSizeXsmall"
          label="xsmall (no icon)"
        ></er-button>
        <er-button
          class="primary themePrimary fontSizeXsmall"
          icon="edit"
        ></er-button>
      </div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <er-button
          class="primary themePrimary fontSizeSmall"
          icon="edit"
          label="small button"
        ></er-button>
        <er-button
          class="secondary themePrimary fontSizeSmall"
          label="small (no icon)"
        ></er-button>
        <er-button
          class="primary themePrimary fontSizeSmall"
          icon="edit"
        ></er-button>
      </div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <er-button
          class="primary themePrimary fontSizeMedium"
          icon="edit"
          label="medium button (default)"
        ></er-button>
        <er-button
          class="secondary themePrimary fontSizeMedium"
          label="medium (no icon)"
        ></er-button>
        <er-button
          class="primary themePrimary fontSizeMedium"
          icon="edit"
        ></er-button>
      </div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <er-button
          class="primary themePrimary fontSizeLarge"
          icon="edit"
          label="large button"
        ></er-button>
        <er-button
          class="secondary themePrimary fontSizeLarge"
          label="large (no icon)"
        ></er-button>
        <er-button
          class="primary themePrimary fontSizeLarge"
          icon="edit"
        ></er-button>
      </div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <er-button
          class="primary themePrimary fontSizeXlarge"
          icon="edit"
          label="xlarge button"
        ></er-button>
        <er-button
          class="secondary themePrimary fontSizeXlarge"
          label="xlarge (no icon)"
        ></er-button>
        <er-button
          class="primary themePrimary fontSizeXlarge"
          icon="edit"
        ></er-button>
      </div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <er-button
          class="primary themePrimary fontSizeXxlarge"
          icon="edit"
          label="xxlarge button"
        ></er-button>
        <er-button
          class="secondary themePrimary fontSizeXxlarge"
          label="xxlarge (no icon)"
        ></er-button>
        <er-button
          class="primary themePrimary fontSizeXxlarge"
          icon="edit"
        ></er-button>
      </div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <er-button
          class="primary themePrimary fontSizeXxxlarge"
          icon="edit"
          label="xxxlarge button"
        ></er-button>
        <er-button
          class="secondary themePrimary fontSizeXxxlarge"
          label="xxxlarge (no icon)"
        ></er-button>
        <er-button
          class="primary themePrimary fontSizeXxxlarge"
          icon="edit"
        ></er-button>
      </div>
    </div>
  `,
};
