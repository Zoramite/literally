import { LitElement, PropertyValueMap, html } from 'lit';
import { state } from 'lit/decorators.js';
import { consume } from '@lit/context';

import { routeTrieContext } from './context';
import { RouteTrie } from './router';
import { type PageRoute } from './router-mixin';

/**
 * Base component for breaking up routing into multiple files.
 */
export class ERRouteBase extends LitElement {
  @consume({ context: routeTrieContext, subscribe: true })
  @state()
  routeTrie: RouteTrie<PageRoute> | undefined;

  render() {
    return html``;
  }

  addRoutes() {
    // Subclass should implement to correct add the routes to the
    // route trie.
  }

  /**
   * Watch for an update of the route trie to add the routes.
   */
  protected override async willUpdate(
    changedProperties: PropertyValueMap<this>,
  ) {
    super.updated(changedProperties);

    if (changedProperties.has('routeTrie')) {
      this.addRoutes();
    }
  }
}
