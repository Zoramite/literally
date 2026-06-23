/**
 * @fileoverview Main entry point for the `@littoral/literally-firebase` package.
 * Exports Firestore utilities and Lit element mixins for integration.
 */

export { type FBConverter } from './firestore/converter';

export {
  FirestoreListenerMixin,
  type FirestoreListenerMixinInterface,
} from './mixins/firestore-watchers.mixin';
