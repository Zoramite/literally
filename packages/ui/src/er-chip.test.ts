// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { ErChip } from './er-chip';
import './er-chip';

describe('ErChip', () => {
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

  test('instantiates and renders ErChip with a slot', async () => {
    const chip = document.createElement('er-chip') as ErChip;
    container.appendChild(chip);
    await chip.updateComplete;

    expect(chip.shadowRoot?.querySelector('slot')).not.toBeNull();
  });

  test('renders start and end icons when attributes are provided', async () => {
    const chip = document.createElement('er-chip') as ErChip;
    chip.setAttribute('icon-start', 'star');
    chip.setAttribute('icon-end', 'close');
    container.appendChild(chip);
    await chip.updateComplete;

    const icons = chip.shadowRoot?.querySelectorAll('er-icon');
    expect(icons?.length).toBe(2);
    expect(icons?.[0].getAttribute('icon')).toBe('star');
    expect(icons?.[1].getAttribute('icon')).toBe('close');
  });

  test('defines icon font size adjustment linked to chip font size in styles', () => {
    const styles = ErChip.styles;
    const styleStrings = (Array.isArray(styles) ? styles : [styles]).map((s) =>
      s.toString(),
    );
    const combinedStyles = styleStrings.join('\n');

    expect(combinedStyles).toContain('--er-icon-font-size');
    expect(combinedStyles).toContain('--er-chip-font-size');
  });

  test('defines standard theme font size classes and responsive breakpoints in styles', () => {
    const styles = ErChip.styles;
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
