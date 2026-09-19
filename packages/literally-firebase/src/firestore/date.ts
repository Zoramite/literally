import { Timestamp } from 'firebase/firestore';

/**
 * Safely converts a value into a native JavaScript `Date` instance.
 *
 * Supports Firestore `Timestamp` instances, existing `Date` objects, ISO date strings,
 * and unix millisecond timestamps.
 *
 * @param value The value to convert.
 * @returns A valid `Date` instance, or `undefined` if the value is null/undefined or invalid.
 *
 * @example
 * ```typescript
 * toDate(doc.get('startOn')); // Date from Timestamp
 * toDate('2026-06-15T09:00:00Z'); // Date from ISO string
 * toDate(null); // undefined
 * ```
 */
export function toDate(
  value: Timestamp | Date | string | number | null | undefined,
): Date | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? undefined : value;
  }

  if (typeof (value as any).toDate === 'function') {
    return (value as any).toDate();
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d;
  }

  return undefined;
}

/**
 * Safely converts a value into a Firestore `Timestamp` instance.
 *
 * Supports native JavaScript `Date` instances, existing `Timestamp` instances,
 * ISO date strings, and unix millisecond timestamps.
 *
 * @param value The value to convert.
 * @returns A Firestore `Timestamp` instance, or `null` if the value is null/undefined or invalid.
 *
 * @example
 * ```typescript
 * toTimestamp(new Date()); // Timestamp
 * toTimestamp('2026-06-15'); // Timestamp
 * toTimestamp(null); // null
 * ```
 */
export function toTimestamp(
  value: Date | Timestamp | string | number | null | undefined,
): Timestamp | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Timestamp) {
    return value;
  }

  if (typeof (value as any).toDate === 'function') {
    return value as unknown as Timestamp;
  }

  const d = toDate(value);
  if (!d) {
    return null;
  }

  return Timestamp.fromDate(d);
}
