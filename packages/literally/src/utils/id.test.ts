import { describe, expect, test } from 'vitest';

import { randomId } from './id';

describe('id', () => {
  describe('randomId', () => {
    test('default length for id', async () => {
      expect(randomId().length).toBe(6);
    });

    test('longer length for id', async () => {
      expect(randomId(120).length).toBe(120);
    });

    test('fail without proper length', async () => {
      expect(() => {
        randomId(0);
      }).toThrow();
    });
  });
});
