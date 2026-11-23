// @vitest-environment jsdom
import { ContextProvider } from '@lit/context';
import { LitElement, html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';

import { localizationContext } from './context';
import { type Localization, LocalizationManager } from './localization';
import { LocalizationConsumerMixin } from './localization.mixin';

class TestLocalizationHost extends LitElement {
  provider = new ContextProvider(this, {
    context: localizationContext,
    initialValue: undefined,
  });

  setLocalization(loc: Localization | undefined) {
    this.provider.setValue(loc);
  }

  render() {
    return html`<slot></slot>`;
  }
}
customElements.define('test-localization-host', TestLocalizationHost);

class TestLocalizationConsumer extends LocalizationConsumerMixin(LitElement) {
  render() {
    return html`<span class="greeting"
        >${this.t('greeting', { name: 'Ana' })}</span
      ><span class="price">${this.formatNumber(42.5, 'currency')}</span>`;
  }
}
customElements.define('test-localization-consumer', TestLocalizationConsumer);

describe('LocalizationConsumerMixin', () => {
  let host: TestLocalizationHost | undefined;

  afterEach(() => {
    host?.remove();
    host = undefined;
  });

  it('consumes localizationContext and updates reactively when locale changes', async () => {
    const manager = new LocalizationManager({
      loader: async (locale) =>
        locale === 'es'
          ? {
              config: {
                locale: 'es-US',
                formats: {
                  currency: { style: 'currency', currency: 'USD' },
                },
              },
              strings: { greeting: '¡Hola, {name}!' },
            }
          : {
              config: {
                locale: 'en-US',
                formats: {
                  currency: { style: 'currency', currency: 'USD' },
                },
              },
              strings: { greeting: 'Hello, {name}!' },
            },
    });

    host = document.createElement(
      'test-localization-host',
    ) as TestLocalizationHost;
    const consumer = document.createElement(
      'test-localization-consumer',
    ) as TestLocalizationConsumer;
    host.appendChild(consumer);
    document.body.appendChild(host);

    // Before localization is provided, falls back safely.
    await consumer.updateComplete;
    expect(consumer.t('greeting', { name: 'Ana' })).toBe('');
    expect(consumer.formatNumber(42.5, 'currency')).toBe('42.5');

    // Provide English localization.
    host.setLocalization(await manager.load('en'));
    await host.updateComplete;
    await consumer.updateComplete;
    expect(
      consumer.shadowRoot?.querySelector('.greeting')?.textContent?.trim(),
    ).toBe('Hello, Ana!');
    expect(
      consumer.shadowRoot?.querySelector('.price')?.textContent?.trim(),
    ).toBe('$42.50');

    // Switch to Spanish localization.
    host.setLocalization(await manager.load('es'));
    await host.updateComplete;
    await consumer.updateComplete;
    expect(
      consumer.shadowRoot?.querySelector('.greeting')?.textContent?.trim(),
    ).toBe('¡Hola, Ana!');
  });
});
