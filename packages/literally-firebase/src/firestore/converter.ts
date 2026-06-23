import {
  QueryDocumentSnapshot,
  type SnapshotOptions,
} from 'firebase/firestore';

export interface FBConverter<Type> {
  toFirestore: (data: Type) => any;
  fromFirestore: (
    snap: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ) => Type;
}
