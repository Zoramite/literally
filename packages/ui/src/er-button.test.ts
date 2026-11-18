// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { ErButton } from './er-button';
import './er-button';

describe('ErButton', () => {
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

  test('instantiates and renders ErButton with icon and label without needing expanded attribute', async () => {
    const button = document.createElement('er-button') as ErButton;
    button.setAttribute('icon', 'add');
    button.setAttribute('label', 'Add item');
    container.appendChild(button);
    await button.updateComplete;

    const icon = button.shadowRoot?.querySelector('er-icon');
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute('icon')).toBe('add');
    expect(button.shadowRoot?.querySelector('.label')?.textContent).toBe(
      'Add item',
    );
  });

  test('renders with label only and does not render er-icon', async () => {
    const button = document.createElement('er-button') as ErButton;
    button.setAttribute('label', 'Save');
    container.appendChild(button);
    await button.updateComplete;

    const icon = button.shadowRoot?.querySelector('er-icon');
    expect(icon).toBeNull();
    expect(button.shadowRoot?.querySelector('.label')?.textContent).toBe(
      'Save',
    );
  });

  test('renders with icon only and does not render a visible label container', async () => {
    const button = document.createElement('er-button') as ErButton;
    button.setAttribute('icon', 'delete');
    container.appendChild(button);
    await button.updateComplete;

    const icon = button.shadowRoot?.querySelector('er-icon');
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute('icon')).toBe('delete');
    expect(button.shadowRoot?.querySelector('.label')).toBeNull();
  });

  test('renders slotted content when label property is not specified', async () => {
    const button = document.createElement('er-button') as ErButton;
    button.textContent = 'Custom Text';
    container.appendChild(button);
    await button.updateComplete;

    const labelContainer = button.shadowRoot?.querySelector('.label');
    expect(labelContainer).not.toBeNull();
    const slot = labelContainer?.querySelector('slot');
    expect(slot).not.toBeNull();
  });

  test('supports icon-start and icon-end simultaneously', async () => {
    const button = document.createElement('er-button') as ErButton;
    button.setAttribute('icon-start', 'arrow_back');
    button.setAttribute('icon-end', 'arrow_forward');
    button.setAttribute('label', 'Navigate');
    container.appendChild(button);
    await button.updateComplete;

    const icons = button.shadowRoot?.querySelectorAll('er-icon');
    expect(icons?.length).toBe(2);
    expect(icons?.[0].getAttribute('icon')).toBe('arrow_back');
    expect(icons?.[1].getAttribute('icon')).toBe('arrow_forward');
  });

  test('defines icon fixed size and label height matching 1em so icon does not affect button height', () => {
    const styles = ErButton.styles;
    const styleStrings = (Array.isArray(styles) ? styles : [styles]).map((s) =>
      s.toString(),
    );
    const combinedStyles = styleStrings.join('\n');

    expect(combinedStyles).toContain('--er-icon-font-size');
    expect(combinedStyles).toContain('--er-button-font-size');

    // er-icon styles inside shadow DOM
    expect(combinedStyles).toMatch(/er-icon\s*{[^}]*height:\s*1em/);
    expect(combinedStyles).toMatch(/er-icon\s*{[^}]*width:\s*1em/);
    expect(combinedStyles).toMatch(/er-icon\s*{[^}]*border:\s*none/);

    // .label styles
    expect(combinedStyles).toMatch(/\.label\s*{[^}]*height:\s*1em/);
    expect(combinedStyles).toMatch(/\.label\s*{[^}]*line-height:\s*1/);
  });

  test('defines standard theme font size classes and responsive breakpoints in styles', () => {
    const styles = ErButton.styles;
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

  test('defines variants and theme classes in styles', () => {
    const styles = ErButton.styles;
    const styleStrings = (Array.isArray(styles) ? styles : [styles]).map((s) =>
      s.toString(),
    );
    const combinedStyles = styleStrings.join('\n');

    expect(combinedStyles).toContain('.primary');
    expect(combinedStyles).toContain('.secondary');
    expect(combinedStyles).toContain('.tertiary');
    expect(combinedStyles).toContain('.themePrimary');
    expect(combinedStyles).toContain('.themeSecondary');
    expect(combinedStyles).toContain('.themeTertiary');
    expect(combinedStyles).toContain('.themeError');
  });
});
