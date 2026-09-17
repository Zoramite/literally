# `@littoral/literally`

Lit-based structural web components, layout primitives, client-side routing, and lifecycle mixins for web applications.

[![npm](https://img.shields.io/npm/v/@littoral/literally?style=flat-square)](https://www.npmjs.com/package/@littoral/literally)
[![Storybook](https://img.shields.io/badge/Storybook-Live%20Demo-ff4785?style=flat-square&logo=storybook)](https://zoramite.github.io/literally/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

[**Storybook Interactive Gallery &rarr;**](https://zoramite.github.io/literally/)

---

## Installation

```bash
npm install @littoral/literally lit @lit/context
```

---

## Quick Start

Import components and use them directly in your HTML or Lit templates:

```typescript
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

// Import desired components
import '@littoral/literally/components/er-header';
import '@littoral/literally/components/er-card';
import '@littoral/literally/components/er-chip';
import '@littoral/literally/structure/er-flex';
import '@littoral/literally/structure/er-grid';

@customElement('my-dashboard')
export class MyDashboard extends LitElement {
  render() {
    return html`
      <er-flex col gapSmall>
        <er-header level="h1">Dashboard</er-header>

        <er-grid cols="3" colsMobile="1" gapMedium>
          <er-card class="padMedium themeSurfaceContainer hoverEffect">
            <er-chip icon-start="star">Featured</er-chip>
            <h3>Card Title</h3>
            <p>
              This is a structured card with theme styling and responsive
              layout.
            </p>
          </er-card>
        </er-grid>
      </er-flex>
    `;
  }
}
```

---

## What's Included

### 1. Structural & Layout Elements (`/structure`)

Primitives for composing responsive grid and flexbox arrangements:

- `<er-app>`: Base top-level application wrapper.
- `<er-flex>`: Flex container with props/classes for direction, gap, alignment (`col`, `gapSmall`, `gapMedium`, etc.).
- `<er-grid>`: Responsive CSS grid supporting responsive column counts (e.g., `cols="3" colsMobile="1"`).
- `<er-spacer>`: Flexible spacing element.
- `<er-bottom-sheet>`: Slide-up bottom sheet overlay modal.
- `<er-grid-overlay>`: Visual layout debugging grid.

### 2. UI Components (`/components`)

- `<er-card>`: Card container with elevation, hover effects, padding variants, and theme styling.
- `<er-chip>`: Stylized badge/chip with optional start and end icons.
- `<er-fab>`: Floating action button.
- `<er-header>`: Semantic header wrapper (`h1` &ndash; `h6`) ensuring proper heading hierarchy.
- `<er-icon>`: SVG icon renderer.
- `<er-list-item>`: List item component.
- `<er-loading>`: Animated loading spinner / state indicator.

### 3. Routing & Navigation (`/routing`, `/navigation`)

- `<er-a>`: Enhanced client-side anchor that emits navigation events without triggering full-page browser reloads.
- `<er-route>`: Route container element for declarative client routing.
- `RouterMixin`: Component mixin providing route state consumption, parameter matching, and navigation interception via a fast trie-based router.

### 4. Utility Mixins (`/mixins`)

- `ProcessingMixin`: Wraps asynchronous actions via `this.wrapAsyncProcessing(async () => ...)` and tracks active execution state (`this.isProcessing()`) to prevent duplicate submissions and drive loading UI.
- `DebounceMixin`: Debounces frequent user inputs or method calls.
- `RafMixin`: Ties animations or rapid DOM mutations to `requestAnimationFrame`.
- `WakeLockMixin`: Manages the Screen Wake Lock API to prevent devices from sleeping during active user sessions.

### 5. Theming & Design System (`/theme`)

Literally is styled with Material Design 3 tokens:

- **Colors**: `--md-sys-color-primary`, `--md-sys-color-surface`, `--md-sys-color-surface-container`, `--md-sys-color-error`, etc.
- **Typography**: `--er-sys-body-font-size-small`, `--er-sys-headline-font-size-medium`, etc.
- **Spacing**: `--space-xsmall`, `--space-small`, `--space-medium`, `--space-large`, etc.
- **CSS Classes**: All utility classes are written in `camelCase` (e.g., `.themePrimaryContainer`, `.padMedium`, `.fullHeight`, `.hoverEffect`).
- **Responsive Breakpoint Suffixes**: Breakpoints use `On<Breakpoint>` PascalCase suffixes (e.g., `padSmallOnMobile`, `padMediumOnTablet`, `padLargeOnDesktop`).

---

## Documentation

- [Component API Reference (`COMPONENTS.md`)](./COMPONENTS.md) &mdash; Detailed props, attributes, events, slots, and CSS classes for every component.
- [CSS Class Migration Guide (`MIGRATION.md`)](./MIGRATION.md) &mdash; Reference table for migrating from legacy kebab-case CSS classes to normalized camelCase classes.
- [Storybook Interactive Gallery](https://zoramite.github.io/literally/) &mdash; Visual component demos and testing playground.

---

## License

[MIT](LICENSE)
