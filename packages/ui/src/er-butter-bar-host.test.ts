// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { ButterBarManager } from './butter-bar-manager';
import { ErButterBarHost } from './er-butter-bar-host';
import './er-butter-bar-host';

describe('ErButterBarHost', () => {
  let container: HTMLDivElement;
  let manager: ButterBarManager;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    manager = new ButterBarManager();
  });

  afterEach(() => {
    manager.clear();
    container.remove();
  });

  test('renders butter bars from its manager and dismisses on click', async () => {
    const host = document.createElement(
      'er-butter-bar-host',
    ) as ErButterBarHost;
    host.manager = manager;
    container.appendChild(host);
    await host.updateComplete;

    manager.show({
      id: 'job-1',
      type: 'progress',
      message: 'Publishing…',
    });
    manager.show({
      id: 'job-2',
      type: 'success',
      message: 'Saved!',
      dismissible: true,
    });
    await host.updateComplete;

    const bars = host.shadowRoot?.querySelectorAll('er-butter-bar');
    expect(bars?.length).toBe(2);

    bars?.[1].dispatchEvent(new CustomEvent('dismiss', { bubbles: true }));
    await host.updateComplete;

    expect(manager.getNotifications()).toHaveLength(1);
    expect(host.shadowRoot?.querySelectorAll('er-butter-bar').length).toBe(1);
  });

  test('tracks ProcessingMixin events when listen-to-processing is enabled', async () => {
    const host = document.createElement(
      'er-butter-bar-host',
    ) as ErButterBarHost;
    host.manager = manager;
    host.listenToProcessing = true;
    container.appendChild(host);
    await host.updateComplete;

    window.dispatchEvent(
      new CustomEvent('processing-start', { detail: { key: 'publish' } }),
    );
    await host.updateComplete;
    expect(manager.getNotifications()).toHaveLength(1);
    expect(manager.getNotifications()[0]?.type).toBe('progress');

    window.dispatchEvent(
      new CustomEvent('processing-stop', { detail: { key: 'publish' } }),
    );
    await host.updateComplete;
    expect(manager.getNotifications()).toHaveLength(0);
  });
});
