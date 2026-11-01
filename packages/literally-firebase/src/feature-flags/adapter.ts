import type {
  FeatureFlagRule,
  FeatureFlagStorageAdapter,
  FeatureFlagStoreListener,
} from '@littoral/literally/feature-flags';

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  type CollectionReference,
  type DocumentData,
  type DocumentReference,
  type Firestore,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
} from 'firebase/firestore';

import { cleanFirestoreData } from '../firestore/clean.js';

/**
 * Standard FirestoreDataConverter for `FeatureFlagRule` documents.
 * Ensures clean data writes with zero `undefined` properties and safe defaults.
 */
export const featureFlagRuleConverter: FirestoreDataConverter<FeatureFlagRule> =
  {
    toFirestore(model: FeatureFlagRule): DocumentData {
      const raw: Record<string, any> = {
        enabled: Boolean(model.enabled),
      };

      if (model.description !== undefined) {
        raw.description = model.description ?? '';
      }
      if (model.rolloutPercentage !== undefined) {
        raw.rolloutPercentage = Number(model.rolloutPercentage) || 0;
      }
      if (model.targetIds !== undefined) {
        raw.targetIds = model.targetIds ?? [];
      }
      if (model.targetScopes !== undefined) {
        raw.targetScopes = model.targetScopes ?? [];
      }
      if (model.targetAttributes !== undefined) {
        raw.targetAttributes = model.targetAttributes ?? {};
      }
      if (model.targetEmails !== undefined) {
        raw.targetEmails = model.targetEmails ?? [];
      }
      if (model.targetTenants !== undefined) {
        raw.targetTenants = model.targetTenants ?? [];
      }

      return cleanFirestoreData(raw);
    },

    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options?: SnapshotOptions,
    ): FeatureFlagRule {
      const data = snapshot.data(options);
      const rule: FeatureFlagRule = {
        enabled: Boolean(data.enabled),
      };

      if (typeof data.description === 'string') {
        rule.description = data.description;
      }
      if (typeof data.rolloutPercentage === 'number') {
        rule.rolloutPercentage = data.rolloutPercentage;
      }
      if (Array.isArray(data.targetIds)) {
        rule.targetIds = data.targetIds;
      }
      if (Array.isArray(data.targetScopes)) {
        rule.targetScopes = data.targetScopes;
      }
      if (
        data.targetAttributes &&
        typeof data.targetAttributes === 'object' &&
        !Array.isArray(data.targetAttributes)
      ) {
        rule.targetAttributes = data.targetAttributes as Record<
          string,
          string[]
        >;
      }
      if (Array.isArray(data.targetEmails)) {
        rule.targetEmails = data.targetEmails;
      }
      if (Array.isArray(data.targetTenants)) {
        rule.targetTenants = data.targetTenants;
      }

      return rule;
    },
  };

export interface FirestoreFeatureFlagAdapterOptions {
  /**
   * Firestore database instance.
   */
  firestore: Firestore;

  /**
   * Optional namespace to isolate feature flags for a specific application, product, or environment.
   *
   * - When `namespaceStrategy` is `'collection_prefix'` (default):
   *   resolves collection `${namespace}_${collectionName}` (e.g. `'canopy_feature_flags'`).
   * - When `namespaceStrategy` is `'subcollection'`:
   *   resolves subcollection `${parentCollection}/${namespace}/${collectionName}`
   *   (e.g. `'namespaces/canopy/feature_flags'`).
   * - When `namespaceStrategy` is `'document_prefix'`:
   *   stores documents in `${collectionName}` with document IDs prefixed by
   *   `${namespace}${namespaceSeparator}${key}` (e.g. `'canopy__classroom_freeze'`).
   */
  namespace?: string;

  /**
   * Base collection name for feature flags. Defaults to `'feature_flags'`.
   * May also be a slash-delimited collection path (e.g. `'apps/canopy/feature_flags'`).
   */
  collectionName?: string;

  /**
   * How `namespace` is applied in Firestore when provided. Defaults to `'collection_prefix'`.
   */
  namespaceStrategy?: 'collection_prefix' | 'subcollection' | 'document_prefix';

  /**
   * Parent collection name when `namespaceStrategy` is `'subcollection'`. Defaults to `'namespaces'`.
   */
  parentCollection?: string;

  /**
   * Separator used when `namespaceStrategy` is `'document_prefix'`. Defaults to `'__'`.
   */
  namespaceSeparator?: string;
}

/**
 * Resolves the Firestore `CollectionReference<FeatureFlagRule>` for the given adapter options.
 */
export function resolveFeatureFlagCollection(
  options: FirestoreFeatureFlagAdapterOptions,
): CollectionReference<FeatureFlagRule> {
  const {
    firestore,
    namespace,
    collectionName = 'feature_flags',
    namespaceStrategy = 'collection_prefix',
    parentCollection = 'namespaces',
  } = options;

  if (namespace && namespaceStrategy === 'subcollection') {
    return collection(
      firestore,
      parentCollection,
      namespace,
      collectionName,
    ).withConverter(featureFlagRuleConverter);
  }

  if (namespace && namespaceStrategy === 'collection_prefix') {
    const prefixedName = `${namespace}_${collectionName}`;
    return collection(firestore, prefixedName).withConverter(
      featureFlagRuleConverter,
    );
  }

  return collection(firestore, collectionName).withConverter(
    featureFlagRuleConverter,
  );
}

/**
 * Resolves a Firestore `DocumentReference<FeatureFlagRule>` for a specific storage key.
 */
export function resolveFeatureFlagDoc(
  key: string,
  options: FirestoreFeatureFlagAdapterOptions,
): DocumentReference<FeatureFlagRule> {
  const colRef = resolveFeatureFlagCollection(options);
  const docId = toFirestoreDocId(key, options);
  return doc(colRef, docId);
}

function toFirestoreDocId(
  key: string,
  options: FirestoreFeatureFlagAdapterOptions,
): string {
  const {
    namespace,
    namespaceStrategy = 'collection_prefix',
    namespaceSeparator = '__',
  } = options;

  if (namespace && namespaceStrategy === 'document_prefix') {
    return `${namespace}${namespaceSeparator}${key}`;
  }
  return key;
}

function fromFirestoreDocId(
  docId: string,
  options: FirestoreFeatureFlagAdapterOptions,
): string | null {
  const {
    namespace,
    namespaceStrategy = 'collection_prefix',
    namespaceSeparator = '__',
  } = options;

  if (namespace && namespaceStrategy === 'document_prefix') {
    const prefix = `${namespace}${namespaceSeparator}`;
    if (!docId.startsWith(prefix)) {
      return null;
    }
    return docId.slice(prefix.length);
  }
  return docId;
}

/**
 * Firestore storage adapter implementing `@littoral/literally`'s `FeatureFlagStorageAdapter`.
 * Supports namespaced collections (`canopy_feature_flags`), subcollections
 * (`namespaces/canopy/feature_flags`), and document-prefixed keys within a shared collection.
 */
export class FirestoreFeatureFlagAdapter implements FeatureFlagStorageAdapter {
  private readonly options: FirestoreFeatureFlagAdapterOptions;

  constructor(options: FirestoreFeatureFlagAdapterOptions) {
    this.options = options;
  }

  /**
   * Returns the resolved Firestore `CollectionReference` backing this adapter.
   */
  getCollectionRef(): CollectionReference<FeatureFlagRule> {
    return resolveFeatureFlagCollection(this.options);
  }

  /**
   * Returns a `DocumentReference` for a specific feature flag key (`flagId` or `scope__flagId`).
   */
  getDocRef(key: string): DocumentReference<FeatureFlagRule> {
    return resolveFeatureFlagDoc(key, this.options);
  }

  /**
   * Fetches all feature flag rules in the namespaced collection.
   */
  async getFlags(): Promise<Record<string, FeatureFlagRule>> {
    const colRef = this.getCollectionRef();
    const snapshot = await getDocs(colRef);
    const rules: Record<string, FeatureFlagRule> = {};

    for (const docSnap of snapshot.docs) {
      const logicalKey = fromFirestoreDocId(docSnap.id, this.options);
      if (logicalKey !== null) {
        rules[logicalKey] = docSnap.data();
      }
    }

    return rules;
  }

  /**
   * Fetches a single feature flag rule by its storage key (`flagId` or `scope__flagId`).
   */
  async getFlag(key: string): Promise<FeatureFlagRule | null> {
    const docRef = this.getDocRef(key);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return null;
    }
    return snap.data();
  }

  /**
   * Creates or updates a feature flag rule in Firestore.
   * Cleans `undefined` fields prior to writing.
   */
  async setFlag(
    key: string,
    rule: Partial<FeatureFlagRule>,
    options?: { merge?: boolean },
  ): Promise<void> {
    const merge = options?.merge !== false;
    const colRef = resolveFeatureFlagCollection(this.options);
    const docId = toFirestoreDocId(key, this.options);
    const rawDocRef = doc(colRef.firestore, colRef.path, docId);

    const payload = cleanFirestoreData({
      ...rule,
      ...(rule.enabled !== undefined ? { enabled: Boolean(rule.enabled) } : {}),
    });

    if (merge) {
      await setDoc(rawDocRef, payload, { merge: true });
    } else {
      await setDoc(
        rawDocRef,
        featureFlagRuleConverter.toFirestore({
          enabled: Boolean(rule.enabled),
          ...rule,
        }),
      );
    }
  }

  /**
   * Deletes a feature flag rule or scoped override document from Firestore.
   */
  async deleteFlag(key: string): Promise<void> {
    const docRef = this.getDocRef(key);
    await deleteDoc(docRef);
  }

  /**
   * Subscribes to real-time updates on the feature flags collection using `onSnapshot`.
   */
  subscribe(
    listener: FeatureFlagStoreListener,
    onError?: (error: Error) => void,
  ): () => void {
    const colRef = this.getCollectionRef();
    return onSnapshot(
      colRef,
      (snapshot) => {
        const rules: Record<string, FeatureFlagRule> = {};
        for (const docSnap of snapshot.docs) {
          const logicalKey = fromFirestoreDocId(docSnap.id, this.options);
          if (logicalKey !== null) {
            rules[logicalKey] = docSnap.data();
          }
        }
        listener(rules);
      },
      (err) => {
        onError?.(err);
      },
    );
  }
}
