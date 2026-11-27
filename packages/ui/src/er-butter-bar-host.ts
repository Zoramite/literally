import {
  PROCESSING_START_EVENT_NAME,
  PROCESSING_STOP_EVENT_NAME,
  type ProcessingEvent,
} from '@littoral/literally/mixins/processing.mixin';
import { mobile, print } from '@littoral/literally/structure/devices';
import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import {
  ButterBarManager,
  type ButterBarNotification,
  butterBarManager,
} from './butter-bar-manager';
import './er-butter-bar';

/**
 * App-level host that subscribes to a `ButterBarManager` and renders active
 * `<er-butter-bar>` notifications in a Top Layer stack.
 */
@customElement('er-butter-bar-host')
export class ErButterBarHost extends LitElement {
  static styles = [
    css`
      :host {
        display: contents;
      }

      .stack {
        position: fixed;
        inset: auto;
        left: 50%;
        bottom: var(--er-butter-bar-offset, var(--space-large, 20px));
        transform: translateX(-50%);
        z-index: 1200;
        display: none;
        flex-direction: column;
        gap: var(--space-small, 8px);
        width: min(560px, calc(100vw - 2 * var(--space-medium, 16px)));
        margin: 0;
        padding: 0;
        border: 0;
        background: transparent;
        overflow: visible;
        pointer-events: none;
      }

      :host([position='top']) .stack {
        top: var(--er-butter-bar-offset, var(--space-large, 20px));
        bottom: auto;
      }

      .stack[popover]:is(:popover-open, .\:popover-open),
      .stack.fallback-open {
        display: flex;
      }

      er-butter-bar {
        pointer-events: auto;
        width: 100%;
      }

      ${mobile.mediaQuery} {
        .stack {
          bottom: var(--space-small, 12px);
          width: calc(100vw - 2 * var(--space-small, 12px));
        }

        :host([position='top']) .stack {
          top: var(--space-small, 12px);
          bottom: auto;
        }
      }

      ${print.mediaQuery} {
        .stack {
          display: none !important;
        }
      }
    `,
  ];

  /** Manager instance to subscribe to (defaults to shared `butterBarManager`). */
  @property({ attribute: false })
  manager: ButterBarManager = butterBarManager;

  /** Placement of the notification stack (`'bottom'` or `'top'`). */
  @property({ type: String, reflect: true })
  position: 'bottom' | 'top' = 'bottom';

  /** Accessible label for the notifications landmark region. */
  @property({ type: String, attribute: 'region-label' })
  regionLabel = 'Notifications';

  /**
   * When true, listens on `window` for `ProcessingMixin` `processing-start` and
   * `processing-stop` events and surfaces a `progress` butter bar automatically.
   */
  @property({ type: Boolean, attribute: 'listen-to-processing' })
  listenToProcessing = false;

  @state()
  private notifications: ButterBarNotification[] = [];

  @query('.stack')
  private stackEl?: HTMLElement;

  private unsubscribe: (() => void) | null = null;
  private subscribedManager: ButterBarManager | null = null;

  connectedCallback(): void {
    super.connectedCallback();
    this.syncSubscription();
    if (typeof window !== 'undefined') {
      window.addEventListener(
        PROCESSING_START_EVENT_NAME,
        this.handleProcessingStart as EventListener,
      );
      window.addEventListener(
        PROCESSING_STOP_EVENT_NAME,
        this.handleProcessingStop as EventListener,
      );
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.subscribedManager = null;
    if (typeof window !== 'undefined') {
      window.removeEventListener(
        PROCESSING_START_EVENT_NAME,
        this.handleProcessingStart as EventListener,
      );
      window.removeEventListener(
        PROCESSING_STOP_EVENT_NAME,
        this.handleProcessingStop as EventListener,
      );
    }
  }

  protected willUpdate(): void {
    this.syncSubscription();
  }

  protected updated(): void {
    const stack = this.stackEl;
    if (!stack) return;

    const hasItems = this.notifications.length > 0;
    if (typeof stack.showPopover === 'function') {
      stack.classList.remove('fallback-open');
      try {
        if (hasItems && !stack.matches(':popover-open')) {
          stack.showPopover();
        } else if (!hasItems && stack.matches(':popover-open')) {
          stack.hidePopover();
        }
      } catch {
        stack.classList.toggle('fallback-open', hasItems);
      }
    } else {
      stack.classList.toggle('fallback-open', hasItems);
    }
  }

  private syncSubscription(): void {
    if (this.subscribedManager === this.manager) return;
    this.unsubscribe?.();
    this.subscribedManager = this.manager;
    this.unsubscribe = this.manager.subscribe((items) => {
      this.notifications = items;
    });
  }

  private handleProcessingStart = (
    event: CustomEvent<ProcessingEvent>,
  ): void => {
    if (!this.listenToProcessing) return;
    const key = event.detail?.key ?? '_default_';
    this.manager.show({
      id: `processing:${key}`,
      type: 'progress',
      message: key === '_default_' ? 'Working…' : `Processing ${key}…`,
      dismissible: false,
      autoDismissMs: 0,
    });
  };

  private handleProcessingStop = (
    event: CustomEvent<ProcessingEvent>,
  ): void => {
    if (!this.listenToProcessing) return;
    const key = event.detail?.key ?? '_default_';
    this.manager.dismiss(`processing:${key}`);
  };

  render() {
    return html`
      <div
        class="stack"
        popover="manual"
        role="region"
        aria-label=${this.regionLabel}
      >
        ${this.notifications.map(
          (item) => html`
            <er-butter-bar
              open
              position="inline"
              type=${item.type}
              message=${item.message}
              detail=${item.detail ?? nothing}
              ?dismissible=${item.dismissible}
              auto-dismiss-ms=${item.autoDismissMs}
              @dismiss=${() => this.manager.dismiss(item.id)}
            ></er-butter-bar>
          `,
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'er-butter-bar-host': ErButterBarHost;
  }
}
