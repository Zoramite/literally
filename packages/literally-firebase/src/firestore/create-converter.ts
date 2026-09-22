import {
  type QueryDocumentSnapshot,
  type SnapshotOptions,
} from 'firebase/firestore';

import { cleanFirestoreData } from './clean.js';
import { type FBConverter } from './converter.js';
import { toDate, toTimestamp } from './date.js';

export interface CreateConverterOptions<T> {
  /**
   * Property name on `T` to assign the Firestore document ID (`snapshot.id`).
   * Set to `false` to disable automatic document ID injection.
   * Default: `'id'`.
   */
  idField?: keyof T | string | false;

  /**
   * Whether to exclude the `idField` when writing to Firestore via `toFirestore`.
   * Default: `false`.
   */
  excludeIdOnWrite?: boolean;

  /**
   * List of property paths (including nested dot-notation paths) that should
   * automatically convert from `Date` (in JavaScript) to `Timestamp` (in Firestore)
   * on write, and from `Timestamp` back to `Date` on read.
   */
  dateFields?: (keyof T | string)[];

  /**
   * Whether to automatically strip `undefined` properties during `toFirestore`
   * using `cleanFirestoreData`.
   * Default: `true`.
   */
  cleanUndefined?: boolean;

  /**
   * Optional custom transformation function invoked during `toFirestore`.
   * Run before date field conversion and undefined cleaning.
   */
  toFirestore?: (data: T) => any;

  /**
   * Optional custom transformation function invoked during `fromFirestore`.
   * Run after ID injection and date field conversion.
   * Useful for instantiating custom class instances (e.g. `new MyModel(data)`).
   */
  fromFirestore?: (
    data: any,
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ) => T;
}

function getDeepProperty(obj: any, path: string): any {
  if (!obj || typeof obj !== 'object') {
    return undefined;
  }
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

function setDeepProperty(obj: any, path: string, value: any): void {
  const parts = path.split('.');
  const last = parts.pop()!;
  let target = obj;
  for (const part of parts) {
    if (!target[part] || typeof target[part] !== 'object') {
      target[part] = {};
    }
    target = target[part];
  }
  if (value === undefined) {
    delete target[last];
  } else {
    target[last] = value;
  }
}

/**
 * Creates a strongly typed `FBConverter<T>` compatible with Firestore's `withConverter()`.
 *
 * Provides out-of-the-box support for:
 * - Automatic document ID injection on read.
 * - Bidirectional `Date` <-> `Timestamp` conversion for specified date fields.
 * - Automatic `undefined` stripping to prevent runtime Firestore errors.
 * - Custom instantiation hooks for domain model classes.
 *
 * @example
 * ```typescript
 * export interface CampInfo {
 *   id: string;
 *   name: string;
 *   startOn: Date;
 *   endOn: Date;
 *   retail?: { isOvernight?: boolean };
 * }
 *
 * export const campConverter = createConverter<CampInfo>({
 *   idField: 'id',
 *   dateFields: ['startOn', 'endOn'],
 *   cleanUndefined: true,
 * });
 * ```
 */
export function createConverter<T = any>(
  options: CreateConverterOptions<T> = {},
): FBConverter<T> {
  const idKey =
    options.idField === false ? null : (options.idField as string) || 'id';

  return {
    toFirestore: (model: T): any => {
      let output: Record<string, any> = options.toFirestore
        ? options.toFirestore(model)
        : { ...(model as any) };

      // Exclude ID from written document if requested
      if (options.excludeIdOnWrite && idKey && output[idKey] !== undefined) {
        delete output[idKey];
      }

      // Convert date fields to Timestamps
      if (options.dateFields?.length) {
        for (const field of options.dateFields) {
          const path = String(field);
          const val = getDeepProperty(output, path);
          if (val !== undefined) {
            setDeepProperty(output, path, toTimestamp(val));
          }
        }
      }

      // Automatically strip undefined fields unless explicitly disabled
      if (options.cleanUndefined !== false) {
        output = cleanFirestoreData(output);
      }

      return output;
    },

    fromFirestore: (
      snapshot: QueryDocumentSnapshot,
      snapOptions: SnapshotOptions,
    ): T => {
      const raw = snapshot.data(snapOptions) ?? {};
      const data: Record<string, any> = { ...raw };

      // Inject document ID
      if (idKey) {
        data[idKey] = snapshot.id ?? data[idKey];
      }

      // Convert Timestamps to native Dates
      if (options.dateFields?.length) {
        for (const field of options.dateFields) {
          const path = String(field);
          const val = getDeepProperty(data, path);
          if (val !== undefined) {
            setDeepProperty(data, path, toDate(val));
          }
        }
      }

      // Invoke custom fromFirestore constructor/factory if supplied
      if (options.fromFirestore) {
        return options.fromFirestore(data, snapshot, snapOptions);
      }

      return data as T;
    },
  };
}
