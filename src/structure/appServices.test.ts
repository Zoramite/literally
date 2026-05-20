import { describe, test } from 'vitest';

import { AppServices } from './appServices';

describe('App services', () => {
  test.concurrent('undefined when no service is registered', async ({
    expect,
  }) => {
    const appServices = new AppServices();

    expect(appServices.getService('foo')).toBeUndefined();
  });

  test.concurrent('has no initiator when no service is registered', async ({
    expect,
  }) => {
    const appServices = new AppServices();

    expect(appServices.hasInitiator('foo')).toBeFalsy();
  });

  test.concurrent('has initiator when service is registered', async ({
    expect,
  }) => {
    const appServices = new AppServices();

    appServices.registerService('foo', () => {
      return { foo: 'bar' };
    });

    expect(appServices.hasInitiator('foo')).toBeTruthy();
  });

  test.concurrent('has no service when service is registered but not used', async ({
    expect,
  }) => {
    const appServices = new AppServices();

    appServices.registerService('foo', () => {
      return { foo: 'bar' };
    });

    expect(appServices.hasService('foo')).toBeFalsy();
  });

  test.concurrent('has service when service is registered and used', async ({
    expect,
  }) => {
    const appServices = new AppServices();

    appServices.registerService('foo', () => {
      return { foo: 'bar' };
    });

    appServices.getService('foo');

    expect(appServices.hasService('foo')).toBeTruthy();
  });

  test.concurrent('has service when service is added', async ({ expect }) => {
    const appServices = new AppServices();

    appServices.addService('foo', { foo: 'bar' });

    expect(appServices.hasService('foo')).toBeTruthy();
  });

  test.concurrent('has no service or initiator when service is removed', async ({
    expect,
  }) => {
    const appServices = new AppServices();

    appServices.registerService('foo', () => {
      return { foo: 'bar' };
    });

    appServices.getService('foo');

    expect(appServices.hasService('foo')).toBeTruthy();
    expect(appServices.hasInitiator('foo')).toBeTruthy();

    appServices.removeService('foo');

    expect(appServices.hasService('foo')).toBeFalsy();
    expect(appServices.hasInitiator('foo')).toBeFalsy();
  });
});
