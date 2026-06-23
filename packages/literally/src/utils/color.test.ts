import { describe, test, expect } from 'vitest';

import { contrast, hexToRgb, luminance } from './color';

describe('Color Utilities', () => {
  test('hexToRgb converts colors correctly', () => {
    expect(hexToRgb('#ffffff')).toEqual({ red: 255, green: 255, blue: 255 });
    expect(hexToRgb('#000')).toEqual({ red: 0, green: 0, blue: 0 });
    expect(hexToRgb('invalid')).toBeNull();
  });

  test('luminance calculates brightness', () => {
    expect(luminance({ red: 255, green: 255, blue: 255 })).toBe(1);
    expect(luminance({ red: 0, green: 0, blue: 0 })).toBe(0);
  });

  test('contrast calculates ratio', () => {
    const white = { red: 255, green: 255, blue: 255 };
    const black = { red: 0, green: 0, blue: 0 };
    expect(contrast(white, black)).toBeCloseTo(21, 0);
  });
});
