import { createContext } from '@lit/context';

import { type FeatureFlagManager } from './manager';

/**
 * Lit Context for providing and consuming a `FeatureFlagManager` instance across a component tree.
 */
export const featureFlagContext = createContext<
  FeatureFlagManager<any> | undefined
>('feature-flags');
