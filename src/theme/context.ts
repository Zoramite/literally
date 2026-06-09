import { createContext } from '@lit/context';

import type { ThemeInfo } from './theme.mixin';

/** Context for theme. */
export const themeContext = createContext<ThemeInfo | undefined>('theme');
