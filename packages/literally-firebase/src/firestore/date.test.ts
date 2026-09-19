import { Timestamp } from 'firebase/firestore';
import { describe, test, expect } from 'vitest';

import { toDate, toTimestamp } from './date.js';

describe('Date and Timestamp utilities', () => {
  describe('toDate', () => {
    test('converts Timestamp to Date', () => {
      const now = new Date();
      const ts = Timestamp.fromDate(now);
      const res = toDate(ts);

      expect(res).toBeInstanceOf(Date);
      expect(res?.getTime()).toBe(now.getTime());
    });

    test('returns existing valid Date', () => {
      const now = new Date();
      expect(toDate(now)).toBe(now);
    });

    test('converts ISO string to Date', () => {
      const iso = '2026-06-15T12:00:00.000Z';
      const res = toDate(iso);

      expect(res).toBeInstanceOf(Date);
      expect(res?.toISOString()).toBe(iso);
    });

    test('converts numeric milliseconds to Date', () => {
      const ms = 1781524800000;
      const res = toDate(ms);

      expect(res).toBeInstanceOf(Date);
      expect(res?.getTime()).toBe(ms);
    });

    test('returns undefined for invalid or null inputs', () => {
      expect(toDate(null)).toBeUndefined();
      expect(toDate(undefined)).toBeUndefined();
      expect(toDate('not-a-date')).toBeUndefined();
      expect(toDate(new Date('invalid'))).toBeUndefined();
    });
  });

  describe('toTimestamp', () => {
    test('returns existing Timestamp instance', () => {
      const ts = Timestamp.now();
      expect(toTimestamp(ts)).toBe(ts);
    });

    test('converts Date to Timestamp', () => {
      const date = new Date('2026-06-15T12:00:00.000Z');
      const ts = toTimestamp(date);

      expect(ts).toBeInstanceOf(Timestamp);
      expect(ts?.toMillis()).toBe(date.getTime());
    });

    test('converts ISO string to Timestamp', () => {
      const iso = '2026-06-15T12:00:00.000Z';
      const ts = toTimestamp(iso);

      expect(ts).toBeInstanceOf(Timestamp);
      expect(ts?.toMillis()).toBe(new Date(iso).getTime());
    });

    test('returns null for null, undefined, or invalid inputs', () => {
      expect(toTimestamp(null)).toBeNull();
      expect(toTimestamp(undefined)).toBeNull();
      expect(toTimestamp('invalid-date')).toBeNull();
    });
  });
});
