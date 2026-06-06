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
    // Does not exist anywhere, fallback to empty string.
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

  it('should fall back to default fetch loader when loader is not provided', async () => {
    const mockYaml = `
config:
  locale: 'en-US'
strings:
  hello: 'Hello World'
`;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => mockYaml,
    });
    vi.stubGlobal('fetch', fetchMock);

    const manager = new LocalizationManager();
    const localization = await manager.load('en');

    expect(fetchMock).toHaveBeenCalledWith('/locales/en.yaml');
    expect(localization.t('hello')).toBe('Hello World');

    vi.unstubAllGlobals();
  });

  it('should handle loader failure or empty response gracefully', async () => {
    const loader = vi.fn().mockImplementation(async (locale: string) => {
      if (locale === 'es') {
        return null; // target data fails to load
      }
      return LOCALES[locale];
    });

    const manager = new LocalizationManager({ loader });
    const localization = await manager.load('es');

    // Should still succeed in loading, activeStrings is empty, but baseStrings is loaded
    expect(localization.t('simple')).toBe('Simple string');
    expect(localization.t('welcome', { name: 'Randy' })).toBe('');
  });

  it('should warn on missing translation keys', async () => {
    const loader = vi.fn().mockImplementation(async (locale: string) => LOCALES[locale]);
    const manager = new LocalizationManager({ loader });
    const localization = await manager.load('en');

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = localization.t('non_existent_key');

    expect(result).toBe('');
    expect(warnSpy).toHaveBeenCalledWith('Unable to find the translation key:', 'non_existent_key');
    warnSpy.mockRestore();
  });

  it('should treat nested keys pointing to objects (non-strings) as missing', async () => {
    const loader = vi.fn().mockImplementation(async (locale: string) => LOCALES[locale]);
    const manager = new LocalizationManager({ loader });
    const localization = await manager.load('en');

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = localization.t('nested'); // nested points to { value: 'Deep nested string' }

    expect(result).toBe('');
    expect(warnSpy).toHaveBeenCalledWith('Unable to find the translation key:', 'nested');
    warnSpy.mockRestore();
  });

  it('should preserve template placeholders for missing variables', async () => {
    const loader = vi.fn().mockImplementation(async (locale: string) => LOCALES[locale]);
    const manager = new LocalizationManager({ loader });
    const localization = await manager.load('en');

    // welcome is 'Welcome, {name}!'
    // variables is provided but doesn't contain 'name'
    expect(localization.t('welcome', { age: 30 })).toBe('Welcome, {name}!');
    // variables is completely omitted
    expect(localization.t('welcome')).toBe('Welcome, {name}!');
  });

  it('should use default decimal formatting for number variables if no specific format type is specified', async () => {
    const localesWithNum: Record<string, any> = {
      en: {
        config: {
          locale: 'en-US',
          formats: {
            number: {
              style: 'decimal',
              minimumFractionDigits: 3,
              maximumFractionDigits: 3,
            },
          },
        },
        strings: {
          price: 'The raw number is {val}.',
        },
      },
    };
    const loader = vi.fn().mockImplementation(async (locale: string) => localesWithNum[locale]);
    const manager = new LocalizationManager({ loader });
    const localization = await manager.load('en');

    expect(localization.t('price', { val: 12.3456 })).toBe('The raw number is 12.346.');
  });

  it('should handle formatting errors gracefully and fall back to String(value)', async () => {
    const localesInvalid: Record<string, any> = {
      en: {
        config: {
          locale: 'en-US',
          formats: {
            number: {
              style: 'invalid-style-name',
            },
          },
        },
        strings: {
          hello: 'Hello',
        },
      },
    };
    const loader = vi.fn().mockImplementation(async (locale: string) => localesInvalid[locale]);
    const manager = new LocalizationManager({ loader });
    const localization = await manager.load('en');

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = localization.formatNumber(100, 'number');

    expect(result).toBe('100');
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
