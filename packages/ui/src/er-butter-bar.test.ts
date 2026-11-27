// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { ErButterBar } from './er-butter-bar';
import './er-butter-bar';

describe('ErButterBar', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    vi.useRealTimers();
    container.remove();
  });

  test('renders message, detail, and type attributes', async () => {
    const bar = document.createElement('er-butter-bar') as ErButterBar;
    bar.open = true;
    bar.type = 'progress';
    bar.message = 'Publishing release…';
    bar.detail = 'Saving course snapshot';
    container.appendChild(bar);
    await bar.updateComplete;

    expect(bar.getAttribute('type')).toBe('progress');
    expect(bar.hasAttribute('open')).toBe(true);
    expect(bar.shadowRoot?.querySelector('.message')?.textContent).toBe(
      'Publishing release…',
    );
    expect(bar.shadowRoot?.querySelector('.detail')?.textContent).toBe(
      'Saving course snapshot',
    );
    expect(bar.shadowRoot?.querySelector('.spinner')).not.toBeNull();
    expect(bar.shadowRoot?.querySelector('.progress-track')).not.toBeNull();
  });

  test('renders semantic icons for info, success, warning, and error', async () => {
    const bar = document.createElement('er-butter-bar') as ErButterBar;
    bar.open = true;
    container.appendChild(bar);

    const cases: Array<[ErButterBar['type'], string]> = [
      ['info', 'info'],
      ['success', 'check_circle'],
      ['warning', 'warning'],
      ['error', 'error'],
    ];

    for (const [type, expectedIcon] of cases) {
      bar.type = type;
      await bar.updateComplete;
      const icon = bar.shadowRoot?.querySelector('.leading er-icon');
      expect(icon).not.toBeNull();
      expect((icon as { icon?: string } | null)?.icon).toBe(expectedIcon);
      expect(bar.shadowRoot?.querySelector('.spinner')).toBeNull();
    }
  });

  test('emits dismiss event and closes when dismiss button is clicked', async () => {
    const bar = document.createElement('er-butter-bar') as ErButterBar;
    bar.open = true;
    bar.dismissible = true;
    bar.message = 'Saved changes';
    container.appendChild(bar);
    await bar.updateComplete;

    const onDismiss = vi.fn();
    bar.addEventListener('dismiss', onDismiss);

    const btn = bar.shadowRoot?.querySelector(
      '.dismiss-btn',
    ) as HTMLButtonElement | null;
    expect(btn).not.toBeNull();
    btn?.click();
    await bar.updateComplete;

    expect(bar.open).toBe(false);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('auto-dismisses non-progress notifications and pauses on hover/focus', async () => {
    vi.useFakeTimers();
    const bar = document.createElement('er-butter-bar') as ErButterBar;
    bar.open = true;
    bar.type = 'success';
    bar.message = 'Published v1.2.0';
    bar.autoDismissMs = 3000;
    container.appendChild(bar);
    await bar.updateComplete;

    const barEl = bar.shadowRoot?.querySelector('.bar') as HTMLElement;
    barEl.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(4000);
    expect(bar.open).toBe(true);

    barEl.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(2999);
    expect(bar.open).toBe(true);

    vi.advanceTimersByTime(1);
    await bar.updateComplete;
    expect(bar.open).toBe(false);
  });

  test('does not auto-dismiss while type is progress', async () => {
    vi.useFakeTimers();
    const bar = document.createElement('er-butter-bar') as ErButterBar;
    bar.open = true;
    bar.type = 'progress';
    bar.message = 'Uploading course…';
    bar.autoDismissMs = 2000;
    container.appendChild(bar);
    await bar.updateComplete;

    vi.advanceTimersByTime(5000);
    await bar.updateComplete;
    expect(bar.open).toBe(true);
  });

  test('sets popover="manual" when not inline and omits it when inline', async () => {
    const bar = document.createElement('er-butter-bar') as ErButterBar;
    bar.open = true;
    bar.message = 'Working…';
    container.appendChild(bar);
    await bar.updateComplete;

    const barEl = bar.shadowRoot?.querySelector('.bar');
    expect(barEl?.getAttribute('popover')).toBe('manual');

    bar.position = 'inline';
    await bar.updateComplete;
    expect(barEl?.hasAttribute('popover')).toBe(false);
  });
});
