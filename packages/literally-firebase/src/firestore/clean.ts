export interface CleanFirestoreDataOptions {
  /**
   * If true, replaces undefined property values with null instead of omitting them.
   * Default: false (omits undefined properties).
   */
  replaceUndefinedWithNull?: boolean;

  /**
   * If true, filters out undefined elements from arrays.
   * Default: true.
   */
  filterArrayUndefined?: boolean;
}

/**
 * Checks if a value is a plain JavaScript object literal (`{}`) or `Object.create(null)`.
 * Returns false for Firestore SDK classes (Timestamp, FieldValue, DocumentReference, GeoPoint, Bytes),
 * JavaScript Date, RegExp, Map, Set, and custom class instances.
 */
function isPlainObject(value: unknown): value is Record<string, any> {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

/**
 * Recursively cleans an object or array to make it safe for Firestore writes.
 *
 * Firestore throws an runtime error when saving properties with `undefined` values.
 * This utility traverses plain objects and removes `undefined` properties (or optionally converts
 * them to `null`), while keeping Firestore types (`Timestamp`, `FieldValue`, `DocumentReference`,
 * `GeoPoint`, etc.) and native instances (`Date`) completely intact.
 *
 * @param data The data object or array to sanitize.
 * @param options Sanitization options.
 * @returns A clean object safe to pass to `setDoc`, `updateDoc`, or `toFirestore`.
 *
 * @example
 * ```typescript
 * const cleaned = cleanFirestoreData({
 *   name: 'Camp Alpha',
 *   notes: undefined, // stripped out
 *   timestamp: serverTimestamp(), // preserved
 *   tags: ['tag1', undefined], // undefined filtered out
 * });
 * ```
 */
export function cleanFirestoreData<T = any>(
  data: T,
  options: CleanFirestoreDataOptions = {},
): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    const cleanedArr = data
      .map((item) => cleanFirestoreData(item, options))
      .filter((item) =>
        options.filterArrayUndefined !== false ? item !== undefined : true,
      );
    return cleanedArr as unknown as T;
  }

  if (isPlainObject(data)) {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) {
        if (options.replaceUndefinedWithNull) {
          result[key] = null;
        }
        // Otherwise, omit the undefined property entirely
      } else {
        result[key] = cleanFirestoreData(value, options);
      }
    }
    return result as unknown as T;
  }

  return data;
}
