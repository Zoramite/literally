# `@littoral/literally-firebase` Feature Roadmap

This roadmap outlines planned features, architectural improvements, and ergonomics enhancements for `@littoral/literally-firebase`. The goal is to evolve the package from a lightweight Firestore watcher mixin into a comprehensive, reactive Firebase toolkit tailored for [Lit](https://lit.dev) and `@littoral/literally` web applications.

---

## 1. Dependency Injection via `@lit/context`

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

## 2. Cloud Functions Integration & `ProcessingMixin` Bridge

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

## 3. Firebase Storage Reactive Controller

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

## 4. Testing & Emulation Harness (`/testing`)

### Motivation

Testing components or services against Firestore requires significant boilerplate around `@firebase/rules-unit-testing`, generating unique project IDs per test suite to prevent concurrency issues, and creating mock authenticated contexts.

### Planned Features

- Subpath export: `@littoral/literally-firebase/testing`
- **`createRulesTestEnvironment(options)`**: Wraps `@firebase/rules-unit-testing` with automatic project ID namespacing and emulator port detection.
- **`mockDocumentSnapshot<T>(id, data)`**: Lightweight mock snapshot generator for fast UI component tests without requiring running emulators.
- **`mockQuerySnapshot<T>(items)`**: Mock query snapshot generator with matching converter behavior.

---

## Phased Implementation Roadmap

| Milestone                                | Features Included                                                                                                                                                         | Status           | Target Goal                                                                                         |
| :--------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------- | :-------------------------------------------------------------------------------------------------- |
| **Phase 1: Reactivity & Data Safety**    | • `cleanFirestoreData` & `createConverter`<br>• Date / Timestamp helper utilities (`toDate`, `toTimestamp`)<br>• `FirestoreDocController`<br>• `FirestoreQueryController` | ✅ **Completed** | Eliminate converter boilerplate and replace mixin-based listeners with clean, reactive controllers. |
| **Phase 2: Auth & Context**              | • `AuthController`<br>• `signInWithGoogleWithFallback`<br>• `@lit/context` definitions (`firestoreContext`, `authContext`)<br>• Controller context auto-discovery         | 🔄 In Progress   | Standardize authentication, claims, and dependency injection across apps.                           |
| **Phase 3: Extended Services & Testing** | • `ProcessingMixin` Cloud Functions caller<br>• `StorageUploadController`<br>• `@littoral/literally-firebase/testing` utilities                                           | 📋 Planned       | Streamline file uploads, backend RPC invocations, and unit testing workflows.                       |
