import { Timestamp } from 'firebase/firestore';
import { describe, test, expect } from 'vitest';

import { createConverter } from './create-converter.js';

describe('createConverter', () => {
  interface User {
    id: string;
    name: string;
    birthDate?: Date;
    notes?: string;
    meta?: {
      lastLogin?: Date;
    };
  }

  const createMockSnapshot = (id: string, data: any) => ({
    id,
    data: () => data,
    exists: () => true,
    get: (field: string) => data[field],
  });

  test('converts toFirestore with undefined stripping and Date to Timestamp conversion', () => {
    const converter = createConverter<User>({
      idField: 'id',
      dateFields: ['birthDate', 'meta.lastLogin'],
      cleanUndefined: true,
    });

    const user: User = {
      id: 'user-1',
      name: 'Alice',
      birthDate: new Date('2000-01-01T00:00:00Z'),
      notes: undefined,
      meta: {
        lastLogin: new Date('2026-06-01T12:00:00Z'),
      },
    };

    const firestoreData = converter.toFirestore(user);

    expect(firestoreData.id).toBe('user-1');
    expect(firestoreData.name).toBe('Alice');
    expect(firestoreData.birthDate).toBeInstanceOf(Timestamp);
    expect(firestoreData.birthDate.toMillis()).toBe(user.birthDate!.getTime());
    expect(firestoreData.meta.lastLogin).toBeInstanceOf(Timestamp);
    expect('notes' in firestoreData).toBe(false);
  });

  test('excludes idField on write when excludeIdOnWrite is true', () => {
    const converter = createConverter<User>({
      idField: 'id',
      excludeIdOnWrite: true,
    });

    const user: User = {
      id: 'user-1',
      name: 'Bob',
    };

    const firestoreData = converter.toFirestore(user);

    expect('id' in firestoreData).toBe(false);
    expect(firestoreData.name).toBe('Bob');
  });

  test('converts fromFirestore by injecting ID and converting Timestamps to Dates', () => {
    const converter = createConverter<User>({
      idField: 'id',
      dateFields: ['birthDate', 'meta.lastLogin'],
    });

    const birthTimestamp = Timestamp.fromDate(new Date('2005-05-15T00:00:00Z'));
    const loginTimestamp = Timestamp.fromDate(new Date('2026-09-01T10:00:00Z'));

    const snap = createMockSnapshot('doc-123', {
      name: 'Charlie',
      birthDate: birthTimestamp,
      meta: {
        lastLogin: loginTimestamp,
      },
    });

    const user = converter.fromFirestore(snap as any, {} as any);

    expect(user.id).toBe('doc-123');
    expect(user.name).toBe('Charlie');
    expect(user.birthDate).toBeInstanceOf(Date);
    expect(user.birthDate?.toISOString()).toBe('2005-05-15T00:00:00.000Z');
    expect(user.meta?.lastLogin).toBeInstanceOf(Date);
    expect(user.meta?.lastLogin?.toISOString()).toBe(
      '2026-09-01T10:00:00.000Z',
    );
  });

  test('supports custom toFirestore and fromFirestore overrides', () => {
    class UserModel {
      constructor(
        public id: string,
        public displayName: string,
      ) {}
    }

    const converter = createConverter<UserModel>({
      idField: 'id',
      toFirestore: (model) => ({
        nameUpper: model.displayName.toUpperCase(),
      }),
      fromFirestore: (data, snap) => {
        return new UserModel(snap.id, data.nameUpper.toLowerCase());
      },
    });

    const model = new UserModel('u1', 'Dave');
    const toData = converter.toFirestore(model);
    expect(toData).toEqual({ nameUpper: 'DAVE' });

    const snap = createMockSnapshot('u1', { nameUpper: 'DAVE' });
    const fromModel = converter.fromFirestore(snap as any, {} as any);
    expect(fromModel).toBeInstanceOf(UserModel);
    expect(fromModel.displayName).toBe('dave');
  });

  test('supports idField: false to skip ID injection', () => {
    const converter = createConverter<{ name: string }>({
      idField: false,
    });

    const snap = createMockSnapshot('ignored-id', { name: 'Eve' });
    const res = converter.fromFirestore(snap as any, {} as any);

    expect('id' in res).toBe(false);
    expect(res.name).toBe('Eve');
  });
});
