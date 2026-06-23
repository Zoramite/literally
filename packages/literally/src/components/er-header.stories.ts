import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';

import './er-header';

const meta: Meta = {
  title: 'Components/Headers',
  render: (args: any) => {
    const classes = [];
    if (args.alignment) {
      classes.push(args.alignment);
    }
    if (args.marginAfter) {
      classes.push('margin-after-medium');
    }

    const headingText = args.text || 'Heading Level';

    switch (args.level) {
      case 'h1':
        return html`<er-h1 class="${classes.join(' ')}"
          >${headingText} 1</er-h1
        >`;
      case 'h2':
        return html`<er-h2 class="${classes.join(' ')}"
          >${headingText} 2</er-h2
        >`;
      case 'h3':
        return html`<er-h3 class="${classes.join(' ')}"
          >${headingText} 3</er-h3
        >`;
      case 'h4':
        return html`<er-h4 class="${classes.join(' ')}"
          >${headingText} 4</er-h4
        >`;
      case 'h5':
        return html`<er-h5 class="${classes.join(' ')}"
          >${headingText} 5</er-h5
        >`;
      case 'h6':
        return html`<er-h6 class="${classes.join(' ')}"
          >${headingText} 6</er-h6
        >`;
      default:
        return html`<er-h1 class="${classes.join(' ')}"
          >${headingText} 1</er-h1
        >`;
    }
  },
  argTypes: {
    text: { control: 'text' },
    level: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
    alignment: {
      control: 'select',
      options: ['', 'left', 'center', 'right'],
    },
    marginAfter: { control: 'boolean' },
  },
  args: {
    text: 'Example Heading',
    level: 'h1',
    alignment: 'left',
    marginAfter: false,
  },
};

export default meta;
type Story = StoryObj;

export const AllHeaders: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 10px;">
      <er-h1>Heading 1 (h1)</er-h1>
      <er-h2>Heading 2 (h2)</er-h2>
      <er-h3>Heading 3 (h3)</er-h3>
      <er-h4>Heading 4 (h4)</er-h4>
      <er-h5>Heading 5 (h5)</er-h5>
      <er-h6>Heading 6 (h6)</er-h6>
    </div>
  `,
};

export const CenteredH2: Story = {
  args: {
    level: 'h2',
    alignment: 'center',
    text: 'Centered H2 Title',
    marginAfter: true,
  },
};
