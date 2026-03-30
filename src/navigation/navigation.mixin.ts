import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { Constructor } from '../mixins/mixin';
import { navigateToPathEvent } from './navigation';

type NavigationCallback =
  | ((evt: MouseEvent) => void)
  | ((evt: MouseEvent) => Promise<void>);

export interface NavigationInterface {
  isDisabled: boolean;
  path: string | undefined;
  rootPath: string | undefined;
  openInNewWindow: boolean | undefined;
  navigationCallback?: NavigationCallback;
}

/**
 * Mixin for adding navigation handling to a component.
 */
export const NavigationMixin = <T extends Constructor<LitElement>>(
  superClass: T,
) => {
  class NavigationElement extends superClass {
    static styles = [(superClass as unknown as typeof LitElement).styles ?? []];

    @property({ type: Boolean, attribute: 'disabled', reflect: true })
    accessor isDisabled = false;

    @property({ reflect: true })
    accessor path: string | undefined = undefined;

    @property({ reflect: true })
    accessor rootPath: string | undefined = undefined;

    @property({ type: Boolean, attribute: 'open-new', reflect: true })
    accessor openInNewWindow = false;

    // Allow for a callback if not using the path.
    @property({ attribute: false })
    accessor navigationCallback: NavigationCallback | undefined;

    connectedCallback(): void {
      super.connectedCallback();

      this.addEventListener('click', (evt: MouseEvent) => {
        if (this.isDisabled) {
          return;
        }

        if (this.navigationCallback) {
          this.navigationCallback(evt);
          return;
        }

        // This doesn't have any navigation, ignore it.
        if (this.path === undefined && this.rootPath === undefined) {
          return;
        }

        this.dispatchEvent(
          navigateToPathEvent(
            this.path ?? '',
            this.rootPath,
            evt.metaKey || evt.ctrlKey,
          ),
        );
      });
    }
  }
  return NavigationElement as Constructor<NavigationInterface> & T;
};
