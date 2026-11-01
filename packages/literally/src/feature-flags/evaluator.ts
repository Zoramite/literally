import type {
  EffectiveFeatureFlagState,
  FeatureFlagDefinition,
  FeatureFlagEvaluationContext,
  FeatureFlagRule,
} from './models';

import { isWithinRolloutPercentage } from './hash';

/** Default separator used for scope-prefixed storage keys (e.g. `wilderland__classroom_freeze`). */
export const DEFAULT_SCOPE_SEPARATOR = '__';

/**
 * Builds a storage key for a feature flag and an optional scope.
 * Returns `flagId` when `scope` is omitted, empty, or `'global'`.
 */
export function formatScopedFlagKey(
  flagId: string,
  scope?: string | null,
  scopeSeparator = DEFAULT_SCOPE_SEPARATOR,
): string {
  if (scope && scope !== 'global') {
    return `${scope}${scopeSeparator}${flagId}`;
  }
  return flagId;
}

/**
 * Parses a storage key into its optional scope and base `flagId`.
 */
export function parseScopedFlagKey(
  storageKey: string,
  scopeSeparator = DEFAULT_SCOPE_SEPARATOR,
): { scope: string | null; flagId: string } {
  const idx = storageKey.indexOf(scopeSeparator);
  if (idx > 0) {
    return {
      scope: storageKey.slice(0, idx),
      flagId: storageKey.slice(idx + scopeSeparator.length),
    };
  }
  return { scope: null, flagId: storageKey };
}

/**
 * Checks whether a single `FeatureFlagRule` matches the provided evaluation context.
 */
export function matchesRuleTargeting(
  rule: FeatureFlagRule,
  context: FeatureFlagEvaluationContext,
  flagKey?: string,
): boolean {
  if (rule.enabled) {
    return true;
  }

  const normalizeId = context.normalizeId !== false;
  const rawId = context.id?.trim() ?? '';
  const evaluatedId = normalizeId ? rawId.toLowerCase() : rawId;

  // 1. Target IDs / Emails allowlist
  if (evaluatedId) {
    const allTargetIds = [
      ...(rule.targetIds ?? []),
      ...(rule.targetEmails ?? []),
    ];
    if (
      allTargetIds.some(
        (target) =>
          (normalizeId ? target.trim().toLowerCase() : target.trim()) ===
          evaluatedId,
      )
    ) {
      return true;
    }
  }

  // 2. Target Scopes / Tenants allowlist
  const scope = context.scope?.trim();
  if (scope) {
    const allTargetScopes = [
      ...(rule.targetScopes ?? []),
      ...(rule.targetTenants ?? []),
    ];
    if (allTargetScopes.includes(scope)) {
      return true;
    }
  }

  // 3. Target Attributes (generic key-value arrays)
  const contextAttrs = context.attributes;
  if (contextAttrs && rule.targetAttributes) {
    for (const [attrKey, allowedValues] of Object.entries(
      rule.targetAttributes,
    )) {
      if (!Array.isArray(allowedValues) || allowedValues.length === 0) {
        continue;
      }
      const userAttrValue = contextAttrs[attrKey];
      if (userAttrValue === undefined || userAttrValue === null) {
        continue;
      }
      if (Array.isArray(userAttrValue)) {
        if (userAttrValue.some((val) => allowedValues.includes(val))) {
          return true;
        }
      } else if (allowedValues.includes(userAttrValue)) {
        return true;
      }
    }
  }

  // 4. Deterministic Percentage Rollout
  if (
    typeof rule.rolloutPercentage === 'number' &&
    rule.rolloutPercentage > 0 &&
    evaluatedId &&
    flagKey
  ) {
    if (
      isWithinRolloutPercentage(
        evaluatedId,
        flagKey,
        rule.rolloutPercentage,
        normalizeId,
      )
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Evaluates a single feature flag across global and scoped rules with standard precedence:
 * 1. Global unconditional launch (`globalRule.enabled === true`) trumps all scoped overrides.
 * 2. Scoped override rule (`${scope}__${flagKey}`) if present for the active `context.scope`.
 * 3. Global targeting rules (`targetIds`, `targetScopes`, `targetAttributes`, `rolloutPercentage`).
 * 4. Baseline default (`defaultEnabled`, which defaults to `false`).
 */
export function evaluateSingleFlag(
  flagKey: string,
  rules: Record<string, FeatureFlagRule>,
  context: FeatureFlagEvaluationContext = {},
  options?: {
    defaultEnabled?: boolean;
    scopeSeparator?: string;
  },
): boolean {
  const scopeSeparator = options?.scopeSeparator ?? DEFAULT_SCOPE_SEPARATOR;
  const globalRule = rules[flagKey];

  // 1. Global unconditional enablement trumps all scoped configs
  if (globalRule?.enabled) {
    return true;
  }

  // 2. Scoped override rule (allows launching or targeting per-scope before global launch)
  const scope = context.scope?.trim();
  if (scope && scope !== 'global') {
    const scopedKey = formatScopedFlagKey(flagKey, scope, scopeSeparator);
    const scopedRule = rules[scopedKey];
    if (scopedRule && matchesRuleTargeting(scopedRule, context, flagKey)) {
      return true;
    }
  }

  // 3. Global targeting rules
  if (globalRule && matchesRuleTargeting(globalRule, context, flagKey)) {
    return true;
  }

  // 4. Baseline default
  return Boolean(options?.defaultEnabled);
}

/**
 * Evaluates all known and stored feature flags for a given context.
 */
export function evaluateAllFlags<TKey extends string = string>(
  rules: Record<string, FeatureFlagRule>,
  context: FeatureFlagEvaluationContext = {},
  options?: {
    definitions?: ReadonlyArray<FeatureFlagDefinition<TKey>>;
    defaults?: Partial<Record<TKey, boolean>>;
    scopeSeparator?: string;
  },
): Record<TKey, boolean> {
  const scopeSeparator = options?.scopeSeparator ?? DEFAULT_SCOPE_SEPARATOR;
  const defaultMap: Record<string, boolean> = {
    ...options?.defaults,
  };

  const keys = new Set<string>(Object.keys(defaultMap));

  if (options?.definitions) {
    for (const def of options.definitions) {
      keys.add(def.id);
      if (def.defaultEnabled !== undefined && !(def.id in defaultMap)) {
        defaultMap[def.id] = def.defaultEnabled;
      }
    }
  }

  for (const storageKey of Object.keys(rules)) {
    const { flagId } = parseScopedFlagKey(storageKey, scopeSeparator);
    keys.add(flagId);
  }

  const result: Record<string, boolean> = {};
  for (const key of keys) {
    result[key] = evaluateSingleFlag(key, rules, context, {
      defaultEnabled: defaultMap[key] ?? false,
      scopeSeparator,
    });
  }

  return result as Record<TKey, boolean>;
}

/**
 * Resolves the effective rule configuration for a feature flag in a given scope,
 * including whether a scoped override exists and whether global launch trumps it.
 */
export function resolveEffectiveFlagState(
  flagId: string,
  rules: Record<string, FeatureFlagRule>,
  scope: string | null | undefined = 'global',
  options?: {
    defaultEnabled?: boolean;
    scopeSeparator?: string;
  },
): EffectiveFeatureFlagState {
  const scopeSeparator = options?.scopeSeparator ?? DEFAULT_SCOPE_SEPARATOR;
  const defaultRule: FeatureFlagRule = {
    enabled: Boolean(options?.defaultEnabled),
  };
  const globalRule = rules[flagId] ?? defaultRule;
  const isGlobalActive = Boolean(globalRule.enabled);

  if (scope && scope !== 'global') {
    const overrideKey = formatScopedFlagKey(flagId, scope, scopeSeparator);
    const scopedRule = rules[overrideKey];

    if (isGlobalActive) {
      return {
        rule: {
          ...(scopedRule ?? globalRule),
          enabled: true,
        },
        isScopedOverride: Boolean(scopedRule),
        storageKey: overrideKey,
        isGloballyTrumped: true,
      };
    }

    if (scopedRule) {
      return {
        rule: scopedRule,
        isScopedOverride: true,
        storageKey: overrideKey,
        isGloballyTrumped: false,
      };
    }
  }

  return {
    rule: globalRule,
    isScopedOverride: false,
    storageKey: flagId,
    isGloballyTrumped: false,
  };
}
