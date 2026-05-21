import { consume } from '@lit/context';
import { LitElement } from 'lit';
import { state } from 'lit/decorators.js';

import { Constructor } from '../mixins/mixin';
import { AppServicesInfo } from './appServices';
import { appServicesContext } from './context';

export interface AppServicesConsumerInterface {
  services: AppServicesInfo | undefined;
}

/**
 * Mixin for referencing the app services within a component using the context.
 */
export const AppServicesConsumerMixin = <T extends Constructor<LitElement>>(
  superClass: T,
) => {
  class AppServicesElement extends superClass {
    static styles = [(superClass as unknown as typeof LitElement).styles ?? []];

    @consume({ context: appServicesContext, subscribe: true })
    @state()
    services: AppServicesInfo | undefined;
  }
  return AppServicesElement as Constructor<AppServicesConsumerInterface> & T;
};
