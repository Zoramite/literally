# `literally`

A monorepo of Lit-based application structure, UI components, layout primitives, routing, lifecycle mixins, and Firebase utilities designed for modern web application development.

[![Storybook](https://img.shields.io/badge/Storybook-Live%20Demo-ff4785?style=flat-square&logo=storybook)](https://zoramite.github.io/literally/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

[**Explore the Storybook Gallery &rarr;**](https://zoramite.github.io/literally/)

---

## Packages

This repository contains three published packages:

| Package                                                       | Version                                                                                                                                           | Description                                                                             | Docs                                                                                                                                             |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`@littoral/literally`](packages/literally)                   | [![npm](https://img.shields.io/npm/v/@littoral/literally?style=flat-square)](https://www.npmjs.com/package/@littoral/literally)                   | Base application shell, client-side routing, navigation, lifecycle mixins, and theming  | [README](packages/literally/README.md) &bull; [Components](packages/literally/COMPONENTS.md) &bull; [Migration](packages/literally/MIGRATION.md) |
| [`@littoral/ui`](packages/ui)                                 | [![npm](https://img.shields.io/npm/v/@littoral/ui?style=flat-square)](https://www.npmjs.com/package/@littoral/ui)                                 | Themeable UI components, overlays, and responsive grid/flex layout primitives           | [README](packages/ui/README.md) &bull; [Components](packages/ui/COMPONENTS.md)                                                                   |
| [`@littoral/literally-firebase`](packages/literally-firebase) | [![npm](https://img.shields.io/npm/v/@littoral/literally-firebase?style=flat-square)](https://www.npmjs.com/package/@littoral/literally-firebase) | Reactive Firestore listener mixins, controllers, auth, notifications, and feature flags | [README](packages/literally-firebase/README.md) &bull; [Components](packages/literally-firebase/COMPONENTS.md)                                   |

---

## Installation

Install the packages via npm along with peer dependencies:

```bash
# Base application structure, routing & theming
npm install @littoral/literally lit @lit/context

# UI & layout components
npm install @littoral/ui

# Firebase Firestore integration (optional)
npm install @littoral/literally-firebase firebase
```

---

## Feature Highlights

- **Application Shell & Routing (`@littoral/literally`)**: `<er-app>`, trie-based routing engine (`<er-route>`, `<er-a>`, `RouterMixin`), service `Manager`, feature flags, and localization.
- **UI & Layout Primitives (`@littoral/ui`)**: Responsive `<er-grid>`, `<er-flex>`, `<er-spacer>`, `<er-bottom-sheet>`, `<er-button>`, `<er-card>`, `<er-chip>`, `<er-fab>`, `<er-h1>`&ndash;`<er-h6>`, `<er-icon>`, `<er-list-item>`, and `<er-loading>`.
- **Lifecycle & Reactive Mixins (`@littoral/literally`)**: `ProcessingMixin` (async task wrapping and tracking), `DebounceMixin`, `RafMixin`, and `WakeLockMixin`.
- **Design System & Theming (`@littoral/literally`)**: Integrated Material Design 3 design tokens (`--md-sys-color-*`), typography tokens (`--er-sys-*`), standardized spacing (`--space-*`), and responsive breakpoint helpers (`devices`).
- **Firebase Integration (`@littoral/literally-firebase`)**: `FirestoreListenerMixin`, reactive query/doc/auth/notification controllers, and Firestore feature-flag storage adapter.

---

## Documentation

- [Storybook Component Gallery](https://zoramite.github.io/literally/) &mdash; Interactive documentation, knobs, and live demos.
- [UI Component API Reference (`packages/ui/COMPONENTS.md`)](packages/ui/COMPONENTS.md) &mdash; Auto-generated Custom Elements Manifest for `@littoral/ui`.
- [Core Component API Reference (`packages/literally/COMPONENTS.md`)](packages/literally/COMPONENTS.md) &mdash; Auto-generated Custom Elements Manifest for `@littoral/literally`.
- [CSS Class Migration Guide (`MIGRATION.md`)](packages/literally/MIGRATION.md) &mdash; Migration reference for normalized `camelCase` CSS class names and `On<Breakpoint>` suffixes.

---

## Development & Contributing

This monorepo uses npm workspaces, TypeScript, Vitest, Storybook, and Oxlint/Oxfmt.

### Prerequisites

- Node.js (LTS recommended)
- npm 10+

### Setup

```bash
git clone https://github.com/Zoramite/literally.git
cd literally
npm ci
```

### Common Scripts

```bash
# Start local Storybook development server (port 6006)
npm run storybook

# Build all packages
npm run build

# Run unit tests with Vitest
npm test

# Run tests in CI mode
npm run test:ci

# Generate component documentation from Custom Elements Manifest
npm run docs:components

# Format and lint code
npm run fmt
npm run lint
```

---

## License

[MIT](LICENSE)
