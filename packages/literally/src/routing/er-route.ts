import { consume } from '@lit/context';
import { LitElement, type PropertyValueMap, html, css } from 'lit';
import { state } from 'lit/decorators.js';

import { routeTrieContext } from './context';
import { type PageRoute } from './route';
import { RouteTrie } from './router';

/**
 * Base component for breaking up routing into multiple files.
 */
export class ERRouteBase extends LitElement {
  static styles = css`
    :host {
      display: none;
    }
  `;
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
