import type {
  EffectiveFeatureFlagState,
  FeatureFlagDefinition,
  FeatureFlagEvaluationContext,
  FeatureFlagRule,
  FeatureFlagStorageAdapter,
  FeatureFlagStoreListener,
} from './models';

import {
  DEFAULT_SCOPE_SEPARATOR,
  evaluateAllFlags,
  evaluateSingleFlag,
  formatScopedFlagKey,
  resolveEffectiveFlagState,
} from './evaluator';

/**
 * In-memory implementation of `FeatureFlagStorageAdapter`.
 * Ideal for local development, unit testing, or static flag configurations.
 */
export class InMemoryFeatureFlagAdapter implements FeatureFlagStorageAdapter {
  private rules: Record<string, FeatureFlagRule>;
  private listeners = new Set<FeatureFlagStoreListener>();

  constructor(initialRules: Record<string, FeatureFlagRule> = {}) {
    this.rules = { ...initialRules };
  }

  async getFlags(): Promise<Record<string, FeatureFlagRule>> {
    return { ...this.rules };
  }

  async getFlag(key: string): Promise<FeatureFlagRule | null> {
    return this.rules[key] ? { ...this.rules[key] } : null;
  }

  async setFlag(
    key: string,
    rule: Partial<FeatureFlagRule>,
    options?: { merge?: boolean },
  ): Promise<void> {
    const merge = options?.merge !== false;
    const existing = this.rules[key];
    if (merge && existing) {
      this.rules[key] = {
        ...existing,
        ...rule,
        enabled: rule.enabled ?? existing.enabled ?? false,
      };
    } else {
      this.rules[key] = {
        ...rule,
        enabled: Boolean(rule.enabled),
      };
    }
    this.notify();
  }

  async deleteFlag(key: string): Promise<void> {
    if (key in this.rules) {
      delete this.rules[key];
      this.notify();
    }
  }

  subscribe(listener: FeatureFlagStoreListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.rules });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const snapshot = { ...this.rules };
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}

export interface FeatureFlagManagerOptions<TKey extends string = string> {
  /** Storage adapter used to load, save, and subscribe to feature flag rules. */
  adapter?: FeatureFlagStorageAdapter;
  /** Optional catalog of known feature definitions. */
  definitions?: ReadonlyArray<FeatureFlagDefinition<TKey>>;
  /** Optional baseline defaults by flag key. */
  defaults?: Partial<Record<TKey, boolean>>;
  /** Default evaluation context (user ID, scope, attributes) used when `isEnabled()` is called. */
  context?: FeatureFlagEvaluationContext;
  /** Separator between scope prefix and flag ID in storage keys (defaults to `'__'`). */
  scopeSeparator?: string;
}

export type FeatureFlagChangeListener = () => void;

/**
 * Central manager for loading, evaluating, and updating feature flags.
 */
export class FeatureFlagManager<TKey extends string = string> {
  private adapter: FeatureFlagStorageAdapter;
  private definitionsMap = new Map<TKey, FeatureFlagDefinition<TKey>>();
  private defaults: Partial<Record<TKey, boolean>>;
  private currentContext: FeatureFlagEvaluationContext;
  private scopeSeparator: string;
  private rules: Record<string, FeatureFlagRule> = {};
  private unsubscribeAdapter?: () => void;
  private listeners = new Set<FeatureFlagChangeListener>();
  private isLoaded = false;

  constructor(options: FeatureFlagManagerOptions<TKey> = {}) {
    this.adapter = options.adapter ?? new InMemoryFeatureFlagAdapter();
    this.defaults = { ...options.defaults };
    this.currentContext = { ...options.context };
    this.scopeSeparator = options.scopeSeparator ?? DEFAULT_SCOPE_SEPARATOR;

    if (options.definitions) {
      for (const def of options.definitions) {
        this.definitionsMap.set(def.id, def);
        if (def.defaultEnabled !== undefined && !(def.id in this.defaults)) {
          this.defaults[def.id] = def.defaultEnabled;
        }
      }
    }
  }

  /** Whether initial flag rules have been loaded or received from the adapter. */
  get loaded(): boolean {
    return this.isLoaded;
  }

  /** Returns a shallow copy of the currently cached raw rules. */
  getRules(): Record<string, FeatureFlagRule> {
    return { ...this.rules };
  }

  /** Returns all registered feature definitions. */
  getDefinitions(): FeatureFlagDefinition<TKey>[] {
    return Array.from(this.definitionsMap.values());
  }

  /** Returns the current default evaluation context. */
  getContext(): FeatureFlagEvaluationContext {
    return { ...this.currentContext };
  }

  /**
   * Updates the default evaluation context and notifies subscribers.
   */
  setContext(context: FeatureFlagEvaluationContext): void {
    this.currentContext = { ...context };
    this.notifyListeners();
  }

  /**
   * Merges partial updates into the default evaluation context and notifies subscribers.
   */
  updateContext(partial: Partial<FeatureFlagEvaluationContext>): void {
    this.currentContext = {
      ...this.currentContext,
      ...partial,
      attributes:
        partial.attributes !== undefined
          ? { ...this.currentContext.attributes, ...partial.attributes }
          : this.currentContext.attributes,
    };
    this.notifyListeners();
  }

  /**
   * Replaces the storage adapter at runtime.
   */
  setAdapter(adapter: FeatureFlagStorageAdapter): void {
    const wasSubscribed = Boolean(this.unsubscribeAdapter);
    this.stopListening();
    this.adapter = adapter;
    if (wasSubscribed) {
      this.startListening();
    }
  }

  /**
   * Replaces the in-memory rules directly and notifies listeners.
   */
  setRules(rules: Record<string, FeatureFlagRule>): void {
    this.rules = { ...rules };
    this.isLoaded = true;
    this.notifyListeners();
  }

  /**
   * Fetches the latest feature flag rules from the storage adapter once.
   */
  async load(): Promise<Record<string, FeatureFlagRule>> {
    const loadedRules = await this.adapter.getFlags();
    this.rules = { ...loadedRules };
    this.isLoaded = true;
    this.notifyListeners();
    return this.getRules();
  }

  /**
   * Starts a real-time subscription on the storage adapter (if supported).
   * If the adapter does not implement `subscribe`, falls back to `load()`.
   */
  startListening(onError?: (error: Error) => void): () => void {
    this.stopListening();
    if (this.adapter.subscribe) {
      this.unsubscribeAdapter = this.adapter.subscribe(
        (updatedRules) => {
          this.rules = { ...updatedRules };
          this.isLoaded = true;
          this.notifyListeners();
        },
        (err) => {
          onError?.(err);
        },
      );
    } else {
      void this.load().catch((err) => onError?.(err as Error));
    }
    return () => this.stopListening();
  }

  /**
   * Stops any active real-time subscription on the storage adapter.
   */
  stopListening(): void {
    if (this.unsubscribeAdapter) {
      this.unsubscribeAdapter();
      this.unsubscribeAdapter = undefined;
    }
  }

  /**
   * Evaluates whether a specific feature flag is enabled for the given context
   * (or the manager's default context if omitted).
   */
  isEnabled(
    flagKey: TKey | (string & {}),
    contextOverride?: FeatureFlagEvaluationContext,
  ): boolean {
    const mergedContext: FeatureFlagEvaluationContext = contextOverride
      ? {
          ...this.currentContext,
          ...contextOverride,
          attributes:
            contextOverride.attributes !== undefined
              ? {
                  ...this.currentContext.attributes,
                  ...contextOverride.attributes,
                }
              : this.currentContext.attributes,
        }
      : this.currentContext;

    const defaultEnabled =
      this.defaults[flagKey as TKey] ??
      this.definitionsMap.get(flagKey as TKey)?.defaultEnabled ??
      false;

    return evaluateSingleFlag(flagKey, this.rules, mergedContext, {
      defaultEnabled,
      scopeSeparator: this.scopeSeparator,
    });
  }

  /**
   * Evaluates all registered and stored feature flags for the given context
   * (or the manager's default context if omitted).
   */
  evaluateAll(
    contextOverride?: FeatureFlagEvaluationContext,
  ): Record<TKey, boolean> {
    const mergedContext: FeatureFlagEvaluationContext = contextOverride
      ? {
          ...this.currentContext,
          ...contextOverride,
          attributes:
            contextOverride.attributes !== undefined
              ? {
                  ...this.currentContext.attributes,
                  ...contextOverride.attributes,
                }
              : this.currentContext.attributes,
        }
      : this.currentContext;

    return evaluateAllFlags(this.rules, mergedContext, {
      definitions: this.getDefinitions(),
      defaults: this.defaults,
      scopeSeparator: this.scopeSeparator,
    });
  }

  /**
   * Resolves the effective rule state for a flag in a given scope (defaults to `'global'`),
   * including whether a scoped override exists and whether global enablement trumps it.
   */
  getEffectiveState(
    flagId: TKey | (string & {}),
    scope: string | null | undefined = 'global',
  ): EffectiveFeatureFlagState {
    const defaultEnabled =
      this.defaults[flagId as TKey] ??
      this.definitionsMap.get(flagId as TKey)?.defaultEnabled ??
      false;

    return resolveEffectiveFlagState(flagId, this.rules, scope, {
      defaultEnabled,
      scopeSeparator: this.scopeSeparator,
    });
  }

  /**
   * Saves or updates a feature flag rule via the storage adapter.
   * Respects global trump rules: if `scope` is non-global and `preventScopedToggleWhenGloballyEnabled`
   * is true while the global rule is enabled, the write is skipped and returns `false`.
   */
  async setFlagRule(
    flagId: TKey | (string & {}),
    rule: Partial<FeatureFlagRule>,
    options?: {
      scope?: string | null;
      merge?: boolean;
      preventWhenGloballyTrumped?: boolean;
    },
  ): Promise<boolean> {
    if (!this.adapter.setFlag) {
      throw new Error(
        'The configured FeatureFlagStorageAdapter does not support setFlag().',
      );
    }

    const scope = options?.scope ?? 'global';
    if (
      options?.preventWhenGloballyTrumped &&
      scope &&
      scope !== 'global' &&
      this.rules[flagId]?.enabled
    ) {
      return false;
    }

    const storageKey = formatScopedFlagKey(flagId, scope, this.scopeSeparator);
    await this.adapter.setFlag(storageKey, rule, { merge: options?.merge });

    // If the adapter does not push real-time updates, update local cache immediately
    if (!this.unsubscribeAdapter) {
      const existing = this.rules[storageKey];
      const merge = options?.merge !== false;
      this.rules[storageKey] =
        merge && existing
          ? {
              ...existing,
              ...rule,
              enabled: rule.enabled ?? existing.enabled ?? false,
            }
          : {
              ...rule,
              enabled: Boolean(rule.enabled),
            };
      this.notifyListeners();
    }

    return true;
  }

  /**
   * Deletes a feature flag rule or scoped override via the storage adapter.
   */
  async deleteFlagRule(
    flagId: TKey | (string & {}),
    scope: string | null | undefined = 'global',
  ): Promise<void> {
    if (!this.adapter.deleteFlag) {
      throw new Error(
        'The configured FeatureFlagStorageAdapter does not support deleteFlag().',
      );
    }

    const storageKey = formatScopedFlagKey(flagId, scope, this.scopeSeparator);
    await this.adapter.deleteFlag(storageKey);

    if (!this.unsubscribeAdapter && storageKey in this.rules) {
      delete this.rules[storageKey];
      this.notifyListeners();
    }
  }

  /**
   * Registers a callback invoked whenever rules or evaluation context change.
   */
  subscribe(listener: FeatureFlagChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
