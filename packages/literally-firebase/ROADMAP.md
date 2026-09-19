# `@littoral/literally-firebase` Feature Roadmap

This roadmap outlines planned features, architectural improvements, and ergonomics enhancements for `@littoral/literally-firebase`. The goal is to evolve the package from a lightweight Firestore watcher mixin into a comprehensive, reactive Firebase toolkit tailored for [Lit](https://lit.dev) and `@littoral/literally` web applications.

---

## 1. Reactive Firestore Controllers

### Motivation

`FirestoreListenerMixin` requires consumers to rely on class inheritance, leading to deep mixin chains (e.g. `SCCampsOverview extends CampsMixin(FirestoreListenerMixin(ApiManagerConsumerMixin(SCBase)))`). Moreover, the mixin only tracks unsubscription functions; components must still manually declare `@state()` properties, handle loading/error states, call `requestUpdate()`, and manage string-based watcher keys.

[Lit Reactive Controllers](https://lit.dev/docs/composition/controllers/) allow multi-instance composition without inheritance, encapsulating the entire subscription lifecycle and reactive state.

### Planned Features

- **`FirestoreDocController<T>`**: Subscribes to a single Firestore document.
  - **Reactive Properties**:
    - `data: T | undefined` — Deserialized document payload.
    - `loading: boolean` — True while waiting for initial snapshot.
    - `error?: Error` — Captured Firestore read or permission error.
    - `exists: boolean` — Whether the document exists in Firestore.
    - `isFromCache: boolean` — Whether data was returned from local cache.
    - `hasPendingWrites: boolean` — Whether the snapshot has uncommitted local mutations.
  - **Lifecycle**: Automatically starts listening on `hostConnected()` and unsubscribes on `hostDisconnected()`.
  - **Dynamic Targets**: Accepts a reactive factory function `ref: () => DocumentReference<T> | null`. When dependencies change, it cleanly tears down the prior listener and connects to the new reference.

- **`FirestoreQueryController<T>`**: Subscribes to a collection or complex query.
  - **Reactive Properties**:
    - `data: T[]` — Array of typed items.
    - `loading: boolean` — Initial query loading indicator.
    - `error?: Error` — Captured query error.
    - `count: number` — Size of result set.
    - `empty: boolean` — Convenient empty-state check.
  - **Dynamic Targets**: Accepts `query: () => Query<T> | null` to automatically re-subscribe when query parameters (e.g. filters, sorting, search keys) update.

### Proposed API Example

```typescript
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { doc, collection, query, where } from 'firebase/firestore';
import {
  FirestoreDocController,
  FirestoreQueryController,
} from '@littoral/literally-firebase/firestore';
import { db } from '../firebase';
import { userConverter, taskConverter, type User, type Task } from '../models';

@customElement('user-dashboard')
export class UserDashboard extends LitElement {
  @property() userId!: string;

  // Document controller
  private user = new FirestoreDocController<User>(this, {
    ref: () =>
      this.userId
        ? doc(db, 'users', this.userId).withConverter(userConverter)
        : null,
  });

  // Query controller
  private tasks = new FirestoreQueryController<Task>(this, {
    query: () =>
      this.userId
        ? query(
            collection(db, 'tasks'),
            where('assigneeId', '==', this.userId),
          ).withConverter(taskConverter)
        : null,
  });

  render() {
    if (this.user.loading || this.tasks.loading) {
      return html`<er-card>Loading dashboard...</er-card>`;
    }
    if (this.user.error) {
      return html`<er-card class="themeError"
        >Error: ${this.user.error.message}</er-card
      >`;
    }

    return html`
      <h2>${this.user.data?.name}</h2>
      <p>Active Tasks: ${this.tasks.count}</p>
      <ul>
        ${this.tasks.data.map((task) => html`<li>${task.title}</li>`)}
      </ul>
    `;
  }
}
```

---

## 2. Serialization & Converter Toolkit

### Motivation

1. **Firestore `undefined` Field Crashes**: Firestore rejects objects containing `undefined` values (`Unsupported field value: undefined`), requiring tedious manual checks (`if (obj.field) data.field = ...`) across domain models.
2. **Timestamp <-> Date Boilerplate**: Converting between Firestore `Timestamp` objects and standard JavaScript `Date` instances is repeated manually across every entity converter.
3. **Document ID Injection**: Deserializing snapshots typically requires boilerplate to attach `snapshot.id` onto the returned model.

### Planned Features

- **`cleanFirestoreData<T>(data: T): Record<string, any>`**: Recursively removes `undefined` properties or normalizes them to omit/fallback values before writes.
- **`createConverter<T>(options)`**: A declarative converter factory that builds an `FBConverter<T>` with built-in:
  - Automatic `id` property injection (`idField: 'id'`).
  - Transparent `Date` <-> `Timestamp` bidirectional mapping for declared date fields.
  - Automatic removal of `undefined` fields during `toFirestore`.
- **Date/Timestamp Helper Utilities**:
  - `toDate(value: Timestamp | Date | string | null | undefined): Date | undefined`
  - `toTimestamp(value: Date | string | null | undefined): Timestamp | null`

### Proposed API Example

```typescript
import {
  createConverter,
  cleanFirestoreData,
} from '@littoral/literally-firebase/firestore';

export interface CampInfo {
  id: string;
  name: string;
  startOn: Date;
  endOn: Date;
  notes?: string;
}

export const campConverter = createConverter<CampInfo>({
  idField: 'id',
  dateFields: ['startOn', 'endOn'],
  cleanUndefined: true,
});

// Or use standalone data cleaner for ad-hoc updates:
await updateDoc(
  campDocRef,
  cleanFirestoreData({
    notes: newNotes || undefined, // safely stripped without throwing
  }),
);
```

---

## 3. Reactive Authentication Controller & Helpers

### Motivation

Authentication handling in client apps often reinvents token resolution, custom claims inspection, and mobile Safari/popup blocking workarounds (e.g. `auth/popup-blocked` fallback to `signInWithRedirect`).

### Planned Features

- **`AuthController`**: A Reactive Controller that connects to Firebase `Auth` to provide component-level reactivity:
  - `user: User | null` — Currently signed-in user.
  - `claims: Record<string, any>` — Extracted custom claims from the ID token.
  - `loading: boolean` — Initial auth state / token refresh resolution.
  - `isLoggedIn: boolean` — Convenience boolean.
  - `hasClaim(claim: string, value?: any): boolean` — Role and permission checking helper.
- **`signInWithGoogleWithFallback(auth, provider?, options?)`**: Helper function that attempts `signInWithPopup` and automatically falls back to `signInWithRedirect` when popups are blocked on iOS/mobile browsers.
- **Sign-Out Events & Lifecycle**: Standardized `signOutUser(auth)` dispatcher.

### Proposed API Example

```typescript
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import {
  AuthController,
  signInWithGoogleWithFallback,
} from '@littoral/literally-firebase/auth';
import { auth } from '../firebase';

@customElement('auth-status-bar')
export class AuthStatusBar extends LitElement {
  private authCtrl = new AuthController(this, { auth });

  private handleLogin = async () => {
    await signInWithGoogleWithFallback(auth);
  };

  render() {
    if (this.authCtrl.loading) {
      return html`<er-spacer>Authenticating...</er-spacer>`;
    }

    if (!this.authCtrl.isLoggedIn) {
      return html`<er-button @click=${this.handleLogin}>Sign In</er-button>`;
    }

    return html`
      <div>
        <span>Welcome, ${this.authCtrl.user?.displayName}</span>
        ${this.authCtrl.hasClaim('admin') ? html`<er-chip label="Admin"></er-chip>` : ''}
      </div>
    `;
  }
}
```

---

## 4. Dependency Injection via `@lit/context`

### Motivation

Client apps frequently import Firebase instances as module-level singletons (`import { db, auth } from '../firebase'`), which tightly couples components to global instances and complicates unit testing, multi-tenant setups, and emulator integration.

### Planned Features

- **Standard Context Identifiers**:
  - `firebaseAppContext` (`FirebaseApp`)
  - `firestoreContext` (`Firestore`)
  - `firebaseAuthContext` (`Auth`)
  - `firebaseFunctionsContext` (`Functions`)
  - `firebaseStorageContext` (`FirebaseStorage`)
- **Controller Context Auto-Resolution**: Allow `FirestoreDocController`, `FirestoreQueryController`, and `AuthController` to optionally discover their database or auth instance via `@lit/context` if not explicitly passed in options.
- **Emulator Setup Utility**:
  - `connectEmulators(options)`: Standard helper to configure local Firestore, Auth, Storage, and Functions emulators consistently in dev/test environments.

---

## 5. Cloud Functions Integration & `ProcessingMixin` Bridge

### Motivation

Invoking Cloud Functions (`httpsCallable`) requires repeated error handling, loading states, and status synchronization with `@littoral/literally`'s `ProcessingMixin`.

### Planned Features

- **`callFunctionWithProcessing<TReq, TRes>(functions, name, data, element)`**:
  - Automatically wraps execution with `ProcessingMixin`'s `wrapAsyncProcessing`.
  - Normalizes Firebase Functions error codes (`functions/unauthenticated`, `functions/permission-denied`, `functions/not-found`) into user-friendly error messages.
  - Automatically deserializes nested ISO date strings / timestamp payloads.
- **`FunctionCallController<TReq, TRes>`**:
  - Reactive controller maintaining `{ calling: boolean, error?: Error, result?: TRes }`.

### Proposed API Example

```typescript
const result = await callFunctionWithProcessing<
  OrderPayload,
  OrderConfirmation
>(
  functions,
  'createOrder',
  orderData,
  this, // LitElement implementing ProcessingMixin
);
```

---

## 6. Firebase Storage Reactive Controller

### Motivation

Media and file uploads (e.g. photo cards, profile avatars, documents) require manual event listeners on `UploadTask`, calculating percentage progress, handling upload errors, and resolving `getDownloadURL`.

### Planned Features

- **`StorageUploadController`**:
  - Exposes reactive properties:
    - `progressPercent: number` (0 to 100).
    - `bytesTransferred: number`.
    - `totalBytes: number`.
    - `downloadUrl?: string`.
    - `isUploading: boolean`.
    - `error?: Error`.
  - Simple invocation: `upload(path: string, file: File | Blob, metadata?: UploadMetadata): Promise<string>`.
  - Cancel and pause capabilities: `cancel()`, `pause()`, `resume()`.

---

## 7. Testing & Emulation Harness (`/testing`)

### Motivation

Testing components or services against Firestore requires significant boilerplate around `@firebase/rules-unit-testing`, generating unique project IDs per test suite to prevent concurrency issues, and creating mock authenticated contexts.

### Planned Features

- Subpath export: `@littoral/literally-firebase/testing`
- **`createRulesTestEnvironment(options)`**: Wraps `@firebase/rules-unit-testing` with automatic project ID namespacing and emulator port detection.
- **`mockDocumentSnapshot<T>(id, data)`**: Lightweight mock snapshot generator for fast UI component tests without requiring running emulators.
- **`mockQuerySnapshot<T>(items)`**: Mock query snapshot generator with matching converter behavior.

---

## Phased Implementation Roadmap

| Milestone                                | Features Included                                                                                                                                                 | Target Goal                                                                                         |
| :--------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| **Phase 1: Reactivity & Data Safety**    | • `cleanFirestoreData` & `createConverter`<br>• Date / Timestamp helper utilities<br>• `FirestoreDocController`<br>• `FirestoreQueryController`                   | Eliminate converter boilerplate and replace mixin-based listeners with clean, reactive controllers. |
| **Phase 2: Auth & Context**              | • `AuthController`<br>• `signInWithGoogleWithFallback`<br>• `@lit/context` definitions (`firestoreContext`, `authContext`)<br>• Controller context auto-discovery | Standardize authentication, claims, and dependency injection across apps.                           |
| **Phase 3: Extended Services & Testing** | • `ProcessingMixin` Cloud Functions caller<br>• `StorageUploadController`<br>• `@littoral/literally-firebase/testing` utilities                                   | Streamline file uploads, backend RPC invocations, and unit testing workflows.                       |
