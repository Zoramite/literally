import { consume } from '@lit/context';
import { LitElement } from 'lit';
import { state } from 'lit/decorators.js';

import { type Constructor } from '../mixins/mixin';
import { localizationContext } from './context';
import { type Localization } from './localization';

export interface LocalizationConsumerInterface {
  localization: Localization | undefined;
  t(key: string, variables?: Record<string, string | number>): string;
  formatNumber(
    value: number,
    type?: 'number' | 'currency' | 'percent' | (string & {}),
  ): string;
}

/**
 * Mixin for consuming the app-level localization context and translating
 * strings programmatically (for attributes, labels, page titles, etc.).
 */
export const LocalizationConsumerMixin = <T extends Constructor<LitElement>>(
  superClass: T,
) => {
  class LocalizationConsumerElement extends superClass {
    static styles = [(superClass as unknown as typeof LitElement).styles ?? []];

    @consume({ context: localizationContext, subscribe: true })
    @state()
    localization: Localization | undefined;

    t(key: string, variables?: Record<string, string | number>): string {
      if (!this.localization) {
        return '';
      }
      return this.localization.t(key, variables);
    }

    formatNumber(
      value: number,
      type?: 'number' | 'currency' | 'percent' | (string & {}),
    ): string {
      if (!this.localization) {
        return String(value);
      }
      return this.localization.formatNumber(value, type);
    }
  }

  return LocalizationConsumerElement as Constructor<LocalizationConsumerInterface> &
    T;
};
