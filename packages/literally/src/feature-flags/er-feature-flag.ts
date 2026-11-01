import { ContextConsumer } from '@lit/context';
import { LitElement, type PropertyValues, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import type { FeatureFlagEvaluationContext } from './models';

import { featureFlagContext } from './context';
import { type FeatureFlagManager } from './manager';

/**
 * Declarative feature flag gate component.
 * Consumes `featureFlagContext` (or accepts a `.manager` property) and renders its default slot
 * when the specified `flag` is enabled (or disabled when `not` is set), otherwise rendering
 * the `fallback` slot.
 *
 * @slot - Content displayed when the feature flag condition is satisfied.
 * @slot fallback - Content displayed when the feature flag condition is not satisfied.
 */
@customElement('er-feature-flag')
export class ErFeatureFlag extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  private contextConsumer = new ContextConsumer(this, {
    context: featureFlagContext,
    subscribe: true,
    callback: () => {
      this.syncSubscription();
      this.requestUpdate();
    },
  });

  /**
   * Optional explicit `FeatureFlagManager` instance (overrides `featureFlagContext` if set).
   */
  @property({ attribute: false })
  manager?: FeatureFlagManager;

  /**
   * The feature flag key to evaluate.
   */
  @property({ type: String, reflect: true })
  flag = '';

  /**
   * When true, inverts the gate check (renders the default slot when the flag is disabled).
   */
  @property({ type: Boolean, reflect: true })
  not = false;

  /**
   * Optional per-element evaluation context override.
   */
  @property({ attribute: false })
  context?: FeatureFlagEvaluationContext;

  private unsubscribeManager?: () => void;
  private observedManager?: FeatureFlagManager;

  override connectedCallback() {
    super.connectedCallback();
    this.syncSubscription();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.clearSubscription();
  }

  protected override willUpdate(changedProperties: PropertyValues) {
    super.willUpdate(changedProperties);
    if (changedProperties.has('manager')) {
      this.syncSubscription();
    }
  }

  private get activeManager(): FeatureFlagManager | undefined {
    return this.manager ?? this.contextConsumer.value;
  }

  private syncSubscription() {
    const next = this.activeManager;
    if (next === this.observedManager) {
      return;
    }
    this.clearSubscription();
    this.observedManager = next;
    if (next) {
      this.unsubscribeManager = next.subscribe(() => {
        this.requestUpdate();
      });
    }
  }

  private clearSubscription() {
    if (this.unsubscribeManager) {
      this.unsubscribeManager();
      this.unsubscribeManager = undefined;
    }
    this.observedManager = undefined;
  }

  override render() {
    if (!this.flag) {
      return html`<slot name="fallback"></slot>`;
    }

    const enabled =
      this.activeManager?.isEnabled(this.flag, this.context) ?? false;
    const matches = this.not ? !enabled : enabled;

    return matches ? html`<slot></slot>` : html`<slot name="fallback"></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'er-feature-flag': ErFeatureFlag;
  }
}
