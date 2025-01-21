import { createContext } from '@lit/context';

import { RouteTrie, type RouteTrieMatchValue } from './router';
import { type PageRoute } from './router-mixin';

/** Context for a route trie match. */
export const routeTrieMatchContext = createContext<
  RouteTrieMatchValue<PageRoute> | undefined
>('route-trie-match');

/** Context for a route trie. */
export const routeTrieContext = createContext<RouteTrie<PageRoute> | undefined>(
  'route-trie'
);
