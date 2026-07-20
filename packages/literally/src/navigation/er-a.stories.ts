import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import './er-a';

const meta: Meta = {
  title: 'Navigation/ErA',
  component: 'er-a',
  render: (args: any) => {
    const classes = [];
    if (args.displayClass) classes.push(args.displayClass);

    return html`
      <div style="font-family: sans-serif; max-width: 400px;">
        <p>
          Here is some text containing a custom link:
          <er-a
            class="${classes.join(' ')}"
            ?disabled=${args.disabled}
            path=${ifDefined(args.path || undefined)}
            root-path=${ifDefined(args.rootPath || undefined)}
            ?open-new=${args.openNew}
            @click=${(evt: MouseEvent) => {
              evt.preventDefault();
              console.log('Link clicked! Path:', args.path);
            }}
          >
            ${args.label}
          </er-a>
        </p>
      </div>
    `;
  },
  argTypes: {
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    path: { control: 'text' },
    rootPath: { control: 'text' },
    openNew: { control: 'boolean' },
    displayClass: {
      control: 'select',
      options: ['', 'block', 'inlineBlock', 'ellipsis'],
      name: 'Display Class',
    },
  },
  args: {
    label: 'Visit Dashboard',
    disabled: false,
    path: '/dashboard',
    rootPath: '',
    openNew: false,
    displayClass: '',
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'Visit Dashboard',
  },
};

export const DisabledLink: Story = {
  args: {
    label: 'Disabled Action Link',
    disabled: true,
  },
};

export const BlockLink: Story = {
  args: {
    label: 'Block Level Link',
    displayClass: 'block',
  },
};

export const EllipsisTruncatedLink: StoryObj = {
  render: () => html`
    <div
      style="font-family: sans-serif; max-width: 200px; border: 1px dashed var(--md-sys-color-outline); padding: 8px;"
    >
      <p
        style="margin: 0 0 4px 0; font-size: 12px; color: var(--md-sys-color-outline);"
      >
        Container width is restricted to 200px:
      </p>
      <er-a class="ellipsis" path="/very-long-path-name">
        This is a very long link text that will truncate with an ellipsis
        because of the class.
      </er-a>
    </div>
  `,
};
