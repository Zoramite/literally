// @vitest-environment jsdom
import { defineCE, fixture } from '@open-wc/testing';
import { LitElement } from 'lit';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  FirestoreFeatureFlagAdapter,
  FirestoreFeatureFlagController,
  featureFlagRuleConverter,
  resolveFeatureFlagCollection,
  resolveFeatureFlagDoc,
} from './index.js';

const mocks = vi.hoisted(() => ({
  mockSetDoc: vi.fn().mockResolvedValue(undefined),
  mockDeleteDoc: vi.fn().mockResolvedValue(undefined),
  mockGetDocs: vi.fn(),
  mockGetDoc: vi.fn(),
  mockUnsubscribe: vi.fn(),
  lastOnNext: undefined as ((snap: any) => void) | undefined,
  lastOnError: undefined as ((err: any) => void) | undefined,
}));

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/firestore')>();
  return {
    ...actual,
    collection: vi.fn((db: any, ...paths: string[]) => ({
      type: 'collection',
      firestore: db,
      path: paths.join('/'),
      withConverter: vi.fn().mockReturnThis(),
    })),
    doc: vi.fn((parent: any, ...paths: string[]) => {
      const basePath = parent?.path ? `${parent.path}/` : '';
      const fullPath = `${basePath}${paths.join('/')}`;
      const segments = fullPath.split('/');
      return {
        type: 'document',
        id: segments[segments.length - 1],
        path: fullPath,
        withConverter: vi.fn().mockReturnThis(),
      };
    }),
    setDoc: mocks.mockSetDoc,
    deleteDoc: mocks.mockDeleteDoc,
    getDocs: mocks.mockGetDocs,
    getDoc: mocks.mockGetDoc,
    onSnapshot: vi.fn((_col: any, ...args: any[]) => {
      mocks.lastOnNext = args[0];
      mocks.lastOnError = args[1];
      return mocks.mockUnsubscribe;
    }),
  };
});

describe('featureFlagRuleConverter & Collection Resolution', () => {
  const mockDb: any = { type: 'firestore' };

  test('converts FeatureFlagRule toFirestore without undefined properties', () => {
    const docData = featureFlagRuleConverter.toFirestore({
      enabled: false,
      description: undefined,
      rolloutPercentage: 25,
      targetIds: ['pilot@wilderland.academy'],
      targetScopes: undefined,
      targetAttributes: { bucket: ['high_school'] },
    });

    expect(docData).toEqual({
      enabled: false,
      rolloutPercentage: 25,
      targetIds: ['pilot@wilderland.academy'],
      targetAttributes: { bucket: ['high_school'] },
    });

    for (const [k, v] of Object.entries(docData)) {
      expect(v, `${k} should not be undefined`).not.toBeUndefined();
    }
  });

  test('converts fromFirestore accurately', () => {
    const snap: any = {
      id: 'classroom_freeze',
      data: () => ({
        enabled: true,
        description: 'Freeze student screens',
        rolloutPercentage: 50,
        targetEmails: ['guide@wilderland.academy'],
        targetAttributes: { cohort: ['frogs'] },
      }),
    };

    const rule = featureFlagRuleConverter.fromFirestore(snap);
    expect(rule).toEqual({
      enabled: true,
      description: 'Freeze student screens',
      rolloutPercentage: 50,
      targetEmails: ['guide@wilderland.academy'],
      targetAttributes: { cohort: ['frogs'] },
    });
  });

  test('resolves namespaced collection paths for all three strategies', () => {
    // 1. Default without namespace -> 'feature_flags'
    const defaultCol: any = resolveFeatureFlagCollection({ firestore: mockDb });
    expect(defaultCol.path).toBe('feature_flags');

    // 2. collection_prefix (default with namespace) -> 'canopy_feature_flags'
    const prefixedCol: any = resolveFeatureFlagCollection({
      firestore: mockDb,
      namespace: 'canopy',
    });
    expect(prefixedCol.path).toBe('canopy_feature_flags');

    const prefixedDoc: any = resolveFeatureFlagDoc('classroom_freeze', {
      firestore: mockDb,
      namespace: 'canopy',
    });
    expect(prefixedDoc.path).toBe('canopy_feature_flags/classroom_freeze');

    // 3. subcollection -> 'namespaces/canopy/feature_flags'
    const subCol: any = resolveFeatureFlagCollection({
      firestore: mockDb,
      namespace: 'canopy',
      namespaceStrategy: 'subcollection',
    });
    expect(subCol.path).toBe('namespaces/canopy/feature_flags');

    // 4. document_prefix -> 'feature_flags/canopy__classroom_freeze'
    const docPrefixRef: any = resolveFeatureFlagDoc('classroom_freeze', {
      firestore: mockDb,
      namespace: 'canopy',
      namespaceStrategy: 'document_prefix',
    });
    expect(docPrefixRef.path).toBe('feature_flags/canopy__classroom_freeze');
  });
});

describe('FirestoreFeatureFlagAdapter & Controller', () => {
  const mockDb: any = { type: 'firestore' };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockUnsubscribe = vi.fn();
    mocks.lastOnNext = undefined;
    mocks.lastOnError = undefined;
  });

  test('fetches, filters, and writes rules with document_prefix namespace strategy', async () => {
    const adapter = new FirestoreFeatureFlagAdapter({
      firestore: mockDb,
      namespace: 'canopy',
      namespaceStrategy: 'document_prefix',
    });

    mocks.mockGetDocs.mockResolvedValue({
      docs: [
        {
          id: 'canopy__classroom_freeze',
          data: () => ({ enabled: true }),
        },
        {
          id: 'canopy__wilderland__debug_mode',
          data: () => ({ enabled: true }),
        },
        {
          id: 'other_app__unrelated_flag',
          data: () => ({ enabled: true }),
        },
      ],
    });

    const rules = await adapter.getFlags();
    expect(rules).toEqual({
      classroom_freeze: { enabled: true },
      wilderland__debug_mode: { enabled: true },
    });

    await adapter.setFlag('classroom_freeze', { enabled: false });
    expect(mocks.mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({
        path: 'feature_flags/canopy__classroom_freeze',
      }),
      { enabled: false },
      { merge: true },
    );
  });

  test('FirestoreFeatureFlagController subscribes on connect and evaluates flags reactively', async () => {
    const tagName = defineCE(
      class extends LitElement {
        flags = new FirestoreFeatureFlagController(this, {
          firestore: mockDb,
          namespace: 'canopy',
          context: {
            id: 'pilot@wilderland.academy',
            scope: 'wilderland',
            attributes: { bucket: 'high_school' },
          },
        });
      },
    );

    const el = await fixture<any>(`<${tagName}></${tagName}>`);
    const ctrl: FirestoreFeatureFlagController = el.flags;

    expect(ctrl.loading).toBe(true);

    // Simulate Firestore snapshot arriving on 'canopy_feature_flags'
    mocks.lastOnNext!({
      docs: [
        {
          id: 'classroom_freeze',
          data: () => ({
            enabled: false,
            targetIds: ['pilot@wilderland.academy'],
          }),
        },
        {
          id: 'wilderland__relaxed_mode',
          data: () => ({
            enabled: true,
          }),
        },
      ],
    });

    expect(ctrl.loading).toBe(false);
    expect(ctrl.isEnabled('classroom_freeze')).toBe(true);
    expect(ctrl.isEnabled('relaxed_mode')).toBe(true);
    expect(ctrl.isEnabled('unconfigured_flag')).toBe(false);

    el.remove();
    expect(mocks.mockUnsubscribe).toHaveBeenCalled();
  });
});
