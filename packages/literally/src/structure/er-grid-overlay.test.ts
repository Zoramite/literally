// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { ErGridOverlay } from './er-grid-overlay';
import './er-grid-overlay';

describe('ErGridOverlay', () => {
  let element: ErGridOverlay;

  beforeEach(() => {
    element = document.createElement('er-grid-overlay') as ErGridOverlay;
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element) {
      element.remove();
    }
  });

  test('does not render grid content when visible is false (default)', async () => {
    await element.updateComplete;
    expect(element.visible).toBe(false);
    expect(element.shadowRoot?.querySelector('.gridContainer')).toBeNull();
  });

  test('renders 12 columns with numbers when visible is true', async () => {
    element.visible = true;
    await element.updateComplete;

    expect(element.visible).toBe(true);
    const container = element.shadowRoot?.querySelector('.gridContainer');
    expect(container).not.toBeNull();

    const cols = element.shadowRoot?.querySelectorAll('.gridCol');
    expect(cols?.length).toBe(12);

    const firstColNumber = cols?.[0].querySelector('.gridColNumber');
    expect(firstColNumber?.textContent?.trim()).toBe('1');

    const lastColNumber = cols?.[11].querySelector('.gridColNumber');
    expect(lastColNumber?.textContent?.trim()).toBe('12');
  });

  test('toggles visible on Shift+G keyboard event', async () => {
    await element.updateComplete;
    expect(element.visible).toBe(false);

    // Trigger Shift + G
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'G',
        code: 'KeyG',
        shiftKey: true,
        bubbles: true,
        composed: true,
      }),
    );
    await element.updateComplete;

    expect(element.visible).toBe(true);

    // Trigger Shift + G again to toggle off
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'G',
        code: 'KeyG',
        shiftKey: true,
        bubbles: true,
        composed: true,
      }),
    );
    await element.updateComplete;

    expect(element.visible).toBe(false);
  });

  test('does not toggle when typing Shift+G inside an input element', async () => {
    const input = document.createElement('input');
    input.type = 'text';
    document.body.appendChild(input);

    await element.updateComplete;
    expect(element.visible).toBe(false);

    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'G',
        code: 'KeyG',
        shiftKey: true,
        bubbles: true,
        composed: true,
      }),
    );
    await element.updateComplete;

    expect(element.visible).toBe(false);

    input.remove();
  });
});
