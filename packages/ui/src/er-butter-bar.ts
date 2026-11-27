import { mobile, print } from '@littoral/literally/structure/devices';
import { LitElement, type PropertyValues, css, html, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import './er-icon';

export type ButterBarType =
  | 'info'
  | 'progress'
  | 'success'
  | 'warning'
  | 'error';

export type ButterBarPosition = 'bottom' | 'top' | 'inline';

const DEFAULT_ICONS: Record<Exclude<ButterBarType, 'progress'>, string> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  error: 'error',
};

/**
 * Non-blocking notification bar ("butter bar") for surfacing in-progress API
 * operations, completion confirmations, warnings, and errors.
 *
 * @slot - Custom message content (used when `message` is empty or alongside it).
 * @slot icon - Custom leading icon or indicator.
 * @slot actions - Optional action controls (e.g. Retry, View, Undo).
 *
 * @fires dismiss - Fired when the butter bar is dismissed by the user or auto-dismiss timer.
 * @fires opened - Fired when the butter bar opens.
 * @fires closed - Fired when the butter bar closes.
 */
@customElement('er-butter-bar')
export class ErButterBar extends LitElement {
  static styles = [
    css`
      :host {
        --_bg: var(
          --er-butter-bar-background-color,
          var(--md-sys-color-inverse-surface, #2f3036)
        );
        --_fg: var(
          --er-butter-bar-color,
          var(--md-sys-color-inverse-on-surface, #f1f0f7)
        );
        --_border: var(--er-butter-bar-border-color, transparent);
        --_accent: var(
          --er-butter-bar-accent-color,
          var(--md-sys-color-inverse-primary, #b1c5ff)
        );

        display: block;
        box-sizing: border-box;
      }

      :host([type='info']) {
        --_bg: var(
          --er-butter-bar-background-color,
          var(--md-sys-color-primary-container, #d9e2ff)
        );
        --_fg: var(
          --er-butter-bar-color,
          var(--md-sys-color-on-primary-container, #001946)
        );
        --_border: var(
          --er-butter-bar-border-color,
          var(--md-sys-color-outline-variant, #c5c6d0)
        );
        --_accent: var(
          --er-butter-bar-accent-color,
          var(--md-sys-color-primary, #475d92)
        );
      }

      :host([type='progress']) {
        --_bg: var(
          --er-butter-bar-background-color,
          var(--md-sys-color-surface-container-high, #eceef4)
        );
        --_fg: var(
          --er-butter-bar-color,
          var(--md-sys-color-on-surface, #1a1b21)
        );
        --_border: var(
          --er-butter-bar-border-color,
          var(--md-sys-color-outline-variant, #c5c6d0)
        );
        --_accent: var(
          --er-butter-bar-accent-color,
          var(--md-sys-color-primary, #475d92)
        );
      }

      :host([type='success']) {
        --_bg: var(
          --er-butter-bar-background-color,
          var(--er-sys-color-success-container, #dcfce7)
        );
        --_fg: var(
          --er-butter-bar-color,
          var(--er-sys-color-on-success-container, #14532d)
        );
        --_border: var(
          --er-butter-bar-border-color,
          var(--er-sys-color-success-outline, #86efac)
        );
        --_accent: var(
          --er-butter-bar-accent-color,
          var(--er-sys-color-success, #16a34a)
        );
      }

      :host([type='warning']) {
        --_bg: var(
          --er-butter-bar-background-color,
          var(--er-sys-color-warning-container, #fef3c7)
        );
        --_fg: var(
          --er-butter-bar-color,
          var(--er-sys-color-on-warning-container, #78350f)
        );
        --_border: var(
          --er-butter-bar-border-color,
          var(--er-sys-color-warning-outline, #fcd34d)
        );
        --_accent: var(
          --er-butter-bar-accent-color,
          var(--er-sys-color-warning, #d97706)
        );
      }

      :host([type='error']) {
        --_bg: var(
          --er-butter-bar-background-color,
          var(--md-sys-color-error-container, #ffdad6)
        );
        --_fg: var(
          --er-butter-bar-color,
          var(--md-sys-color-on-error-container, #410002)
        );
        --_border: var(
          --er-butter-bar-border-color,
          var(--md-sys-color-error, #ba1a1a)
        );
        --_accent: var(
          --er-butter-bar-accent-color,
          var(--md-sys-color-error, #ba1a1a)
        );
      }

      .region {
        display: contents;
      }

      .bar {
        box-sizing: border-box;
        display: none;
        align-items: center;
        gap: var(--space-small, 10px);
        background-color: var(--_bg);
        color: var(--_fg);
        border: 1px solid var(--_border);
        border-radius: var(--er-butter-bar-border-radius, 12px);
        padding: var(--space-small, 10px) var(--space-medium, 16px);
        box-shadow: var(--er-butter-bar-shadow, 0 6px 24px rgba(0, 0, 0, 0.16));
        max-width: var(
          --er-butter-bar-max-width,
          min(560px, calc(100vw - 2 * var(--space-medium, 16px)))
        );
        width: fit-content;
        min-width: min(280px, calc(100vw - 2 * var(--space-medium, 16px)));
        font-family: inherit;
        font-size: var(--er-sys-body-font-size-small, 0.9rem);
        line-height: 1.4;
        position: relative;
        overflow: hidden;
        opacity: 0;
        transform: translateY(12px);
        transition:
          opacity 0.2s ease,
          transform 0.2s ease,
          display 0.2s ease;
        transition-behavior: allow-discrete;
      }

      :host([position='top']) .bar {
        transform: translateY(-12px);
      }

      :host([position='inline']) .bar {
        width: 100%;
        max-width: 100%;
        box-shadow: none;
        transform: none;
      }

      /* Popover top-layer placement */
      .bar[popover] {
        position: fixed;
        inset: auto;
        margin: 0 auto;
        left: 0;
        right: 0;
        bottom: var(--er-butter-bar-offset, var(--space-large, 20px));
        z-index: 1100;
      }

      :host([position='top']) .bar[popover] {
        top: var(--er-butter-bar-offset, var(--space-large, 20px));
        bottom: auto;
      }

      /* Open state: supports native :popover-open, polyfill .:popover-open, and inline/jsdom fallback */
      .bar[popover]:is(:popover-open, .\:popover-open),
      :host([open][position='inline']) .bar,
      :host([open]) .bar.fallback-open {
        display: flex;
        opacity: 1;
        transform: translateY(0);
      }

      @starting-style {
        .bar[popover]:is(:popover-open, .\:popover-open),
        :host([open][position='inline']) .bar,
        :host([open]) .bar.fallback-open {
          opacity: 0;
          transform: translateY(12px);
        }

        :host([position='top'])
          .bar[popover]:is(:popover-open, .\:popover-open) {
          transform: translateY(-12px);
        }
      }

      .bar.fallback-open:not([popover='']) {
        position: fixed;
        left: 0;
        right: 0;
        margin: 0 auto;
        bottom: var(--er-butter-bar-offset, var(--space-large, 20px));
        z-index: 1100;
      }

      :host([position='top']) .bar.fallback-open:not([popover='']) {
        top: var(--er-butter-bar-offset, var(--space-large, 20px));
        bottom: auto;
      }

      .progress-track {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 3px;
        background: color-mix(in srgb, var(--_accent) 18%, transparent);
        overflow: hidden;
      }

      .progress-indicator {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 40%;
        background: var(--_accent);
        border-radius: 999px;
        animation: er-butter-bar-indeterminate 1.4s ease-in-out infinite;
      }

      @keyframes er-butter-bar-indeterminate {
        0% {
          left: -40%;
        }
        100% {
          left: 100%;
        }
      }

      .leading {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: var(--_accent);
      }

      .leading er-icon {
        --er-icon-color: transparent;
        --er-icon-on-color: var(--_accent);
        --er-icon-font-size: 20px;
      }

      .spinner {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2.5px solid color-mix(in srgb, var(--_accent) 25%, transparent);
        border-top-color: var(--_accent);
        box-sizing: border-box;
        animation: er-butter-bar-spin 0.8s linear infinite;
      }

      @keyframes er-butter-bar-spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .content {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
        min-width: 0;
        overflow-wrap: break-word;
      }

      .message {
        font-weight: 600;
        margin: 0;
      }

      .detail {
        font-size: 0.85em;
        opacity: 0.9;
        margin: 0;
      }

      .actions {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xsmall, 6px);
        flex-shrink: 0;
      }

      .dismiss-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 50%;
        color: var(--_fg);
        cursor: pointer;
        padding: 4px;
        width: 28px;
        height: 28px;
        flex-shrink: 0;
        opacity: 0.8;
        transition:
          opacity 0.15s ease,
          background-color 0.15s ease;
      }

      .dismiss-btn:hover {
        opacity: 1;
        background-color: color-mix(in srgb, var(--_fg) 10%, transparent);
      }

      .dismiss-btn:focus-visible {
        opacity: 1;
        outline: 2px solid var(--_accent);
        outline-offset: 2px;
      }

      .dismiss-btn er-icon {
        --er-icon-color: transparent;
        --er-icon-on-color: var(--_fg);
        --er-icon-font-size: 18px;
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      ${mobile.mediaQuery} {
        .bar {
          flex-wrap: wrap;
          max-width: calc(100vw - 2 * var(--space-small, 12px));
          width: calc(100vw - 2 * var(--space-small, 12px));
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .bar {
          transition: none;
          transform: none;
        }
        .spinner,
        .progress-indicator {
          animation: none;
        }
        .progress-indicator {
          left: 0;
          width: 100%;
          opacity: 0.65;
        }
      }

      ${print.mediaQuery} {
        :host {
          display: none !important;
        }
      }
    `,
  ];

  /** Whether the butter bar is currently visible. */
  @property({ type: Boolean, reflect: true })
  open = false;

  /** Notification semantic type. */
  @property({ type: String, reflect: true })
  type: ButterBarType = 'info';

  /** Primary notification message. */
  @property({ type: String })
  message = '';

  /** Optional secondary detail text. */
  @property({ type: String })
  detail = '';

  /** Whether a dismiss button is shown. */
  @property({ type: Boolean, reflect: true })
  dismissible = false;

  /**
   * Optional auto-dismiss delay in milliseconds (ignored when `type === 'progress'`).
   * Pauses automatically while hovered or focused.
   */
  @property({ type: Number, attribute: 'auto-dismiss-ms' })
  autoDismissMs = 0;

  /** Placement mode: `'bottom'` (default), `'top'`, or `'inline'`. */
  @property({ type: String, reflect: true })
  position: ButterBarPosition = 'bottom';

  /** Accessible label for the notification region landmark. */
  @property({ type: String, attribute: 'region-label' })
  regionLabel = 'Notifications';

  @query('.bar')
  private barEl?: HTMLElement;

  @query('.live-region')
  private liveRegionEl?: HTMLElement;

  @query('slot[name="actions"]')
  private actionsSlot?: HTMLSlotElement;

  private autoDismissTimer: ReturnType<typeof setTimeout> | null = null;
  private isInteractionPaused = false;
  private lastAnnouncedKey = '';

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.clearAutoDismissTimer();
  }

  /** Programmatically dismiss the butter bar and emit a `dismiss` event. */
  dismiss = (): void => {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(
      new CustomEvent('dismiss', { bubbles: true, composed: true }),
    );
  };

  protected updated(changedProperties: PropertyValues<this>): void {
    super.updated(changedProperties);

    if (
      changedProperties.has('open') ||
      changedProperties.has('position') ||
      changedProperties.has('type') ||
      changedProperties.has('autoDismissMs')
    ) {
      this.syncPopoverVisibility(changedProperties.has('open'));
      this.resetAutoDismissTimer();
    }

    if (
      this.open &&
      (changedProperties.has('open') ||
        changedProperties.has('message') ||
        changedProperties.has('detail') ||
        changedProperties.has('type'))
    ) {
      this.announceNotification();
    } else if (!this.open && changedProperties.has('open')) {
      if (this.liveRegionEl) {
        this.liveRegionEl.textContent = '';
      }
      this.lastAnnouncedKey = '';
    }
  }

  private syncPopoverVisibility(openChanged: boolean): void {
    const bar = this.barEl;
    if (!bar) return;

    const supportsPopover =
      this.position !== 'inline' && typeof bar.showPopover === 'function';

    if (supportsPopover) {
      bar.classList.remove('fallback-open');
      try {
        if (this.open && !bar.matches(':popover-open')) {
          bar.showPopover();
        } else if (!this.open && bar.matches(':popover-open')) {
          bar.hidePopover();
        }
      } catch {
        // Fallback if popover state transition fails (e.g. detached node)
        bar.classList.toggle('fallback-open', this.open);
      }
    } else {
      bar.classList.toggle('fallback-open', this.open);
    }

    if (openChanged) {
      this.dispatchEvent(
        new CustomEvent(this.open ? 'opened' : 'closed', {
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private announceNotification(): void {
    const parts = [this.message, this.detail].filter(Boolean);
    if (parts.length === 0) return;

    const hasActions =
      (this.actionsSlot?.assignedElements({ flatten: true }).length ?? 0) > 0;
    const text = hasActions
      ? `${parts.join('. ')}. Actions available`
      : parts.join('. ');
    const key = `${this.type}:${text}`;
    if (key === this.lastAnnouncedKey) return;
    this.lastAnnouncedKey = key;

    const notifyTarget = this as unknown as {
      ariaNotify?: (message: string, options?: { priority?: string }) => void;
    };
    if (typeof notifyTarget.ariaNotify === 'function') {
      notifyTarget.ariaNotify(text, {
        priority:
          this.type === 'error' || this.type === 'warning' ? 'high' : 'normal',
      });
      if (this.liveRegionEl) {
        this.liveRegionEl.textContent = '';
      }
    } else if (this.liveRegionEl) {
      this.liveRegionEl.textContent = text;
    }
  }

  private clearAutoDismissTimer(): void {
    if (this.autoDismissTimer !== null) {
      clearTimeout(this.autoDismissTimer);
      this.autoDismissTimer = null;
    }
  }

  private resetAutoDismissTimer(): void {
    this.clearAutoDismissTimer();
    if (
      !this.open ||
      this.type === 'progress' ||
      this.autoDismissMs <= 0 ||
      this.isInteractionPaused
    ) {
      return;
    }
    this.autoDismissTimer = setTimeout(() => {
      this.dismiss();
    }, this.autoDismissMs);
  }

  private handlePauseStart = (): void => {
    this.isInteractionPaused = true;
    this.clearAutoDismissTimer();
  };

  private handlePauseEnd = (event: FocusEvent | MouseEvent): void => {
    if (event.type === 'focusout') {
      const nextTarget = (event as FocusEvent).relatedTarget as Node | null;
      if (nextTarget && this.contains(nextTarget)) {
        return;
      }
    }
    this.isInteractionPaused = false;
    this.resetAutoDismissTimer();
  };

  private renderLeading() {
    if (this.type === 'progress') {
      return html`
        <slot name="icon">
          <span class="spinner" aria-hidden="true"></span>
        </slot>
      `;
    }
    const iconName = DEFAULT_ICONS[this.type];
    return html`
      <slot name="icon">
        <er-icon .icon=${iconName} aria-hidden="true"></er-icon>
      </slot>
    `;
  }

  render() {
    const isUrgent = this.type === 'error' || this.type === 'warning';

    return html`
      <div class="region" role="region" aria-label=${this.regionLabel}>
        <p class="sr-only">Screen reader announcements</p>
        <div
          class="sr-only live-region"
          aria-live=${isUrgent ? 'assertive' : 'polite'}
          aria-atomic="true"
        ></div>
        <div
          class="bar"
          popover=${this.position === 'inline' ? nothing : 'manual'}
          @mouseenter=${this.handlePauseStart}
          @mouseleave=${this.handlePauseEnd}
          @focusin=${this.handlePauseStart}
          @focusout=${this.handlePauseEnd}
        >
          <div class="leading">${this.renderLeading()}</div>
          <div class="content">
            ${
              this.message
                ? html`<p class="message">${this.message}</p>`
                : nothing
            }
            ${
              this.detail ? html`<p class="detail">${this.detail}</p>` : nothing
            }
            <slot></slot>
          </div>
          <div class="actions">
            <slot name="actions"></slot>
          </div>
          ${
            this.dismissible
              ? html`
                  <button
                    type="button"
                    class="dismiss-btn"
                    aria-label="Dismiss notification"
                    popovertargetaction=${
                      this.position === 'inline' ? nothing : 'hide'
                    }
                    @click=${this.dismiss}
                  >
                    <er-icon icon="close" aria-hidden="true"></er-icon>
                  </button>
                `
              : nothing
          }
          ${
            this.type === 'progress'
              ? html`
                  <div class="progress-track" aria-hidden="true">
                    <div class="progress-indicator"></div>
                  </div>
                `
              : nothing
          }
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'er-butter-bar': ErButterBar;
  }
}
