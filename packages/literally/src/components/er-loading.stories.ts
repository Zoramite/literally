import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import './er-loading';
import './er-card';

const meta: Meta = {
  title: 'Components/ErLoading',
  component: 'er-loading',
  render: (args: any) => {
    const classes = [];
    if (args.theme) classes.push(args.theme);
    if (args.widthClass) classes.push(args.widthClass);

    return html`
      <div style="font-family: sans-serif; max-width: 600px;">
        <p>Inline loader with text:</p>
        <div>
          Before text
          <er-loading
            class="${classes.join(' ')}"
            width=${ifDefined(args.width || undefined)}
            animation=${ifDefined(args.animation || undefined)}
          ></er-loading>
          After text
        </div>
      </div>
    `;
  },
  argTypes: {
    width: {
      control: 'select',
      options: ['', '25', '33', '50', '75', '100'],
    },
    widthClass: {
      control: 'select',
      options: ['', 'w25', 'w33', 'w50', 'w75', 'w100'],
    },
    theme: {
      control: 'select',
      options: [
        '',
        'themeSurfaceVariant',
        'themeSurfaceContainer',
        'themePrimary',
        'themePrimaryContainer',
        'themeSecondary',
        'themeSecondaryContainer',
        'themeTertiary',
        'themeTertiaryContainer',
        'themeError',
        'themeErrorContainer',
      ],
    },
    animation: {
      control: 'select',
      options: ['', 'pulse', 'glow', 'none'],
    },
  },
  args: {
    width: '50',
    widthClass: '',
    theme: '',
    animation: '',
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    width: '50',
  },
};

export const AnimationStyles: StoryObj = {
  render: () => html`
    <div
      style="font-family: sans-serif; display: flex; flex-direction: column; gap: 16px; max-width: 500px;"
    >
      <div>Default (Shimmer): <er-loading width="75"></er-loading></div>
      <div>
        Pulse (Fade in/out):
        <er-loading width="75" animation="pulse"></er-loading>
      </div>
      <div>
        Pulse (using class): <er-loading width="75" class="pulse"></er-loading>
      </div>
      <div>
        Glow (Blinking glow):
        <er-loading width="75" animation="glow"></er-loading>
      </div>
      <div>
        Glow (using class):
        <er-loading width="75" class="glow themePrimary"></er-loading>
      </div>
      <div>
        None (Static): <er-loading width="75" animation="none"></er-loading>
      </div>
    </div>
  `,
};

export const WidthClasses: StoryObj = {
  render: () => html`
    <div
      style="font-family: sans-serif; display: flex; flex-direction: column; gap: 16px; max-width: 500px;"
    >
      <div>Width 25%: <er-loading width="25"></er-loading></div>
      <div>Width 33%: <er-loading width="33"></er-loading></div>
      <div>Width 50%: <er-loading width="50"></er-loading></div>
      <div>Width 75%: <er-loading width="75"></er-loading></div>
      <div>Width 100%: <er-loading width="100"></er-loading></div>
      <hr
        style="border: 0; border-top: 1px solid var(--md-sys-color-outline-variant, #ccc); margin: 8px 0;"
      />
      <div>Class w25: <er-loading class="w25"></er-loading></div>
      <div>Class w33: <er-loading class="w33"></er-loading></div>
      <div>Class w50: <er-loading class="w50"></er-loading></div>
      <div>Class w75: <er-loading class="w75"></er-loading></div>
      <div>Class w100: <er-loading class="w100"></er-loading></div>
    </div>
  `,
};

export const TypographyInheritance: StoryObj = {
  render: () => html`
    <div
      style="font-family: sans-serif; display: flex; flex-direction: column; gap: 16px;"
    >
      <h1>Header H1: <er-loading width="33"></er-loading> text</h1>
      <h2>Header H2: <er-loading width="33"></er-loading> text</h2>
      <h3>Header H3: <er-loading width="33"></er-loading> text</h3>
      <p style="font-size: 18px; line-height: 1.8;">
        Large custom text (18px, 1.8 line-height):
        <er-loading width="50"></er-loading> placeholder alignment
      </p>
      <p style="font-size: 14px; line-height: 1.4;">
        Small custom text (14px, 1.4 line-height):
        <er-loading width="50"></er-loading> placeholder alignment
      </p>
    </div>
  `,
};

export const ThemesShowcase: StoryObj = {
  render: () => html`
    <div
      style="font-family: sans-serif; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;"
    >
      <er-card class="themeSurfaceVariant">
        <h4 style="margin: 0 0 8px 0;">Surface Variant Card</h4>
        <p style="margin: 0; font-size: 14px;">
          Loading details:
          <er-loading class="themeSurfaceVariant" width="50"></er-loading>
        </p>
      </er-card>

      <er-card class="themePrimary">
        <h4 style="margin: 0 0 8px 0;">Primary Card</h4>
        <p style="margin: 0; font-size: 14px;">
          Loading action:
          <er-loading class="themePrimary" width="50"></er-loading>
        </p>
      </er-card>

      <er-card class="themePrimaryContainer">
        <h4 style="margin: 0 0 8px 0;">Primary Container Card</h4>
        <p style="margin: 0; font-size: 14px;">
          Loading sub-data:
          <er-loading class="themePrimaryContainer" width="50"></er-loading>
        </p>
      </er-card>

      <er-card class="themeSecondary">
        <h4 style="margin: 0 0 8px 0;">Secondary Card</h4>
        <p style="margin: 0; font-size: 14px;">
          Loading text:
          <er-loading class="themeSecondary" width="50"></er-loading>
        </p>
      </er-card>

      <er-card class="themeTertiary">
        <h4 style="margin: 0 0 8px 0;">Tertiary Card</h4>
        <p style="margin: 0; font-size: 14px;">
          Loading status:
          <er-loading class="themeTertiary" width="50"></er-loading>
        </p>
      </er-card>

      <er-card class="themeError">
        <h4 style="margin: 0 0 8px 0;">Error Card</h4>
        <p style="margin: 0; font-size: 14px;">
          Loading problem:
          <er-loading class="themeError" width="50"></er-loading>
        </p>
      </er-card>
    </div>
  `,
};

export const LayoutShiftTest: StoryObj = {
  render: () => {
    return html`
      <div
        style="font-family: sans-serif; display: flex; flex-direction: column; gap: 16px;"
      >
        <p style="margin: 0; max-width: 600px;">
          Below are comparisons showing the loading state and the loaded state
          side-by-side. If there is no layout shift, the left box and right box
          will have the exact same pixel height for each test case.
        </p>

        <div
          style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 800px; align-items: start;"
        >
          <div
            style="font-weight: bold; border-bottom: 2px solid var(--md-sys-color-outline-variant, #ccc); padding-bottom: 4px;"
          >
            Loading State (placeholder)
          </div>
          <div
            style="font-weight: bold; border-bottom: 2px solid var(--md-sys-color-outline-variant, #ccc); padding-bottom: 4px;"
          >
            Loaded State (replaced with text)
          </div>

          <!-- Test Case 1: Large Font, High Line Height -->
          <div
            style="border: 1px dashed var(--md-sys-color-outline, #999); padding: 12px; font-size: 22px; line-height: 2; background: var(--md-sys-color-surface-container, #f9f9f9);"
          >
            <er-loading class="themeSurfaceVariant" width="75"></er-loading>
          </div>
          <div
            style="border: 1px dashed var(--md-sys-color-outline, #999); padding: 12px; font-size: 22px; line-height: 2; background: var(--md-sys-color-surface-container, #f9f9f9);"
          >
            Loaded content
          </div>

          <!-- Test Case 2: Standard Body Font, Tight Line Height -->
          <div
            style="border: 1px dashed var(--md-sys-color-outline, #999); padding: 12px; font-size: 16px; line-height: 1.2; background: var(--md-sys-color-surface-container, #f9f9f9);"
          >
            <er-loading class="themeSurfaceVariant" width="50"></er-loading>
          </div>
          <div
            style="border: 1px dashed var(--md-sys-color-outline, #999); padding: 12px; font-size: 16px; line-height: 1.2; background: var(--md-sys-color-surface-container, #f9f9f9);"
          >
            Loaded content
          </div>

          <!-- Test Case 3: Small Text, Very High Line Height -->
          <div
            style="border: 1px dashed var(--md-sys-color-outline, #999); padding: 12px; font-size: 12px; line-height: 2.5; background: var(--md-sys-color-surface-container, #f9f9f9);"
          >
            <er-loading class="themeSurfaceVariant" width="60"></er-loading>
          </div>
          <div
            style="border: 1px dashed var(--md-sys-color-outline, #999); padding: 12px; font-size: 12px; line-height: 2.5; background: var(--md-sys-color-surface-container, #f9f9f9);"
          >
            Loaded content
          </div>

          <!-- Test Case 4: Heading H3 Context -->
          <div
            style="border: 1px dashed var(--md-sys-color-outline, #999); padding: 12px; background: var(--md-sys-color-surface-container, #f9f9f9);"
          >
            <h3 style="margin: 0; line-height: 1.5; font-family: sans-serif;">
              <er-loading class="themeSurfaceVariant" width="33"></er-loading>
            </h3>
          </div>
          <div
            style="border: 1px dashed var(--md-sys-color-outline, #999); padding: 12px; background: var(--md-sys-color-surface-container, #f9f9f9);"
          >
            <h3 style="margin: 0; line-height: 1.5; font-family: sans-serif;">
              Loaded header
            </h3>
          </div>
        </div>
      </div>
    `;
  },
};
