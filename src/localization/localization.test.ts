import { describe, it, expect, vi } from 'vitest';

import { LocalizationManager } from './localization';

const LOCALES: Record<string, any> = {
  en: {
    config: {
      locale: 'en-US',
      formats: {
        number: {
          style: 'decimal',
          minimumFractionDigits: 1,
          maximumFractionDigits: 2,
        },
        currency: {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
        },
        percent: { style: 'percent', minimumFractionDigits: 1 },
      },
    },
    strings: {
      welcome: 'Welcome, {name}!',
      simple: 'Simple string',
      nested: {
        value: 'Deep nested string',
      },
      formatting: {
        cash: 'Your balance is {amount, currency}.',
        pct: 'Interest rate is {rate, percent}.',
      },
    },
  },
  es: {
    config: {
      locale: 'es-ES',
      formats: {
        number: {
          style: 'decimal',
          minimumFractionDigits: 1,
          maximumFractionDigits: 2,
        },
        currency: {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 2,
        },
        percent: { style: 'percent', minimumFractionDigits: 1 },
      },
    },
    strings: {
      welcome: '¡Bienvenido, {name}!',
      nested: {
        value: 'Cadena anidada profunda',
      },
    },
  },
};

describe('LocalizationManager', () => {
  it('should load strings and allow simple translation', async () => {
    const loader = vi
      .fn()
      .mockImplementation(async (locale: string) => LOCALES[locale]);
    const manager = new LocalizationManager({ loader });

    const localization = await manager.load('en');

    expect(loader).toHaveBeenCalledWith('en');
    expect(localization.t('simple')).toBe('Simple string');
  });

  it('should support fallback to base locale', async () => {
    const loader = vi
      .fn()
      .mockImplementation(async (locale: string) => LOCALES[locale]);
    const manager = new LocalizationManager({ loader });

    const localization = await manager.load('es');

    expect(loader).toHaveBeenCalledWith('en');
    expect(loader).toHaveBeenCalledWith('es');

    // Exists in active (es)
    expect(localization.t('welcome', { name: 'Randy' })).toBe(
      '¡Bienvenido, Randy!',
    );
    // Exists only in base (en)
    expect(localization.t('simple')).toBe('Simple string');
    // Does not exist anywhere, fallback to key
    expect(localization.t('missing_key')).toBe('');
  });

  it('should support nested keys via dot notation', async () => {
    const loader = vi
      .fn()
      .mockImplementation(async (locale: string) => LOCALES[locale]);
    const manager = new LocalizationManager({ loader });

    const localization = await manager.load('en');

    expect(localization.t('nested.value')).toBe('Deep nested string');
  });

  it('should format currencies and percents correctly based on configuration', async () => {
    const loader = vi
      .fn()
      .mockImplementation(async (locale: string) => LOCALES[locale]);

    // Test English formatting (USD)
    const managerEn = new LocalizationManager({ loader });
    const locEn = await managerEn.load('en');
    expect(locEn.t('formatting.cash', { amount: 1250.5 })).toContain(
      '$1,250.50',
    );
    expect(locEn.t('formatting.pct', { rate: 0.189 })).toContain('18.9%');

    // Test Spanish formatting (EUR)
    const managerEs = new LocalizationManager({ loader });
    const locEs = await managerEs.load('es');

    const formattedCurrency = locEs.formatNumber(1250.5, 'currency');
    expect(formattedCurrency).toMatch(/(EUR|€|1[,.]250)/);
  });

  it('should cache locale responses and avoid fetching the same locale twice', async () => {
    const loader = vi
      .fn()
      .mockImplementation(async (locale: string) => LOCALES[locale]);
    const manager = new LocalizationManager({ loader });

    // Load 'es' (which fetches 'en' and 'es')
    await manager.load('es');
    expect(loader).toHaveBeenCalledTimes(2);

    // Load 'es' again
    await manager.load('es');
    expect(loader).toHaveBeenCalledTimes(2); // no extra fetch

    // Load 'en'
    await manager.load('en');
    expect(loader).toHaveBeenCalledTimes(2); // no extra fetch
  });
});
