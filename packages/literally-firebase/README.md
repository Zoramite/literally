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

### Type-Safe Firestore Converters (`FBConverter<Type>`)

`FBConverter<Type>` defines the Firestore data converter interface for strongly typed reads and writes:

```typescript
import { type FBConverter } from '@littoral/literally-firebase/firestore/converter';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export const userProfileConverter: FBConverter<UserProfile> = {
  toFirestore: (user: UserProfile) => ({
    name: user.name,
    email: user.email,
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: data.name,
      email: data.email,
    };
  },
};
```

---

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for planned features, reactive controllers, converter enhancements, and testing utilities.

---

## License

[MIT](LICENSE)
