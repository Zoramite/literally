# `literally`

A monorepo of Lit-based web components, layout primitives, routing, lifecycle mixins, and Firebase utilities designed for modern web application development.

[![Storybook](https://img.shields.io/badge/Storybook-Live%20Demo-ff4785?style=flat-square&logo=storybook)](https://zoramite.github.io/literally/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

[**Explore the Storybook Gallery &rarr;**](https://zoramite.github.io/literally/)

---

## Packages

This repository contains two published packages:

| Package                                                       | Version                                                                                                                                           | Description                                                               | Docs                                                                                                                                             |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`@littoral/literally`](packages/literally)                   | [![npm](https://img.shields.io/npm/v/@littoral/literally?style=flat-square)](https://www.npmjs.com/package/@littoral/literally)                   | Core UI components, layout structures, routing, mixins, and design tokens | [README](packages/literally/README.md) &bull; [Components](packages/literally/COMPONENTS.md) &bull; [Migration](packages/literally/MIGRATION.md) |
| [`@littoral/literally-firebase`](packages/literally-firebase) | [![npm](https://img.shields.io/npm/v/@littoral/literally-firebase?style=flat-square)](https://www.npmjs.com/package/@littoral/literally-firebase) | Reactive Firestore listener mixins and converter interfaces               | [README](packages/literally-firebase/README.md) &bull; [Components](packages/literally-firebase/COMPONENTS.md)                                   |

---

## Installation

Install the packages via npm along with peer dependencies:

```bash
# Core components & layout
npm install @littoral/literally lit @lit/context

# Firebase Firestore integration (optional)
npm install @littoral/literally-firebase firebase
```

---

## Feature Highlights

- **Layout & Structure**: Responsive primitives including `<er-app>`, `<er-flex>`, `<er-grid>`, `<er-spacer>`, and `<er-bottom-sheet>`.
- **UI Components**: Accessible, themeable elements such as `<er-card>`, `<er-chip>`, `<er-fab>`, `<er-header>`, `<er-icon>`, `<er-list-item>`, and `<er-loading>`.
- **Client-Side Routing**: Trie-based routing engine with `<er-route>`, `<er-a>`, and `RouterMixin`.
- **Lifecycle & Reactive Mixins**: `ProcessingMixin` (async task wrapping and tracking), `DebounceMixin`, `RafMixin`, and `WakeLockMixin`.
- **Design System & Theming**: Integrated Material Design 3 design tokens (`--md-sys-color-*`), typography tokens (`--er-sys-*`), standardized spacing (`--space-*`), and responsive breakpoint helpers.
- **Firebase Firestore Integration**: `FirestoreListenerMixin` for automatic registration, deduplication, and cleanup of Firestore snapshot subscriptions on element disconnect.

---

## Documentation

- [Storybook Component Gallery](https://zoramite.github.io/literally/) &mdash; Interactive documentation, knobs, and live demos.
- [Component API Reference (`COMPONENTS.md`)](packages/literally/COMPONENTS.md) &mdash; Auto-generated Custom Elements Manifest detailing attributes, properties, slots, events, and CSS classes.
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
