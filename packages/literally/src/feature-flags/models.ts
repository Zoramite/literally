/**
 * Metadata definition for a known feature flag in an application.
 */
export interface FeatureFlagDefinition<TKey extends string = string> {
  /** Unique feature flag identifier (e.g. 'classroom_freeze'). */
  id: TKey;
  /** Human-readable display name. */
  name: string;
  /** Detailed description of what the feature flag controls. */
  description?: string;
  /** Optional grouping category (e.g. 'Safety', 'Classroom', 'Developer'). */
  category?: string;
  /** Default baseline state when no rule exists (defaults to false). */
  defaultEnabled?: boolean;
}

/**
 * Configuration rule for a single feature flag, either globally or for a specific scope.
 */
export interface FeatureFlagRule {
  /**
   * When true, unconditionally enables the flag for all users in this rule's scope.
   * Note: When a global rule has `enabled: true`, it trumps all scoped overrides.
   */
  enabled: boolean;
  /** Optional description stored alongside the rule. */
  description?: string;
  /**
   * Percentage of users (0–100) for gradual deterministic rollout.
   * Evaluated by hashing `${identifier}:${flagKey}` to an integer in 0–99.
   */
  rolloutPercentage?: number;
  /**
   * Specific user identifiers (e.g. emails, UIDs) allowlisted for this flag.
   * Matched case-insensitively when `normalizeId` is true (default).
   */
  targetIds?: string[];
  /**
   * Specific scopes (e.g. tenant IDs, organization IDs) allowlisted on a global rule.
   */
  targetScopes?: string[];
  /**
   * Arbitrary key-value attribute targeting (e.g. `{ bucket: ['high_school'], cohort: ['2026'] }`).
   * A rule matches if ANY of the configured attribute keys has a value matching the evaluation context.
   */
  targetAttributes?: Record<string, string[]>;
  /**
   * Legacy / convenience alias for `targetEmails` (merged with `targetIds` during evaluation).
   */
  targetEmails?: string[];
  /**
   * Legacy / convenience alias for `targetTenants` (merged with `targetScopes` during evaluation).
   */
  targetTenants?: string[];
}

/**
 * Context representing the current user/session being evaluated against feature flag rules.
 */
export interface FeatureFlagEvaluationContext {
  /**
   * Unique user identifier (e.g. email address or user UID) used for `targetIds` matching
   * and deterministic `rolloutPercentage` hashing.
   */
  id?: string | null;
  /**
   * Active scope/tenant identifier (e.g. 'wilderland'). Used to look up scoped rule overrides
   * (`${scope}__${flagId}`) and match against `targetScopes`.
   */
  scope?: string | null;
  /**
   * Arbitrary user/session attributes (e.g. `{ bucket: 'high_school', cohort: 'class_2026', roles: ['guide'] }`).
   */
  attributes?: Record<string, string | string[] | null | undefined>;
  /**
   * Whether to normalize `id` and `targetIds` (trim + lowercase) before comparing and hashing.
   * Defaults to `true`.
   */
  normalizeId?: boolean;
}

/**
 * Effective state summary for a feature flag in a given scope, useful for admin management UIs.
 */
export interface EffectiveFeatureFlagState {
  /** The resolved rule state in the requested scope. */
  rule: FeatureFlagRule;
  /** Whether a scope-specific override document exists for this flag. */
  isScopedOverride: boolean;
  /** The storage key for this flag in the requested scope (e.g. `flagId` or `scope__flagId`). */
  storageKey: string;
  /** True when the global rule has `enabled: true`, which overrides any scope-level configuration. */
  isGloballyTrumped: boolean;
}

/**
 * Listener callback invoked whenever stored feature flag rules change.
 */
export type FeatureFlagStoreListener = (
  rules: Record<string, FeatureFlagRule>,
) => void;

/**
 * Generic storage adapter interface for loading, persisting, and subscribing to feature flag rules.
 *
 * Keys in the returned record are either global flag IDs (`flagId`) or scope-prefixed
 * override keys (`${scope}${scopeSeparator}${flagId}`, where `scopeSeparator` defaults to `'__'`).
 */
export interface FeatureFlagStorageAdapter {
  /**
   * Retrieves all feature flag rules from the backing store.
   */
  getFlags(): Promise<Record<string, FeatureFlagRule>>;

  /**
   * Retrieves a single feature flag rule by its storage key (`flagId` or `scope__flagId`).
   */
  getFlag?(key: string): Promise<FeatureFlagRule | null>;

  /**
   * Saves or updates a feature flag rule at the specified storage key.
   *
   * @param key Storage key (`flagId` or `scope__flagId`).
   * @param rule Partial or complete rule to persist.
   * @param options Optional merge control (defaults to merging with existing fields if supported).
   */
  setFlag?(
    key: string,
    rule: Partial<FeatureFlagRule>,
    options?: { merge?: boolean },
  ): Promise<void>;

  /**
   * Deletes a feature flag rule or scoped override at the specified storage key.
   */
  deleteFlag?(key: string): Promise<void>;

  /**
   * Optional real-time subscription to flag rule changes in the backing store.
   *
   * @param listener Callback invoked with the latest full map of storage keys to rules.
   * @param onError Optional callback invoked when the subscription encounters an error.
   * @returns An unsubscribe function to stop listening.
   */
  subscribe?(
    listener: FeatureFlagStoreListener,
    onError?: (error: Error) => void,
  ): () => void;
}
