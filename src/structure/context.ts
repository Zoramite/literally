import { createContext } from '@lit/context';

import { AppServicesInfo } from './appServices';

/** Context for app services. */
export const appServicesContext = createContext<AppServicesInfo>('appServices');
