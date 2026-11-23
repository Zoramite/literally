// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  PageMetaManager,
  compilePageMetaEntries,
  mergePageMeta,
  renderPageMetaHtml,
} from './page-meta';

describe('page-meta', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.documentElement.lang = 'en';
  });

  afterEach(() => {
    document.head.innerHTML = '';
    document.documentElement.lang = 'en';
  });

  describe('mergePageMeta', () => {
    it('merges layers with later layers overriding earlier ones', () => {
      const merged = mergePageMeta(
        {
          description: 'Default description',
          canonical: 'https://example.com/',
          og: {
            type: 'website',
            siteName: 'Example',
            image: 'https://example.com/default.jpg',
            imageWidth: 1200,
            imageHeight: 630,
          },
          twitter: {
            card: 'summary_large_image',
          },
        },
        {
          title: 'Camp Detail',
          description: 'Camp specific description',
          og: {
            image: 'https://example.com/camp.jpg',
          },
        },
      );

      expect(merged?.title).toBe('Camp Detail');
      expect(merged?.description).toBe('Camp specific description');
      expect(merged?.canonical).toBe('https://example.com/');
      expect(merged?.og?.type).toBe('website');
      expect(merged?.og?.siteName).toBe('Example');
      expect(merged?.og?.image).toBe('https://example.com/camp.jpg');
      // Overriding og.image without dimensions clears inherited dimensions
      expect(merged?.og?.imageWidth).toBeUndefined();
      expect(merged?.og?.imageHeight).toBeUndefined();
      expect(merged?.twitter?.card).toBe('summary_large_image');
    });

    it('preserves explicit og dimensions when provided alongside a new image', () => {
      const merged = mergePageMeta(
        {
          og: {
            image: 'https://example.com/default.jpg',
            imageWidth: 1200,
            imageHeight: 630,
          },
        },
        {
          og: {
            image: 'https://example.com/custom.jpg',
            imageWidth: 800,
            imageHeight: 400,
          },
        },
      );

      expect(merged?.og?.imageWidth).toBe(800);
      expect(merged?.og?.imageHeight).toBe(400);
    });

    it('merges and removes custom meta and link tags by key', () => {
      const merged = mergePageMeta(
        {
          meta: [
            { name: 'author', content: 'Default Author' },
            { name: 'theme-color', content: '#000000' },
          ],
          links: [
            {
              rel: 'alternate',
              hreflang: 'en',
              href: 'https://example.com/en',
            },
            {
              rel: 'alternate',
              hreflang: 'es',
              href: 'https://example.com/es',
            },
          ],
        },
        {
          meta: [
            { name: 'author', content: 'Page Author' },
            { name: 'theme-color', content: '' },
          ],
          links: [
            { rel: 'alternate', hreflang: 'es', href: '' },
            {
              rel: 'alternate',
              hreflang: 'fr',
              href: 'https://example.com/fr',
            },
          ],
        },
      );

      expect(merged?.meta).toEqual([
        { name: 'author', content: 'Page Author' },
      ]);
      expect(merged?.links).toEqual([
        { rel: 'alternate', hreflang: 'en', href: 'https://example.com/en' },
        { rel: 'alternate', hreflang: 'fr', href: 'https://example.com/fr' },
      ]);
    });
  });

  describe('compilePageMetaEntries & renderPageMetaHtml', () => {
    it('falls back og and twitter title/description/image cleanly', () => {
      const entries = compilePageMetaEntries(
        {
          description: 'Explore space',
          canonical: 'https://example.com/camp/1',
          og: {
            type: 'website',
            image: 'https://example.com/share.jpg',
            imageAlt: 'Space Camp',
          },
          twitter: {
            card: 'summary_large_image',
          },
        },
        'Space Camp - Example',
      );

      expect(entries.get('meta:property:og:title')?.attrs.content).toBe(
        'Space Camp - Example',
      );
      expect(entries.get('meta:property:og:description')?.attrs.content).toBe(
        'Explore space',
      );
      expect(entries.get('meta:property:og:url')?.attrs.content).toBe(
        'https://example.com/camp/1',
      );
      expect(entries.get('meta:name:twitter:title')?.attrs.content).toBe(
        'Space Camp - Example',
      );
      expect(entries.get('meta:name:twitter:image')?.attrs.content).toBe(
        'https://example.com/share.jpg',
      );
    });

    it('renders escaped HTML head tags', () => {
      const html = renderPageMetaHtml(
        {
          title: 'Launch "High" & Beyond',
          description: 'Explore <Moon>!',
          canonical: 'https://example.com/camp/1',
          og: {
            type: 'website',
          },
        },
        'Fallback',
      );

      expect(html).toContain(
        '<title>Launch &quot;High&quot; &amp; Beyond</title>',
      );
      expect(html).toContain(
        '<meta name="description" content="Explore &lt;Moon&gt;!" />',
      );
      expect(html).toContain(
        '<link rel="canonical" href="https://example.com/camp/1" />',
      );
      expect(html).toContain('<meta property="og:type" content="website" />');
    });
  });

  describe('PageMetaManager', () => {
    it('upserts tags, reuses existing SSR tags, and cleans up removed tags', () => {
      // Simulate SSR tag already in head
      const existingDesc = document.createElement('meta');
      existingDesc.setAttribute('name', 'description');
      existingDesc.setAttribute('content', 'SSR initial');
      document.head.appendChild(existingDesc);

      const manager = new PageMetaManager();
      manager.apply(
        {
          description: 'Camp description',
          robots: 'noindex',
          lang: 'es',
          og: {
            type: 'website',
            image: 'https://example.com/camp.jpg',
            imageWidth: 1200,
            imageHeight: 630,
          },
          links: [
            {
              rel: 'alternate',
              hreflang: 'es',
              href: 'https://example.com/es',
            },
          ],
        },
        { resolvedTitle: 'Camp Page' },
      );

      // Reused existing meta[name="description"] without duplicating
      expect(
        document.head.querySelectorAll('meta[name="description"]').length,
      ).toBe(1);
      expect(existingDesc.getAttribute('content')).toBe('Camp description');
      expect(
        document.head
          .querySelector('meta[name="robots"]')
          ?.getAttribute('content'),
      ).toBe('noindex');
      expect(
        document.head
          .querySelector('meta[property="og:image:width"]')
          ?.getAttribute('content'),
      ).toBe('1200');
      expect(document.documentElement.lang).toBe('es');

      // Apply next route meta without robots, image dimensions, or alternate link
      manager.apply(
        {
          description: 'FAQ description',
          og: {
            type: 'website',
            image: 'https://example.com/default.jpg',
          },
        },
        { resolvedTitle: 'FAQ' },
      );

      expect(existingDesc.getAttribute('content')).toBe('FAQ description');
      expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
      expect(
        document.head.querySelector('meta[property="og:image:width"]'),
      ).toBeNull();
      expect(
        document.head.querySelector('link[rel="alternate"][hreflang="es"]'),
      ).toBeNull();
      // Restores initial lang when lang is omitted
      expect(document.documentElement.lang).toBe('en');

      manager.clear();
      expect(
        document.head.querySelector('meta[name="description"]'),
      ).toBeNull();
      expect(
        document.head.querySelector('meta[property="og:type"]'),
      ).toBeNull();
    });
  });
});
