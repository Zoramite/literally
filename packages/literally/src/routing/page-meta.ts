import { type RouteTrieParamValue } from './router';

export interface PageMetaTag {
  name?: string;
  property?: string;
  httpEquiv?: string;
  content?: string;
}

export interface PageLinkTag {
  rel: string;
  href?: string;
  hreflang?: string;
  type?: string;
  sizes?: string;
}

export interface PageOpenGraphMeta {
  type?: string;
  siteName?: string;
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number | string;
  imageHeight?: number | string;
  locale?: string;
  localeAlternate?: string | string[];
}

export interface PageTwitterMeta {
  card?: string;
  site?: string;
  creator?: string;
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
}

export interface PageMeta {
  /**
   * Optional explicit document title override.
   * When omitted, the router's normal route title / defaultTitle is used.
   */
  title?: string;
  /**
   * Whether to append ` - ${defaultTitle}` when `meta.title` is applied.
   * Defaults to `false` when `meta.title` is explicitly specified.
   */
  includeDefaultTitle?: boolean;
  /** `<meta name="description">` */
  description?: string;
  /** `<link rel="canonical">` */
  canonical?: string;
  /** `<meta name="robots">` */
  robots?: string;
  /** `<html lang="...">` */
  lang?: string;
  /** Open Graph tags (`og:*`). */
  og?: PageOpenGraphMeta;
  /** Twitter Card tags (`twitter:*`). */
  twitter?: PageTwitterMeta;
  /** Additional arbitrary `<meta>` tags. */
  meta?: PageMetaTag[];
  /** Additional `<link>` tags (e.g. `alternate` with `hreflang`). */
  links?: PageLinkTag[];
}

export interface PageMetaContext {
  path: string;
  routePath: string;
  rootPath: string;
  params?: Record<string, RouteTrieParamValue>;
  permissions?: Record<string, boolean> | null;
  signal: AbortSignal;
}

export type PageMetaResolver =
  | PageMeta
  | ((
      context: PageMetaContext,
    ) => PageMeta | undefined | Promise<PageMeta | undefined>);

export interface CompiledHeadTag {
  key: string;
  tag: 'meta' | 'link';
  selector: string;
  attrs: Record<string, string>;
}

function escapeSelectorValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getMetaTagKey(tag: PageMetaTag): string | undefined {
  if (tag.name) return `meta:name:${tag.name}`;
  if (tag.property) return `meta:property:${tag.property}`;
  if (tag.httpEquiv) return `meta:http-equiv:${tag.httpEquiv}`;
  return undefined;
}

function getLinkTagKey(link: PageLinkTag): string {
  return `link:rel:${link.rel}${link.hreflang ? `:hreflang:${link.hreflang}` : ''}`;
}

function mergeOpenGraph(
  base?: PageOpenGraphMeta,
  override?: PageOpenGraphMeta,
): PageOpenGraphMeta | undefined {
  if (!base && !override) return undefined;
  if (!base) return { ...override };
  if (!override) return { ...base };

  const merged: PageOpenGraphMeta = { ...base };
  const imageChanged =
    'image' in override &&
    override.image !== undefined &&
    override.image !== base.image;

  if (imageChanged) {
    if (!('imageWidth' in override)) {
      delete merged.imageWidth;
    }
    if (!('imageHeight' in override)) {
      delete merged.imageHeight;
    }
  }

  for (const key of Object.keys(override) as Array<keyof PageOpenGraphMeta>) {
    const value = override[key];
    if (value === undefined) {
      delete merged[key];
    } else {
      (merged as Record<string, unknown>)[key] = value;
    }
  }

  return merged;
}

function mergeTwitter(
  base?: PageTwitterMeta,
  override?: PageTwitterMeta,
): PageTwitterMeta | undefined {
  if (!base && !override) return undefined;
  if (!base) return { ...override };
  if (!override) return { ...base };

  const merged: PageTwitterMeta = { ...base };
  for (const key of Object.keys(override) as Array<keyof PageTwitterMeta>) {
    const value = override[key];
    if (value === undefined) {
      delete merged[key];
    } else {
      (merged as Record<string, unknown>)[key] = value;
    }
  }

  return merged;
}

function mergeMetaTags(
  base?: PageMetaTag[],
  override?: PageMetaTag[],
): PageMetaTag[] | undefined {
  if (!base?.length && !override?.length) return undefined;
  const map = new Map<string, PageMetaTag>();
  for (const tag of base ?? []) {
    const key = getMetaTagKey(tag);
    if (key) map.set(key, { ...tag });
  }
  for (const tag of override ?? []) {
    const key = getMetaTagKey(tag);
    if (!key) continue;
    if (!tag.content) {
      map.delete(key);
    } else {
      map.set(key, { ...tag });
    }
  }
  return Array.from(map.values());
}

function mergeLinkTags(
  base?: PageLinkTag[],
  override?: PageLinkTag[],
): PageLinkTag[] | undefined {
  if (!base?.length && !override?.length) return undefined;
  const map = new Map<string, PageLinkTag>();
  for (const link of base ?? []) {
    if (link.rel) {
      map.set(getLinkTagKey(link), { ...link });
    }
  }
  for (const link of override ?? []) {
    if (!link.rel) continue;
    const key = getLinkTagKey(link);
    if (!link.href) {
      map.delete(key);
    } else {
      map.set(key, { ...link });
    }
  }
  return Array.from(map.values());
}

/**
 * Merges multiple `PageMeta` layers in order (e.g. defaults -> route -> page override).
 * Later layers override earlier ones; setting a property to `undefined` or `''`
 * clears an inherited value.
 */
export function mergePageMeta(
  ...layers: Array<PageMeta | undefined>
): PageMeta | undefined {
  let result: PageMeta | undefined;

  for (const layer of layers) {
    if (!layer) continue;
    if (!result) {
      result = {
        ...layer,
        og: layer.og ? { ...layer.og } : undefined,
        twitter: layer.twitter ? { ...layer.twitter } : undefined,
        meta: layer.meta ? layer.meta.map((t) => ({ ...t })) : undefined,
        links: layer.links ? layer.links.map((l) => ({ ...l })) : undefined,
      };
      continue;
    }

    const next: PageMeta = { ...result };

    if ('title' in layer) next.title = layer.title;
    if ('includeDefaultTitle' in layer) {
      next.includeDefaultTitle = layer.includeDefaultTitle;
    }
    if ('description' in layer) next.description = layer.description;
    if ('canonical' in layer) next.canonical = layer.canonical;
    if ('robots' in layer) next.robots = layer.robots;
    if ('lang' in layer) next.lang = layer.lang;

    if ('og' in layer) {
      next.og =
        layer.og === undefined
          ? undefined
          : mergeOpenGraph(result.og, layer.og);
    }

    if ('twitter' in layer) {
      next.twitter =
        layer.twitter === undefined
          ? undefined
          : mergeTwitter(result.twitter, layer.twitter);
    }

    if ('meta' in layer) {
      next.meta =
        layer.meta === undefined
          ? undefined
          : mergeMetaTags(result.meta, layer.meta);
    }

    if ('links' in layer) {
      next.links =
        layer.links === undefined
          ? undefined
          : mergeLinkTags(result.links, layer.links);
    }

    result = next;
  }

  return result;
}

function addMetaEntry(
  entries: Map<string, CompiledHeadTag>,
  attrName: 'name' | 'property' | 'http-equiv',
  attrValue: string,
  content?: string | number,
  keySuffix = '',
) {
  if (content === undefined || content === '') return;
  const contentStr = String(content);
  const key = `meta:${attrName}:${attrValue}${keySuffix}`;
  const escapedVal = escapeSelectorValue(attrValue);
  const selector = keySuffix
    ? `meta[${attrName}="${escapedVal}"][content="${escapeSelectorValue(contentStr)}"]`
    : `meta[${attrName}="${escapedVal}"]`;
  entries.set(key, {
    key,
    tag: 'meta',
    selector,
    attrs: {
      [attrName]: attrValue,
      content: contentStr,
    },
  });
}

function addLinkEntry(
  entries: Map<string, CompiledHeadTag>,
  link: PageLinkTag,
) {
  if (!link.rel || !link.href) return;
  const key = getLinkTagKey(link);
  const escapedRel = escapeSelectorValue(link.rel);
  const selector = link.hreflang
    ? `link[rel="${escapedRel}"][hreflang="${escapeSelectorValue(link.hreflang)}"]`
    : `link[rel="${escapedRel}"]`;
  const attrs: Record<string, string> = {
    rel: link.rel,
    href: link.href,
  };
  if (link.hreflang) attrs.hreflang = link.hreflang;
  if (link.type) attrs.type = link.type;
  if (link.sizes) attrs.sizes = link.sizes;
  entries.set(key, {
    key,
    tag: 'link',
    selector,
    attrs,
  });
}

/**
 * Compiles a `PageMeta` object into a deduplicated map of `<meta>` and `<link>`
 * head tag descriptors.
 */
export function compilePageMetaEntries(
  meta?: PageMeta,
  resolvedTitle?: string,
): Map<string, CompiledHeadTag> {
  const entries = new Map<string, CompiledHeadTag>();
  if (!meta) return entries;

  const effectiveTitle = meta.title ?? resolvedTitle;

  addMetaEntry(entries, 'name', 'description', meta.description);
  addMetaEntry(entries, 'name', 'robots', meta.robots);

  if (meta.canonical) {
    addLinkEntry(entries, { rel: 'canonical', href: meta.canonical });
  }

  if (meta.links) {
    for (const link of meta.links) {
      addLinkEntry(entries, link);
    }
  }

  if (meta.og) {
    const og = meta.og;
    const ogTitle = 'title' in og ? og.title : effectiveTitle;
    const ogDescription =
      'description' in og ? og.description : meta.description;
    const ogUrl = 'url' in og ? og.url : meta.canonical;

    addMetaEntry(entries, 'property', 'og:type', og.type);
    addMetaEntry(entries, 'property', 'og:locale', og.locale);

    if (Array.isArray(og.localeAlternate)) {
      const uniqueAlternates = Array.from(
        new Set(og.localeAlternate.filter(Boolean)),
      );
      if (uniqueAlternates.length === 1) {
        addMetaEntry(
          entries,
          'property',
          'og:locale:alternate',
          uniqueAlternates[0],
        );
      } else {
        for (const alt of uniqueAlternates) {
          addMetaEntry(
            entries,
            'property',
            'og:locale:alternate',
            alt,
            `:${alt}`,
          );
        }
      }
    } else if (og.localeAlternate) {
      addMetaEntry(
        entries,
        'property',
        'og:locale:alternate',
        og.localeAlternate,
      );
    }

    addMetaEntry(entries, 'property', 'og:site_name', og.siteName);
    addMetaEntry(entries, 'property', 'og:title', ogTitle);
    addMetaEntry(entries, 'property', 'og:description', ogDescription);
    addMetaEntry(entries, 'property', 'og:url', ogUrl);
    addMetaEntry(entries, 'property', 'og:image', og.image);
    addMetaEntry(entries, 'property', 'og:image:alt', og.imageAlt);
    addMetaEntry(entries, 'property', 'og:image:width', og.imageWidth);
    addMetaEntry(entries, 'property', 'og:image:height', og.imageHeight);
  }

  if (meta.twitter) {
    const tw = meta.twitter;
    const twTitle =
      'title' in tw ? tw.title : (meta.og?.title ?? effectiveTitle);
    const twDescription =
      'description' in tw
        ? tw.description
        : (meta.og?.description ?? meta.description);
    const twImage = 'image' in tw ? tw.image : meta.og?.image;
    const twImageAlt = 'imageAlt' in tw ? tw.imageAlt : meta.og?.imageAlt;

    addMetaEntry(entries, 'name', 'twitter:card', tw.card);
    addMetaEntry(entries, 'name', 'twitter:site', tw.site);
    addMetaEntry(entries, 'name', 'twitter:creator', tw.creator);
    addMetaEntry(entries, 'name', 'twitter:title', twTitle);
    addMetaEntry(entries, 'name', 'twitter:description', twDescription);
    addMetaEntry(entries, 'name', 'twitter:image', twImage);
    addMetaEntry(entries, 'name', 'twitter:image:alt', twImageAlt);
  }

  if (meta.meta) {
    for (const tag of meta.meta) {
      if (tag.name) {
        addMetaEntry(entries, 'name', tag.name, tag.content);
      } else if (tag.property) {
        addMetaEntry(entries, 'property', tag.property, tag.content);
      } else if (tag.httpEquiv) {
        addMetaEntry(entries, 'http-equiv', tag.httpEquiv, tag.content);
      }
    }
  }

  return entries;
}

/**
 * Renders a `PageMeta` object to an HTML head snippet (useful for SSR / edge injection).
 */
export function renderPageMetaHtml(
  meta: PageMeta,
  resolvedTitle?: string,
): string {
  const lines: string[] = [];
  const title = meta.title ?? resolvedTitle;
  if (title) {
    lines.push(`<title>${escapeHtmlAttr(title)}</title>`);
  }

  const entries = compilePageMetaEntries(meta, resolvedTitle);
  for (const entry of entries.values()) {
    const attrStr = Object.entries(entry.attrs)
      .map(([k, v]) => `${k}="${escapeHtmlAttr(v)}"`)
      .join(' ');
    lines.push(`<${entry.tag} ${attrStr} />`);
  }

  return lines.join('\n');
}

export interface ApplyPageMetaOptions {
  doc?: Document;
  resolvedTitle?: string;
}

/**
 * Manages dynamic `<meta>` and `<link>` tags in `document.head`, automatically
 * cleaning up tags that are no longer present when meta updates or routes change.
 */
export class PageMetaManager {
  private managedElements = new Map<string, HTMLElement>();
  private initialLang?: string;
  private hasModifiedLang = false;

  apply(meta?: PageMeta, options?: ApplyPageMetaOptions): void {
    const doc =
      options?.doc ?? (typeof document !== 'undefined' ? document : undefined);
    if (!doc?.head) return;

    const nextEntries = compilePageMetaEntries(meta, options?.resolvedTitle);

    // 1. Remove any previously managed elements that are no longer present.
    for (const [key, el] of this.managedElements.entries()) {
      if (!nextEntries.has(key)) {
        el.remove();
        this.managedElements.delete(key);
      }
    }

    // 2. Upsert all entries for the new meta state.
    for (const [key, entry] of nextEntries.entries()) {
      let el = this.managedElements.get(key);
      if (el && !el.isConnected) {
        el = undefined;
      }
      if (!el) {
        el = doc.head.querySelector<HTMLElement>(entry.selector) ?? undefined;
      }
      if (!el) {
        el = doc.createElement(entry.tag);
        doc.head.appendChild(el);
      }
      for (const [attr, value] of Object.entries(entry.attrs)) {
        if (el.getAttribute(attr) !== value) {
          el.setAttribute(attr, value);
        }
      }
      this.managedElements.set(key, el);
    }

    // 3. Synchronize <html lang="..."> when provided.
    if (meta?.lang) {
      if (!this.hasModifiedLang) {
        this.initialLang = doc.documentElement.lang;
        this.hasModifiedLang = true;
      }
      if (doc.documentElement.lang !== meta.lang) {
        doc.documentElement.lang = meta.lang;
      }
    } else if (this.hasModifiedLang) {
      doc.documentElement.lang = this.initialLang ?? '';
      this.hasModifiedLang = false;
    }
  }

  /**
   * Removes all head elements managed by this instance and restores `<html lang>`.
   */
  clear(doc?: Document): void {
    const targetDoc =
      doc ?? (typeof document !== 'undefined' ? document : undefined);
    for (const el of this.managedElements.values()) {
      el.remove();
    }
    this.managedElements.clear();

    if (this.hasModifiedLang && targetDoc?.documentElement) {
      targetDoc.documentElement.lang = this.initialLang ?? '';
      this.hasModifiedLang = false;
    }
  }
}
