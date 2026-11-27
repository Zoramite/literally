import { afterEach, describe, expect, test, vi } from 'vitest';

import { ButterBarManager } from './butter-bar-manager';

describe('ButterBarManager', () => {
  let manager: ButterBarManager;

  afterEach(() => {
    manager?.clear();
  });

  test('adds, updates, and dismisses notifications', () => {
    manager = new ButterBarManager();
    const counts: number[] = [];
    const unsubscribe = manager.subscribe((items) => {
      counts.push(items.length);
    });

    const id = manager.show({
      type: 'progress',
      message: 'Publishing release…',
    });
    expect(manager.getNotifications()).toHaveLength(1);
    expect(manager.getNotifications()[0]).toMatchObject({
      id,
      type: 'progress',
      dismissible: false,
      autoDismissMs: 0,
    });

    manager.update(id, { message: 'Still publishing…' });
    expect(manager.getNotifications()[0]?.message).toBe('Still publishing…');

    manager.dismiss(id);
    expect(manager.getNotifications()).toHaveLength(0);
    expect(counts).toEqual([0, 1, 1, 0]);
    unsubscribe();
  });

  test('tracks async operations from progress to success', async () => {
    manager = new ButterBarManager();
    let resolveTask!: (value: string) => void;

    const promise = manager.track(
      {
        pendingMessage: 'Publishing release…',
        successMessage: (version) => `Published ${version}`,
      },
      () =>
        new Promise<string>((resolve) => {
          resolveTask = resolve;
        }),
    );

    expect(manager.getNotifications()[0]).toMatchObject({
      type: 'progress',
      message: 'Publishing release…',
    });

    resolveTask('v1.2.0');
    await expect(promise).resolves.toBe('v1.2.0');

    expect(manager.getNotifications()[0]).toMatchObject({
      type: 'success',
      message: 'Published v1.2.0',
      dismissible: true,
    });
  });

  test('transitions to error and rethrows when tracked task fails', async () => {
    manager = new ButterBarManager();
    await expect(
      manager.track(
        {
          pendingMessage: 'Publishing release…',
          errorMessage: 'Publish failed',
        },
        vi.fn().mockRejectedValue(new Error('Permission denied')),
      ),
    ).rejects.toThrow('Permission denied');

    expect(manager.getNotifications()[0]).toMatchObject({
      type: 'error',
      message: 'Publish failed',
      detail: 'Permission denied',
      dismissible: true,
      autoDismissMs: 0,
    });
  });
});
