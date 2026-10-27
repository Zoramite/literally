// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { ErFab } from './er-fab';
import './er-fab';

describe('ErFab', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container) {
      container.remove();
    }
  });

  test('instantiates and renders ErFab with icon and label', async () => {
    const fab = document.createElement('er-fab') as ErFab;
    fab.setAttribute('icon', 'add');
    fab.setAttribute('label', 'Add item');
    fab.expanded = true;
    container.appendChild(fab);
    await fab.updateComplete;

    const icon = fab.shadowRoot?.querySelector('er-icon');
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute('icon')).toBe('add');
    expect(customElements.get('er-icon')).toBeDefined();
    expect(fab.shadowRoot?.querySelector('.label')?.textContent).toBe(
      'Add item',
    );
  });

  test('defines icon font size adjustment linked to fab font size in styles', () => {
    const styles = ErFab.styles;
    const styleStrings = (Array.isArray(styles) ? styles : [styles]).map((s) =>
      s.toString(),
    );
    const combinedStyles = styleStrings.join('\n');

    expect(combinedStyles).toContain('--er-icon-font-size');
    expect(combinedStyles).toContain('--er-fab-font-size');
  });

  test('defines standard theme font size classes and responsive breakpoints in styles', () => {
    const styles = ErFab.styles;
    const styleStrings = (Array.isArray(styles) ? styles : [styles]).map((s) =>
      s.toString(),
    );
    const combinedStyles = styleStrings.join('\n');

    expect(combinedStyles).toContain('.fontSizeXxsmall');
    expect(combinedStyles).toContain('.fontSizeXsmall');
    expect(combinedStyles).toContain('.fontSizeSmall');
    expect(combinedStyles).toContain('.fontSizeMedium');
    expect(combinedStyles).toContain('.fontSizeLarge');
    expect(combinedStyles).toContain('.fontSizeXlarge');
    expect(combinedStyles).toContain('.fontSizeXxlarge');
    expect(combinedStyles).toContain('.fontSizeXxxlarge');

    expect(combinedStyles).toContain('.fontSmall');
    expect(combinedStyles).toContain('.fontMedium');
    expect(combinedStyles).toContain('.fontLarge');

    expect(combinedStyles).toContain('.fontSizeSmallOnMobile');
    expect(combinedStyles).toContain('--er-sys-body-font-size-small');
    expect(combinedStyles).toContain('--er-sys-body-font-size-large');
  });
});
