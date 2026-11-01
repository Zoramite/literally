import {
  FeatureFlagManager,
  type EffectiveFeatureFlagState,
  type FeatureFlagDefinition,
  type FeatureFlagEvaluationContext,
  type FeatureFlagRule,
} from '@littoral/literally/feature-flags';
import { type Firestore } from 'firebase/firestore';
import { type ReactiveController, type ReactiveControllerHost } from 'lit';

import {
  FirestoreFeatureFlagAdapter,
  type FirestoreFeatureFlagAdapterOptions,
} from './adapter.js';

export interface FirestoreFeatureFlagControllerOptions<
  TKey extends string = string,
> extends Omit<FirestoreFeatureFlagAdapterOptions, 'firestore' | 'namespace'> {
  /**
   * Firestore database instance or reactive getter function.
   */
  firestore?: Firestore | (() => Firestore | null | undefined);

  /**
   * Optional reactive getter or static value for the namespace.
   */
  namespace?: string | (() => string | undefined);

  /**
   * Optional catalog of known feature definitions.
   */
  definitions?: ReadonlyArray<FeatureFlagDefinition<TKey>>;

  /**
   * Optional baseline defaults by flag key.
   */
  defaults?: Partial<Record<TKey, boolean>>;

  /**
   * Evaluation context (or reactive getter returning one) representing the current user,
   * scope/tenant, and attributes.
   */
  context?:
    | FeatureFlagEvaluationContext
    | (() => FeatureFlagEvaluationContext | undefined);

  /**
   * Separator between scope prefix and flag ID in storage keys (defaults to `'__'`).
   */
  scopeSeparator?: string;

  /**
   * Callback invoked when a Firestore subscription error occurs.
   */
  onError?: (error: Error) => void;

  /**
   * Whether to automatically subscribe when the host connects. Defaults to `true`.
   */
  autoStart?: boolean;
}

/**
 * A Lit Reactive Controller that connects a `FeatureFlagManager` directly to a
 * namespaced Firestore collection via `FirestoreFeatureFlagAdapter`.
 *
 * Automatically manages real-time `onSnapshot` subscriptions on `hostConnected` /
 * `hostDisconnected` and re-evaluates flags when reactive context properties change.
 */
export class FirestoreFeatureFlagController<
  TKey extends string = string,
> implements ReactiveController {
  protected host: ReactiveControllerHost;
  protected options: FirestoreFeatureFlagControllerOptions<TKey>;
  protected isHostConnected = false;
  protected activeDb: Firestore | null = null;
  protected activeNamespace: string | undefined = undefined;

  /**
   * Underlying `FeatureFlagManager` instance. Can be provided via `@provide({ context: featureFlagContext })`
   * so child `<er-feature-flag>` elements or `FeatureFlagController` instances share the same state.
   */
  readonly manager: FeatureFlagManager<TKey>;

  /**
   * Whether the controller is waiting for the initial Firestore snapshot.
   */
  loading = true;

  /**
   * Any error encountered during the Firestore subscription.
   */
  error?: Error = undefined;

  constructor(
    host: ReactiveControllerHost,
    options: FirestoreFeatureFlagControllerOptions<TKey> = {},
  ) {
    this.host = host;
    this.options = options;
    this.manager = new FeatureFlagManager<TKey>({
      definitions: options.definitions,
      defaults: options.defaults,
      context: this.resolveContext(),
      scopeSeparator: options.scopeSeparator,
    });

    this.manager.subscribe(() => {
      this.loading = !this.manager.loaded;
      this.host.requestUpdate();
    });

    host.addController(this);
  }

  /**
   * Evaluated boolean map for all registered and stored feature flags.
   */
  get flags(): Record<TKey, boolean> {
    return this.manager.evaluateAll(this.resolveContext());
  }

  /**
   * Raw feature flag rules currently synced from Firestore.
   */
  get rules(): Record<string, FeatureFlagRule> {
    return this.manager.getRules();
  }

  hostConnected(): void {
    this.isHostConnected = true;
    this.syncManagerContext();
    if (this.options.autoStart !== false) {
      this.subscribe();
    }
  }

  hostDisconnected(): void {
    this.isHostConnected = false;
    this.unsubscribe();
  }

  hostUpdate(): void {
    this.syncManagerContext();
    const nextDb = this.resolveFirestore();
    const nextNamespace = this.resolveNamespace();
    if (nextDb !== this.activeDb || nextNamespace !== this.activeNamespace) {
      if (this.isHostConnected && this.options.autoStart !== false) {
        this.subscribe();
      } else {
        this.activeDb = nextDb;
        this.activeNamespace = nextNamespace;
      }
    }
  }

  /**
   * Subscribes to the configured Firestore feature flags collection.
   */
  subscribe(): void {
    this.unsubscribe();
    const db = this.resolveFirestore();
    const namespace = this.resolveNamespace();
    this.activeDb = db;
    this.activeNamespace = namespace;

    if (!db) {
      this.loading = false;
      this.error = undefined;
      this.host.requestUpdate();
      return;
    }

    this.loading = true;
    this.error = undefined;
    this.host.requestUpdate();

    const adapter = new FirestoreFeatureFlagAdapter({
      firestore: db,
      namespace,
      collectionName: this.options.collectionName,
      namespaceStrategy: this.options.namespaceStrategy,
      parentCollection: this.options.parentCollection,
      namespaceSeparator: this.options.namespaceSeparator,
    });

    this.manager.setAdapter(adapter);
    this.manager.startListening((err) => {
      this.error = err;
      this.loading = false;
      this.options.onError?.(err);
      this.host.requestUpdate();
    });
  }

  /**
   * Stops the active Firestore listener.
   */
  unsubscribe(): void {
    this.manager.stopListening();
  }

  /**
   * Evaluates whether a specific feature flag is enabled.
   */
  isEnabled(
    flagKey: TKey | (string & {}),
    contextOverride?: FeatureFlagEvaluationContext,
  ): boolean {
    const baseContext = this.resolveContext();
    const merged =
      baseContext && contextOverride
        ? {
            ...baseContext,
            ...contextOverride,
            attributes:
              contextOverride.attributes !== undefined
                ? {
                    ...baseContext.attributes,
                    ...contextOverride.attributes,
                  }
                : baseContext.attributes,
          }
        : (contextOverride ?? baseContext);

    return this.manager.isEnabled(flagKey, merged);
  }

  /**
   * Resolves the effective rule configuration for a flag in a given scope.
   */
  getEffectiveState(
    flagId: TKey | (string & {}),
    scope: string | null | undefined = 'global',
  ): EffectiveFeatureFlagState {
    return this.manager.getEffectiveState(flagId, scope);
  }

  /**
   * Saves or updates a feature flag rule in Firestore.
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
    return this.manager.setFlagRule(flagId, rule, options);
  }

  /**
   * Deletes a feature flag rule or scoped override from Firestore.
   */
  async deleteFlagRule(
    flagId: TKey | (string & {}),
    scope: string | null | undefined = 'global',
  ): Promise<void> {
    return this.manager.deleteFlagRule(flagId, scope);
  }

  protected syncManagerContext(): void {
    const resolved = this.resolveContext();
    if (resolved) {
      this.manager.setContext(resolved);
    }
  }

  protected resolveFirestore(): Firestore | null {
    if (typeof this.options.firestore === 'function') {
      return this.options.firestore() ?? null;
    }
    return this.options.firestore ?? null;
  }

  protected resolveNamespace(): string | undefined {
    if (typeof this.options.namespace === 'function') {
      return this.options.namespace();
    }
    return this.options.namespace;
  }

  protected resolveContext(): FeatureFlagEvaluationContext | undefined {
    if (typeof this.options.context === 'function') {
      return this.options.context();
    }
    return this.options.context;
  }
}
