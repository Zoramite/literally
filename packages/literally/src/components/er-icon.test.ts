// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { ErIcon } from './er-icon';
import './er-icon';

describe('ErIcon', () => {
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

  test('instantiates and renders ErIcon with icon symbol', async () => {
    const icon = document.createElement('er-icon') as ErIcon;
    icon.setAttribute('icon', 'star');
    container.appendChild(icon);
    await icon.updateComplete;

    const span = icon.shadowRoot?.querySelector('.material-symbols-outlined');
    expect(span).not.toBeNull();
    expect(span?.textContent).toBe('star');
  });

  test('defines icon font size on host and inherit in span styles', () => {
    const styles = ErIcon.styles;
    const styleStrings = (Array.isArray(styles) ? styles : [styles]).map((s) =>
      s.toString(),
    );
    const combinedStyles = styleStrings.join('\n');

    expect(combinedStyles).toContain(
      'font-size: var(--er-icon-font-size, 24px)',
    );
    expect(combinedStyles).toContain('font-size: inherit');
    expect(combinedStyles).toContain(
      'max-width: var(--er-icon-font-size, 1em)',
    );
  });
});
