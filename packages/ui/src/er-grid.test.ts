// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { ErGrid, ErGridItem } from './er-grid';
import './er-grid';

describe('ErGrid and ErGridItem', () => {
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

  test('instantiates and renders ErGrid with a slot', async () => {
    const grid = document.createElement('er-grid') as ErGrid;
    container.appendChild(grid);
    await grid.updateComplete;

    expect(grid.shadowRoot?.querySelector('slot')).not.toBeNull();
  });

  test('instantiates and renders ErGridItem with a slot', async () => {
    const item = document.createElement('er-grid-item') as ErGridItem;
    container.appendChild(item);
    await item.updateComplete;

    expect(item.shadowRoot?.querySelector('slot')).not.toBeNull();
  });

  test('defines subgrid styles in ErGrid', () => {
    const styles = ErGrid.styles;
    const styleStrings = (Array.isArray(styles) ? styles : [styles]).map((s) =>
      s.toString(),
    );
    const combinedStyles = styleStrings.join('\n');

    expect(combinedStyles).toContain('.sub');
    expect(combinedStyles).toContain('subgrid');
    expect(combinedStyles).toContain('grid-column: 1 / -1');
    expect(combinedStyles).toContain(':host(:not(.sub))');
  });

  test('defines subgrid bridging styles in ErGridItem', () => {
    const styles = ErGridItem.styles;
    const styleStrings = (Array.isArray(styles) ? styles : [styles]).map((s) =>
      s.toString(),
    );
    const combinedStyles = styleStrings.join('\n');

    expect(combinedStyles).toContain('subgrid');
    expect(combinedStyles).toContain(':host(:has(> er-grid.sub))');
    expect(combinedStyles).toContain(':host(.subgrid)');
    expect(combinedStyles).toContain(':host(.full)');
  });

  test('renders nested subgrid hierarchy without errors', async () => {
    const rootGrid = document.createElement('er-grid') as ErGrid;
    const parentItem = document.createElement('er-grid-item') as ErGridItem;
    parentItem.setAttribute('span', 'desktop:4; mobile:2');

    const subGrid = document.createElement('er-grid') as ErGrid;
    subGrid.classList.add('sub');

    const childItem1 = document.createElement('er-grid-item') as ErGridItem;
    childItem1.setAttribute('span', 'desktop:2; mobile:1');
    childItem1.textContent = 'Sub item 1';

    const childItem2 = document.createElement('er-grid-item') as ErGridItem;
    childItem2.setAttribute('span', 'desktop:2; mobile:1');
    childItem2.textContent = 'Sub item 2';

    subGrid.appendChild(childItem1);
    subGrid.appendChild(childItem2);
    parentItem.appendChild(subGrid);
    rootGrid.appendChild(parentItem);
    container.appendChild(rootGrid);

    await Promise.all([
      rootGrid.updateComplete,
      parentItem.updateComplete,
      subGrid.updateComplete,
      childItem1.updateComplete,
      childItem2.updateComplete,
    ]);

    expect(rootGrid.shadowRoot?.querySelector('slot')).not.toBeNull();
    expect(parentItem.shadowRoot?.querySelector('slot')).not.toBeNull();
    expect(subGrid.shadowRoot?.querySelector('slot')).not.toBeNull();
    expect(subGrid.classList.contains('sub')).toBe(true);
    expect(subGrid.children.length).toBe(2);
    expect(parentItem.classList.contains('subgrid')).toBe(true);
  });
});
