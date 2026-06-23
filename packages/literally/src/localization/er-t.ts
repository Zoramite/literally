import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { localizationContext } from './context';
import { type Localization } from './localization';

/**
 * Translation component.
 * Declaratively consumes the localization context and updates the translated string
 * automatically when the localization changes.
 */
@customElement('er-t')
export class ERT extends LitElement {
  @consume({ context: localizationContext, subscribe: true })
  private localization?: Localization;

  @property({ type: String })
  key = '';

  @property({ type: Object })
  params?: Record<string, string | number>;

  // Render to light DOM to behave like a standard text container.
  createRenderRoot() {
    return this;
  }

  render() {
    if (!this.localization) {
      return html``;
    }
    return html`${this.localization.t(this.key, this.params)}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'er-t': ERT;
  }
}
