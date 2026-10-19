import { createContext } from '@lit/context';

import { type PageRoute } from './route';
import { RouteTrie, type RouteTrieMatchValue } from './router';
import { type RouterInterface } from './router.mixin';

/** Context for a route trie match. */
export const routeTrieMatchContext = createContext<
  RouteTrieMatchValue<PageRoute> | undefined
>('route-trie-match');

/** Context for a route trie. */
export const routeTrieContext = createContext<RouteTrie<PageRoute> | undefined>(
  'route-trie',
);

/** Context for a router element. */
export const routerContext = createContext<RouterInterface | undefined>(
  'router',
);
