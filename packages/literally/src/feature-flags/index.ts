export { featureFlagContext } from './context';
export { ErFeatureFlag } from './er-feature-flag';
export {
  DEFAULT_SCOPE_SEPARATOR,
  evaluateAllFlags,
  evaluateSingleFlag,
  formatScopedFlagKey,
  matchesRuleTargeting,
  parseScopedFlagKey,
  resolveEffectiveFlagState,
} from './evaluator';
export {
  FeatureFlagController,
  type FeatureFlagControllerOptions,
} from './feature-flag.controller';
export {
  computeRolloutHash,
  isWithinRolloutPercentage,
  sha256FirstUInt32BE,
} from './hash';
export {
  FeatureFlagManager,
  InMemoryFeatureFlagAdapter,
  type FeatureFlagChangeListener,
  type FeatureFlagManagerOptions,
} from './manager';
export {
  type EffectiveFeatureFlagState,
  type FeatureFlagDefinition,
  type FeatureFlagEvaluationContext,
  type FeatureFlagRule,
  type FeatureFlagStorageAdapter,
  type FeatureFlagStoreListener,
} from './models';
