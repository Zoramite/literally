import { describe, test } from 'vitest';

import { Manager } from './manager';

describe('Manager', () => {
  test.concurrent('thow error when no item is registered', async ({
    expect,
  }) => {
    const manager = new Manager();

    expect(() => {
      manager.get('foo');
    }).toThrow();
  });

  test.concurrent('has no initiator when no item is registered', async ({
    expect,
  }) => {
    const manager = new Manager();

    expect(manager.hasInitiator('foo')).toBeFalsy();
  });

  test.concurrent('has initiator when item is registered', async ({
    expect,
  }) => {
    const manager = new Manager();

    manager.register('foo', () => {
      return { foo: 'bar' };
    });

    expect(manager.hasInitiator('foo')).toBeTruthy();
  });

  test.concurrent('has no item when item is registered but not used', async ({
    expect,
  }) => {
    const manager = new Manager();

    manager.register('foo', () => {
      return { foo: 'bar' };
    });

    expect(manager.has('foo')).toBeFalsy();
  });

  test.concurrent('has item when item is registered and used', async ({
    expect,
  }) => {
    const manager = new Manager();

    manager.register('foo', () => {
      return { foo: 'bar' };
    });

    manager.get('foo');

    expect(manager.has('foo')).toBeTruthy();
  });

  test.concurrent('has item when item is added', async ({ expect }) => {
    const manager = new Manager();

    manager.add('foo', { foo: 'bar' });

    expect(manager.has('foo')).toBeTruthy();
  });

  test.concurrent('has no item or initiator when item is removed', async ({
    expect,
  }) => {
    const manager = new Manager();

    manager.register('foo', () => {
      return { foo: 'bar' };
    });

    manager.get('foo');

    expect(manager.has('foo')).toBeTruthy();
    expect(manager.hasInitiator('foo')).toBeTruthy();

    manager.remove('foo');

    expect(manager.has('foo')).toBeFalsy();
    expect(manager.hasInitiator('foo')).toBeFalsy();
  });
});
