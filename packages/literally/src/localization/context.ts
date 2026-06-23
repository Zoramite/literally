import { createContext } from '@lit/context';

import { type Localization } from './localization';

/** Localization context. */
export const localizationContext = createContext<Localization | undefined>(
  'localization',
);
