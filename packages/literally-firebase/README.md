# `@littoral/literally-firebase`

Firebase Firestore integration utilities and reactive listener lifecycle mixins for Lit web components.

[![npm](https://img.shields.io/npm/v/@littoral/literally-firebase?style=flat-square)](https://www.npmjs.com/package/@littoral/literally-firebase)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## Installation

Install the package along with its peer dependencies:

```bash
npm install @littoral/literally-firebase @littoral/literally lit firebase
```

---

## Features

### Reactive Firestore Controllers (Recommended)

Lit Reactive Controllers provide declarative document and query subscriptions without deep mixin inheritance hierarchies. They automatically manage connection lifecycles (`hostConnected`/`hostDisconnected`), dynamic reference updates, and reactive states (`data`, `loading`, `error`, `exists`, `count`, `isFromCache`, `hasPendingWrites`).

#### `FirestoreDocController`

Subscribes to a single Firestore document. Supports static `DocumentReference` objects or reactive getter functions that re-evaluate when component properties change.

```typescript
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { doc, getFirestore } from 'firebase/firestore';
import { FirestoreDocController } from '@littoral/literally-firebase/firestore';
import { userConverter, type UserProfile } from './models';

@customElement('user-profile-card')
export class UserProfileCard extends LitElement {
  @property() userId!: string;

  private user = new FirestoreDocController<UserProfile>(this, {
    ref: () =>
      this.userId
        ? doc(getFirestore(), 'users', this.userId).withConverter(userConverter)
        : null,
  });

  render() {
    if (this.user.loading) return html`<p>Loading user data...</p>`;
    if (this.user.error) return html`<p>Error: ${this.user.error.message}</p>`;
    if (!this.user.exists) return html`<p>User not found.</p>`;

    return html`
      <div>
        <h3>${this.user.data?.name}</h3>
        <p>${this.user.data?.email}</p>
        ${this.user.isFromCache ? html`<small>(offline cache)</small>` : ''}
      </div>
    `;
  }
}
```

#### `FirestoreQueryController`

Subscribes to Firestore collections or queries with automatic mapping to typed arrays.

```typescript
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { collection, query, where, getFirestore } from 'firebase/firestore';
import { FirestoreQueryController } from '@littoral/literally-firebase/firestore';
import { taskConverter, type Task } from './models';

@customElement('task-list')
export class TaskList extends LitElement {
  @property({ type: Boolean }) completed = false;

  private tasks = new FirestoreQueryController<Task>(this, {
    query: () => {
      const col = collection(getFirestore(), 'tasks').withConverter(
        taskConverter,
      );
      return query(col, where('done', '==', this.completed));
    },
  });

  render() {
    if (this.tasks.loading) return html`<p>Loading tasks...</p>`;
    if (this.tasks.error)
      return html`<p>Error: ${this.tasks.error.message}</p>`;
    if (this.tasks.empty) return html`<p>No tasks found.</p>`;

    return html`
      <p>Count: ${this.tasks.count}</p>
      <ul>
        ${this.tasks.data.map((task) => html`<li>${task.title}</li>`)}
      </ul>
    `;
  }
}
```

---

### `FirestoreListenerMixin`

A LitElement mixin that simplifies managing Firebase Firestore real-time snapshot listeners (`onSnapshot`).

- Automatically tracks active unsubscribe functions by a unique key.
- Deduplicates watchers: re-registering a watcher under an existing key automatically unsubscribes the previous listener first.
- Prevents memory leaks by automatically unsubscribing all active listeners in the component's `disconnectedCallback` lifecycle hook.

#### Example Usage

```typescript
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { doc, onSnapshot, getFirestore } from 'firebase/firestore';
import { FirestoreListenerMixin } from '@littoral/literally-firebase/mixins/firestore-watchers.mixin';

@customElement('user-profile-card')
export class UserProfileCard extends FirestoreListenerMixin(LitElement) {
  @state() private userData: any = null;

  connectedCallback() {
    super.connectedCallback();
    this.subscribeToUser('user-123');
  }

  private subscribeToUser(userId: string) {
    const db = getFirestore();
    const userRef = doc(db, 'users', userId);

    // Register listener with a unique name
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      this.userData = snapshot.data();
    });

    // Automatically tracked and unsubscribed on disconnectedCallback()
    this.addFirebaseWatcher('user-subscription', unsubscribe);
  }

  render() {
    if (!this.userData) {
      return html`<p>Loading user data...</p>`;
    }

    return html`
      <div>
        <h3>${this.userData.name}</h3>
        <p>${this.userData.email}</p>
      </div>
    `;
  }
}
```

#### Mixin API

- `addFirebaseWatcher(name: string, watcher: Unsubscribe | undefined): void` &mdash; Registers or replaces a listener by name.
- `hasFirebaseWatcher(name: string): boolean` &mdash; Checks if a listener is currently registered.
- `stopFirebaseWatcher(name: string): void` &mdash; Unsubscribes and cleans up a specific listener by name.
- `clearFirebaseWatchers(): void` &mdash; Unsubscribes and clears all registered listeners.

---

---

### Converter & Serialization Toolkit

`@littoral/literally-firebase/firestore` provides utilities to create type-safe converters, eliminate runtime `undefined` field errors, and streamline `Date` <-> `Timestamp` conversions.

#### `createConverter<T>()`

A factory function creating an `FBConverter<T>` (compatible with `withConverter()`) with automated document ID injection, date conversion, and undefined property removal.

```typescript
import { createConverter } from '@littoral/literally-firebase/firestore';

export interface CampInfo {
  id: string;
  name: string;
  startOn: Date;
  endOn: Date;
  notes?: string;
  meta?: { lastModified?: Date };
}

export const campConverter = createConverter<CampInfo>({
  idField: 'id', // Injects snapshot.id on read (default: 'id')
  dateFields: ['startOn', 'endOn', 'meta.lastModified'], // Converts Date <-> Timestamp automatically
  cleanUndefined: true, // Strips undefined fields before writing (default: true)
});
```

#### `cleanFirestoreData(data, options?)`

Recursively removes `undefined` properties from an object or array before sending it to Firestore (e.g. via `setDoc` or `updateDoc`), preventing `Unsupported field value: undefined` crashes.

Preserves Firestore types (`Timestamp`, `FieldValue`, `DocumentReference`, `GeoPoint`, `Bytes`) and native `Date` instances intact.

```typescript
import {
  updateDoc,
  doc,
  serverTimestamp,
  getFirestore,
} from 'firebase/firestore';
import { cleanFirestoreData } from '@littoral/literally-firebase/firestore';

const db = getFirestore();
const campRef = doc(db, 'camps', 'camp-123');

await updateDoc(
  campRef,
  cleanFirestoreData({
    notes: userNote || undefined, // undefined values safely stripped
    updatedAt: serverTimestamp(), // FieldValue sentinels preserved
  }),
);
```

#### Date Utilities: `toDate` & `toTimestamp`

```typescript
import { toDate, toTimestamp } from '@littoral/literally-firebase/firestore';

const date = toDate(snapshot.get('createdOn')); // Date from Timestamp, ISO string, or number
const timestamp = toTimestamp(new Date()); // Firestore Timestamp from Date or string
```

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for planned features, reactive controllers, converter enhancements, and testing utilities.

---

## License

[MIT](LICENSE)
