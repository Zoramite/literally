import { parseYaml } from '../utils/yaml';

const DEFAULT_LOCALE_PATH = '/locales';
const DEFAULT_BASE_LOCALE = 'en';

export interface Localization {
  locale: string;
  t: (key: string, variables?: Record<string, string | number>) => string;
  formatNumber: (
    value: number,
    type?: 'number' | 'currency' | 'percent',
  ) => string;
}

export interface LocalizationConfig {
  locale: string;
  formats: {
    number: Record<string, any>;
    currency: Record<string, any>;
    percent: Record<string, any>;
  };
}

/**
 * Helper to get a nested value from an object using a dot notation path.
 * @param obj The object to get the value from.
 * @param path The dot notation path to the value.
 * @returns The value at the specified path, or undefined if not found.
 */
function getNestedValue(obj: any, path: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

type LocaleLoader = (locale: string) => Promise<any>;

interface LocalizationManagerConfig {
  localePath?: string;
  baseLocale?: string;
  loader?: LocaleLoader;
}

/**
 * Manages localization strings and configuration.
 */
export class LocalizationManager {
  private localePath: string;
  private baseLocale: string;
  private loader?: LocaleLoader;
  private baseStrings: Record<string, any> = {};
  private activeStrings: Record<string, any> = {};
  private localeCache = new Map<string, Promise<any>>();
  private activeConfig: LocalizationConfig = {
    locale: 'en-US',
    formats: {
      number: {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
      currency: {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
      percent: {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
      },
    },
  };

  /**
   * Creates a new LocalizationManager.
   * @param localePath The path to the locales serving directory.
   */
  constructor(config?: LocalizationManagerConfig) {
    this.localePath = config?.localePath ?? DEFAULT_LOCALE_PATH;
    this.baseLocale = config?.baseLocale ?? DEFAULT_BASE_LOCALE;
    this.loader = config?.loader;
  }

  /**
   * Fetches and parses a YAML locale file.
   */
  private fetchLocaleFile(locale: string): Promise<any> {
    let promise = this.localeCache.get(locale);
    if (!promise) {
      if (this.loader) {
        promise = this.loader(locale);
      } else {
        promise = (async () => {
          try {
            const response = await fetch(`${this.localePath}/${locale}.yaml`);
            if (!response.ok) {
              throw new Error(
                `Failed to fetch ${this.localePath}/${locale}.yaml: ${response.statusText}`,
              );
            }
            const text = await response.text();
            return parseYaml(text);
          } catch (e) {
            console.error(`Error loading locale ${locale}:`, e);
            return null;
          }
        })();
      }
      this.localeCache.set(locale, promise);
    }
    return promise;
  }

  /**
   * Loads both base and target locale YAML files.
   */
  async load(targetLocale: string): Promise<Localization> {
    const promises: [Promise<any>, Promise<any> | null] = [
      this.fetchLocaleFile(this.baseLocale),
      targetLocale !== this.baseLocale
        ? this.fetchLocaleFile(targetLocale)
        : null,
    ];

    const [baseData, targetData] = await Promise.all(promises);

    if (baseData) {
      this.baseStrings = baseData.strings || {};
      if (targetLocale === this.baseLocale) {
        this.activeConfig = baseData.config || this.activeConfig;
      }
    }

    if (targetLocale !== this.baseLocale) {
      if (targetData) {
        this.activeStrings = targetData.strings || {};
        this.activeConfig = targetData.config || this.activeConfig;
      } else {
        this.activeStrings = {};
      }
    } else {
      this.activeStrings = {};
    }

    const localeTag = this.activeConfig.locale || targetLocale;

    // Cache Intl.NumberFormat objects
    const formatters: Record<string, Intl.NumberFormat> = {};
    const getFormatter = (
      type: 'number' | 'currency' | 'percent',
    ): Intl.NumberFormat => {
      if (!formatters[type]) {
        const configOpts = this.activeConfig.formats?.[type] || {};
        formatters[type] = new Intl.NumberFormat(localeTag, configOpts);
      }
      return formatters[type];
    };

    const formatNumber = (
      value: number,
      type: 'number' | 'currency' | 'percent' = 'number',
    ): string => {
      try {
        return getFormatter(type).format(value);
      } catch (err) {
        console.error(
          `Error formatting number ${value} with type ${type}:`,
          err,
        );
        return String(value);
      }
    };

    const t = (
      key: string,
      variables?: Record<string, string | number>,
    ): string => {
      // Find translation string in active locale, fallback to base locale, fallback to key
      const template =
        getNestedValue(this.activeStrings, key) ??
        getNestedValue(this.baseStrings, key) ??
        undefined;

      // Warn when there is not match for the key and return a blank string.
      if (template === undefined) {
        console.warn('Unable to find the translation key:', key);
        return '';
      }

      if (!variables) {
        return template;
      }

      // Replace variables with support for types, e.g. {amount, currency}
      return template.replace(
        /\{([a-zA-Z0-9_]+)(?:\s*,\s*([a-zA-Z0-9_]+))?\}/g,
        (match, name, formatType) => {
          if (!(name in variables)) {
            return match;
          }

          const value = variables[name];
          if (typeof value === 'number') {
            if (
              formatType === 'currency' ||
              formatType === 'percent' ||
              formatType === 'number'
            ) {
              return formatNumber(value, formatType);
            }
            // Default formatting if it's a number but no specific formatting parameter is passed
            return formatNumber(value, 'number');
          }

          return String(value);
        },
      );
    };

    return {
      locale: targetLocale,
      t,
      formatNumber,
    };
  }
}
