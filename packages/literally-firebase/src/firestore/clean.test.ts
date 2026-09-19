import { Timestamp } from 'firebase/firestore';
import { describe, test, expect } from 'vitest';

import { cleanFirestoreData } from './clean.js';

describe('cleanFirestoreData', () => {
  test('strips undefined properties from shallow objects', () => {
    const input = {
      name: 'Alpha',
      count: 0,
      active: false,
      emptyString: '',
      nullValue: null,
      missing: undefined,
    };

    const output = cleanFirestoreData(input);

    expect(output).toEqual({
      name: 'Alpha',
      count: 0,
      active: false,
      emptyString: '',
      nullValue: null,
    });
    expect('missing' in output).toBe(false);
  });

  test('strips undefined properties from nested objects', () => {
    const input = {
      user: {
        id: '123',
        profile: {
          bio: undefined,
          avatar: 'https://example.com/avatar.png',
        },
      },
    };

    const output = cleanFirestoreData(input);

    expect(output).toEqual({
      user: {
        id: '123',
        profile: {
          avatar: 'https://example.com/avatar.png',
        },
      },
    });
  });

  test('handles arrays and cleans objects inside arrays', () => {
    const input = {
      tags: ['a', undefined, 'b'],
      items: [
        { id: 1, note: undefined },
        { id: 2, note: 'valid' },
      ],
    };

    const output = cleanFirestoreData(input);

    expect(output.tags).toEqual(['a', 'b']);
    expect(output.items).toEqual([{ id: 1 }, { id: 2, note: 'valid' }]);
  });

  test('replaces undefined with null when replaceUndefinedWithNull is true', () => {
    const input = {
      name: 'Beta',
      optionalVal: undefined,
    };

    const output = cleanFirestoreData(input, {
      replaceUndefinedWithNull: true,
    });

    expect(output).toEqual({
      name: 'Beta',
      optionalVal: null,
    });
  });

  test('preserves Timestamp, Date, and special class instances', () => {
    const date = new Date('2026-06-15T00:00:00Z');
    const ts = Timestamp.fromDate(date);

    const input = {
      createdDate: date,
      createdTimestamp: ts,
      notes: undefined,
    };

    const output = cleanFirestoreData(input);

    expect(output.createdDate).toBe(date);
    expect(output.createdTimestamp).toBe(ts);
    expect('notes' in output).toBe(false);
  });

  test('handles primitives and null/undefined gracefully', () => {
    expect(cleanFirestoreData(null)).toBeNull();
    expect(cleanFirestoreData(undefined)).toBeUndefined();
    expect(cleanFirestoreData('hello')).toBe('hello');
    expect(cleanFirestoreData(123)).toBe(123);
  });
});
