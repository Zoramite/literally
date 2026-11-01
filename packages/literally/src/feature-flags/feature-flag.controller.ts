import { type ReactiveController, type ReactiveControllerHost } from 'lit';

import type { FeatureFlagManager } from './manager';
import type {
  EffectiveFeatureFlagState,
  FeatureFlagEvaluationContext,
  FeatureFlagRule,
} from './models';

export interface FeatureFlagControllerOptions<TKey extends string = string> {
  /**
   * The `FeatureFlagManager` instance to observe, or a reactive getter function returning it.
   */
  manager?:
    | FeatureFlagManager<TKey>
    | (() => FeatureFlagManager<TKey> | null | undefined);
  /**
   * Optional per-controller evaluation context override (or reactive getter function)
   * merged with the manager's default context when evaluating flags.
   */
  context?:
    | FeatureFlagEvaluationContext
    | (() => FeatureFlagEvaluationContext | undefined);
  /**
   * Whether the controller should automatically call `manager.startListening()` when connected
   * if the manager has not loaded rules yet. Defaults to `false` (assumes manager lifecycle
   * is controlled by the app root or adapter).
   */
  autoStartListening?: boolean;
}

/**
 * A Lit Reactive Controller that subscribes to a `FeatureFlagManager` and automatically
 * triggers `host.requestUpdate()` whenever feature flag rules or evaluation contexts change.
 */
export class FeatureFlagController<
  TKey extends string = string,
> implements ReactiveController {
  protected host: ReactiveControllerHost;
  protected options: FeatureFlagControllerOptions<TKey>;
  protected unsubscribeManager?: () => void;
  protected unsubscribeAdapter?: () => void;
  protected currentManager?: FeatureFlagManager<TKey> | null;
  protected isConnected = false;

  constructor(
    host: ReactiveControllerHost,
    options: FeatureFlagControllerOptions<TKey> = {},
  ) {
    this.host = host;
    this.options = options;
    this.currentManager = this.resolveManager();
    host.addController(this);
  }

  /** Whether the underlying `FeatureFlagManager` has loaded its initial rules. */
  get loaded(): boolean {
    return Boolean(this.resolveManager()?.loaded);
  }

  /** Returns the evaluated boolean state of all known and stored flags. */
  get flags(): Record<TKey, boolean> {
    const manager = this.resolveManager();
    if (!manager) {
      return {} as Record<TKey, boolean>;
    }
    return manager.evaluateAll(this.resolveContext());
  }

  /** Returns the raw rule map currently held by the manager. */
  get rules(): Record<string, FeatureFlagRule> {
    return this.resolveManager()?.getRules() ?? {};
  }

  hostConnected(): void {
    this.isConnected = true;
    this.attachToManager(this.resolveManager());
  }

  hostDisconnected(): void {
    this.isConnected = false;
    this.detachFromManager();
  }

  hostUpdate(): void {
    const nextManager = this.resolveManager();
    if (nextManager !== this.currentManager) {
      this.currentManager = nextManager;
      if (this.isConnected) {
        this.attachToManager(nextManager);
      }
    }
  }

  /**
   * Manually sets or replaces the `FeatureFlagManager` instance observed by this controller.
   */
  setManager(manager: FeatureFlagManager<TKey> | null | undefined): void {
    this.options = { ...this.options, manager: manager ?? undefined };
    this.currentManager = manager;
    if (this.isConnected) {
      this.attachToManager(manager ?? null);
    }
    this.host.requestUpdate();
  }

  /**
   * Evaluates whether a specific feature flag is enabled for the active context.
   */
  isEnabled(
    flagKey: TKey | (string & {}),
    contextOverride?: FeatureFlagEvaluationContext,
  ): boolean {
    const manager = this.resolveManager();
    if (!manager) {
      return false;
    }
    const baseOverride = this.resolveContext();
    const mergedOverride =
      baseOverride && contextOverride
        ? {
            ...baseOverride,
            ...contextOverride,
            attributes:
              contextOverride.attributes !== undefined
                ? {
                    ...baseOverride.attributes,
                    ...contextOverride.attributes,
                  }
                : baseOverride.attributes,
          }
        : (contextOverride ?? baseOverride);

    return manager.isEnabled(flagKey, mergedOverride);
  }

  /**
   * Resolves the effective rule state for a flag in a given scope (defaults to `'global'`).
   */
  getEffectiveState(
    flagId: TKey | (string & {}),
    scope: string | null | undefined = 'global',
  ): EffectiveFeatureFlagState | undefined {
    return this.resolveManager()?.getEffectiveState(flagId, scope);
  }

  protected attachToManager(manager: FeatureFlagManager<TKey> | null): void {
    this.detachFromManager();
    this.currentManager = manager;
    if (!manager) {
      return;
    }

    if (this.options.autoStartListening && !manager.loaded) {
      this.unsubscribeAdapter = manager.startListening();
    }

    this.unsubscribeManager = manager.subscribe(() => {
      this.host.requestUpdate();
    });
  }

  protected detachFromManager(): void {
    if (this.unsubscribeManager) {
      this.unsubscribeManager();
      this.unsubscribeManager = undefined;
    }
    if (this.unsubscribeAdapter) {
      this.unsubscribeAdapter();
      this.unsubscribeAdapter = undefined;
    }
  }

  protected resolveManager(): FeatureFlagManager<TKey> | null {
    if (typeof this.options.manager === 'function') {
      return this.options.manager() ?? null;
    }
    return this.options.manager ?? null;
  }

  protected resolveContext(): FeatureFlagEvaluationContext | undefined {
    if (typeof this.options.context === 'function') {
      return this.options.context();
    }
    return this.options.context;
  }
}
