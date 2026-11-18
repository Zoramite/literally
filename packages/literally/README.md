# `@littoral/literally`

Lit-based application shell, client-side routing, navigation primitives, feature flags, localization, theming, and lifecycle mixins for web applications.

> Looking for UI widgets and layout primitives (`<er-button>`, `<er-card>`, `<er-grid>`, `<er-flex>`, `<er-bottom-sheet>`, etc.)? See [`@littoral/ui`](../ui).

[![npm](https://img.shields.io/npm/v/@littoral/literally?style=flat-square)](https://www.npmjs.com/package/@littoral/literally)
[![Storybook](https://img.shields.io/badge/Storybook-Live%20Demo-ff4785?style=flat-square&logo=storybook)](https://zoramite.github.io/literally/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](../../LICENSE)

[**Storybook Interactive Gallery &rarr;**](https://zoramite.github.io/literally/)

---

## Installation

```bash
npm install @littoral/literally lit @lit/context
```

---

## What's Included

### 1. Application Structure (`/structure`)

- `ERApp` (`<er-app>`): Base top-level application shell with route rendering, page title management, redirect handling, sticky offset tracking, and global overlay injection (`appElement`).
- `Manager`: Lazy singleton service/API registry.
- `devices` & `breakpoints`: Responsive breakpoint definitions (`mobile`, `tablet`, `desktop`, `print`) and CSS media-query mixing helpers.

### 2. Routing & Navigation (`/routing`, `/navigation`)

- `<er-a>`: Enhanced client-side anchor that emits navigation events without triggering full-page browser reloads.
- `<er-route>` / `ERRouteBase`: Route container element for declarative client routing.
- `RouterMixin`, `RouteTrie`, `PublicRoute`, `RoleRoute`, `LazyRoute`, `RedirectRoute`: Fast trie-based client router with parameter matching, role guards, lazy loading, and history management.
- `NavigationMixin` & `navigateToPathEvent`: Navigation behavior mixin and event helpers.

### 3. Utility Mixins (`/mixins`)

- `ProcessingMixin`: Wraps asynchronous actions via `this.wrapAsyncProcessing(async () => ...)` and tracks active execution state (`this.isProcessing()`) to prevent duplicate submissions and drive loading UI.
- `DebounceMixin`: Debounces frequent user inputs or method calls.
- `RafMixin`: Ties animations or rapid DOM mutations to `requestAnimationFrame`.
- `WakeLockMixin`: Manages the Screen Wake Lock API to prevent devices from sleeping during active user sessions.

### 4. Feature Flags & Rollout Controls (`/feature-flags`)

- `FeatureFlagManager` & `FeatureFlagStorageAdapter`: Storage-agnostic feature flag engine supporting global vs. scoped overrides (`scope__flagId`), user allowlists (`targetIds`), scope allowlists (`targetScopes`), custom attribute targeting (`targetAttributes`), and deterministic percentage rollouts (`rolloutPercentage`).
- `computeRolloutHash` & `isWithinRolloutPercentage`: Synchronous SHA-256 deterministic hashing (`0–99`) compatible across browser and Node.js runtimes.
- `FeatureFlagController`, `featureFlagContext`, & `<er-feature-flag>`: Lit reactive controller, `@lit/context` integration, and declarative gate element with `fallback` slot support.

### 5. Localization (`/localization`)

- `LocalizationManager`, `localizationContext`, & `<er-t>`: Lightweight YAML-backed localization context and declarative translation element.

### 6. Theming & Design System (`/theme`)

Literally provides Material Design 3 tokens via `ThemeMixin` and `themeContext`:

- **Colors**: `--md-sys-color-primary`, `--md-sys-color-surface`, `--md-sys-color-surface-container`, `--md-sys-color-error`, etc.
- **Typography**: `--er-sys-body-font-size-small`, `--er-sys-title-font-size-h1`, etc.
- **Spacing**: `--space-xsmall`, `--space-small`, `--space-medium`, `--space-large`, etc.
- **Responsive Breakpoint Suffixes**: Breakpoints use `On<Breakpoint>` PascalCase suffixes (e.g., `OnMobile`, `OnTablet`, `OnDesktop`).

---

## Documentation

- [Component API Reference (`COMPONENTS.md`)](./COMPONENTS.md) &mdash; Detailed props, attributes, events, slots, and CSS classes for core elements.
- [UI Components (`@littoral/ui`)](../ui/README.md) &mdash; Buttons, cards, chips, headers, icons, overlays, and responsive grid/flex primitives.
- [CSS Class Migration Guide (`MIGRATION.md`)](./MIGRATION.md) &mdash; Reference table for migrating from legacy kebab-case CSS classes to normalized camelCase classes.
- [Storybook Interactive Gallery](https://zoramite.github.io/literally/) &mdash; Visual component demos and testing playground.

---

## License

[MIT](../../LICENSE)
