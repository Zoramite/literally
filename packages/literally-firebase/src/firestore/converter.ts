import {
  QueryDocumentSnapshot,
  type SnapshotOptions,
} from 'firebase/firestore';

/**
 * Interface representing a Firestore data converter.
 * Compatible with the custom object converter pattern expected by Firebase Firestore's `withConverter`.
 *
 * This allows you to write type-safe queries and database operations using strongly typed model classes/interfaces
 * instead of raw Firestore DocumentData.
 *
 * @template Type The type representing the domain model class or interface.
 */
export interface FBConverter<Type> {
  /**
   * Converts a domain model object of type `Type` into a plain object suitable for saving to Firestore.
   *
   * @param data The domain model instance to serialize.
   * @returns A plain object suitable for writing to Firestore.
   */
  toFirestore: (data: Type) => any;

  /**
   * Converts a Firestore snapshot back into a strongly typed domain model object of type `Type`.
   *
   * @param snap The query document snapshot from Firestore.
   * @param options Snapshot conversion options provided by the Firestore SDK.
   * @returns The deserialized domain model instance.
   */
  fromFirestore: (
    snap: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ) => Type;
}
