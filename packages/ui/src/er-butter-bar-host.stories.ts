import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';

import { butterBarManager } from './butter-bar-manager';
import './er-butter-bar-host';

const meta: Meta = {
  title: 'Feedback/ErButterBarHost',
  component: 'er-butter-bar-host',
  render: () => html`
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <button
        @click=${() => {
          butterBarManager.track(
            {
              pendingMessage: 'Publishing course release…',
              pendingDetail: 'Syncing draft and creating snapshot',
              successMessage: 'Published release v1.3.0',
            },
            () => new Promise((resolve) => setTimeout(resolve, 1800)),
          );
        }}
      >
        Simulate Publish
      </button>
      <button
        @click=${() => {
          butterBarManager.show({
            type: 'warning',
            message: 'Offline mode',
            detail: 'Changes are queued locally.',
            dismissible: true,
          });
        }}
      >
        Show Warning
      </button>
      <button @click=${() => butterBarManager.clear()}>Clear All</button>
      <er-butter-bar-host></er-butter-bar-host>
    </div>
  `,
};

export default meta;
type Story = StoryObj;

export const Interactive: Story = {};
