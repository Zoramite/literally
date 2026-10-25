import { html } from 'lit';
import { describe, expect, it, vi } from 'vitest';

import {
  LazyRoute,
  PublicRoute,
  RoleRoute,
  RoleSwitchRoute,
  getRoutePageOptions,
  resolvePageDetails,
} from './route';

describe('route resolvers and getRoutePageOptions', () => {
  it('resolves static PageDetails', () => {
    const details = {
      pageOptions: { title: 'Static' },
      template: html`<div>Static</div>`,
    };
    expect(resolvePageDetails(details)).toBe(details);
  });

  it('resolves dynamic PageDetails resolver function', () => {
    const details = {
      pageOptions: { title: 'Dynamic' },
      template: html`<div>Dynamic</div>`,
    };
    const resolver = vi.fn(() => details);

    const result = resolvePageDetails(resolver, { admin: true });
    expect(resolver).toHaveBeenCalledWith({ admin: true });
    expect(result).toBe(details);
  });

  it('returns undefined when value is undefined', () => {
    expect(resolvePageDetails(undefined)).toBeUndefined();
  });

  it('extracts pageOptions without executing dynamic loader', () => {
    const loader = vi.fn();
    const route = new LazyRoute({
      pageOptions: { title: 'Lazy Title' },
      loader,
      template: () => html`<lazy-el></lazy-el>`,
    });

    expect(getRoutePageOptions(route)).toEqual({ title: 'Lazy Title' });
    expect(loader).not.toHaveBeenCalled();
  });

  it('handles function-based pageOptions', () => {
    const route = {
      pageOptions: (permissions?: Record<string, boolean> | null) => ({
        title: permissions?.admin ? 'Admin' : 'User',
      }),
      content: () => ({ template: html`` }),
    };

    expect(getRoutePageOptions(route, { admin: true })).toEqual({
      title: 'Admin',
    });
    expect(getRoutePageOptions(route, null)).toEqual({ title: 'User' });
  });
});

describe('PublicRoute', () => {
  it('supports static PageDetails and exposes pageOptions', () => {
    const details = {
      pageOptions: { title: 'Public Page' },
      template: html`<div>Public</div>`,
    };
    const route = new PublicRoute(details);

    expect(route.pageOptions).toEqual({ title: 'Public Page' });
    expect(route.content()).toBe(details);
  });

  it('supports dynamic resolver with explicit pageOptions for code-splitting', () => {
    const details = { template: html`<div>Split</div>` };
    const resolver = vi.fn(() => details);
    const route = new PublicRoute(resolver, { title: 'Split Page' });

    expect(route.pageOptions).toEqual({ title: 'Split Page' });
    expect(resolver).not.toHaveBeenCalled();

    const result = route.content();
    expect(resolver).toHaveBeenCalled();
    expect(result).toBe(details);
  });
});

describe('LazyRoute', () => {
  it('triggers loader and returns template synchronously by default (Web Component upgrade pattern)', () => {
    const loader = vi.fn();
    const route = new LazyRoute({
      pageOptions: { title: 'Lazy Component' },
      loader,
      template: () => html`<lazy-comp></lazy-comp>`,
    });

    expect(route.pageOptions).toEqual({ title: 'Lazy Component' });
    expect(loader).not.toHaveBeenCalled();

    const result = route.content();
    expect(loader).toHaveBeenCalledTimes(1);
    expect(result).not.toBeInstanceOf(Promise);
    expect((result as any).pageOptions).toEqual({ title: 'Lazy Component' });
  });

  it('supports async mode to await module before rendering', async () => {
    const fakeModule = { name: 'my-module' };
    const loader = vi.fn(async () => fakeModule);
    const templateFactory = vi.fn(
      (mod: any) => html`<div>Loaded ${mod?.name}</div>`,
    );

    const route = new LazyRoute({
      pageOptions: { title: 'Async Lazy' },
      loader,
      template: templateFactory,
      async: true,
    });

    const promise = route.content();
    expect(promise).toBeInstanceOf(Promise);

    const result = await promise;
    expect(loader).toHaveBeenCalled();
    expect(templateFactory).toHaveBeenCalledWith(fakeModule);
    expect(result.pageOptions).toEqual({ title: 'Async Lazy' });
  });
});

describe('RoleRoute', () => {
  it('allows access when user is authenticated and has allowed role', () => {
    const details = {
      pageOptions: { title: 'Admin Only' },
      template: html`<admin-panel></admin-panel>`,
    };
    const route = new RoleRoute(['admin'], details);

    expect(route.pageOptions).toEqual({ title: 'Admin Only' });
    expect(route.content({ authenticated: true, admin: true })).toBe(details);
  });

  it('denies access if unauthenticated and uses custom fallback if provided', () => {
    const signInDetails = {
      pageOptions: { title: 'Sign In' },
      template: html`<sign-in></sign-in>`,
    };
    const route = new RoleRoute(
      ['admin'],
      { template: html`<admin-panel></admin-panel>` },
      (reason) => (reason === 'unauthenticated' ? signInDetails : undefined),
    );

    // Unauthenticated
    expect(route.content(null)).toBe(signInDetails);
    expect(route.content({ authenticated: false })).toBe(signInDetails);
  });

  it('denies access if role is missing and returns forbidden fallback or undefined', () => {
    const forbiddenDetails = {
      pageOptions: { title: 'Access Denied' },
      template: html`<denied></denied>`,
    };
    const route = new RoleRoute(
      ['admin'],
      { template: html`<admin-panel></admin-panel>` },
      (reason) => (reason === 'forbidden' ? forbiddenDetails : undefined),
    );

    // Authenticated as guide, but not admin
    expect(route.content({ authenticated: true, guide: true })).toBe(
      forbiddenDetails,
    );
  });

  it('supports dynamic resolver functions for code-splitting', () => {
    const resolver = vi.fn(() => ({
      pageOptions: { title: 'Dynamic Role Page' },
      template: html`<dynamic-admin></dynamic-admin>`,
    }));
    const route = new RoleRoute(['admin'], resolver, undefined, {
      title: 'Admin',
    });

    expect(route.pageOptions).toEqual({ title: 'Admin' });
    expect(resolver).not.toHaveBeenCalled();

    const result = route.content({ authenticated: true, admin: true });
    expect(resolver).toHaveBeenCalled();
    expect((result as any).pageOptions.title).toBe('Dynamic Role Page');
  });
});

describe('RoleSwitchRoute', () => {
  it('selects the appropriate page based on user role and priority', () => {
    const adminPage = { template: html`<admin-view></admin-view>` };
    const guidePage = { template: html`<guide-view></guide-view>` };
    const studentPage = { template: html`<student-view></student-view>` };

    const route = new RoleSwitchRoute(
      {
        admin: adminPage,
        guide: guidePage,
        student: studentPage,
      },
      {
        rolePriority: ['admin', 'guide', 'student'],
        pageOptions: { title: 'Dashboard' },
      },
    );

    expect(route.pageOptions).toEqual({ title: 'Dashboard' });

    // User has both guide and student roles -> guide wins based on priority
    expect(
      route.content({ authenticated: true, guide: true, student: true }),
    ).toBe(guidePage);

    // User is admin
    expect(
      route.content({ authenticated: true, admin: true, guide: true }),
    ).toBe(adminPage);
  });

  it('uses fallbackRole if no matching role found in priority', () => {
    const studentPage = { template: html`<student-view></student-view>` };
    const route = new RoleSwitchRoute(
      { student: studentPage },
      {
        fallbackRole: 'student',
      },
    );

    expect(route.content({ authenticated: true, otherRole: true })).toBe(
      studentPage,
    );
  });
});
