# `@littoral/ui`

Lit-based UI components, overlays, and responsive layout primitives designed to pair with [`@littoral/literally`](../literally).

[![npm](https://img.shields.io/npm/v/@littoral/ui?style=flat-square)](https://www.npmjs.com/package/@littoral/ui)
[![Storybook](https://img.shields.io/badge/Storybook-Live%20Demo-ff4785?style=flat-square&logo=storybook)](https://zoramite.github.io/literally/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](../../LICENSE)

---

## Installation

```bash
npm install @littoral/ui @littoral/literally lit @lit/context
```

---

## Quick Start

Import individual elements via flat subpaths:

```typescript
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '@littoral/ui/er-card';
import '@littoral/ui/er-chip';
import '@littoral/ui/er-flex';
import '@littoral/ui/er-grid';
import '@littoral/ui/er-header';

@customElement('my-dashboard')
export class MyDashboard extends LitElement {
  render() {
    return html`
      <er-flex class="flowColumn gapSmall">
        <er-h1>Dashboard</er-h1>

        <er-grid>
          <er-grid-item span="desktop:4; tablet:4; mobile:4">
            <er-card class="padMedium themeSurfaceContainer hoverEffect">
              <er-chip icon-start="star">Featured</er-chip>
              <er-h3>Card Title</er-h3>
              <p>Structured card with theme styling and responsive layout.</p>
            </er-card>
          </er-grid-item>
        </er-grid>
      </er-flex>
    `;
  }
}
```

---

## Included Components

### Layout Primitives

- `<er-grid>` & `<er-grid-item>` (`@littoral/ui/er-grid`): Responsive 4/8/12-column CSS grid with subgrid support.
- `<er-flex>` (`@littoral/ui/er-flex`): Responsive flexbox container with gap, alignment, and basis classes.
- `<er-spacer>` (`@littoral/ui/er-spacer`): Vertical spacing element mapped to `--space-*` tokens.
- `<er-grid-overlay>` (`@littoral/ui/er-grid-overlay`): Visual layout debugging grid overlay.

### UI & Overlay Elements

- `<er-button>` (`@littoral/ui/er-button`): Action and navigation button with primary/secondary/tertiary and theme variants.
- `<er-card>` (`@littoral/ui/er-card`): Card container with elevation, hover effects, padding variants, and theme styling.
- `<er-chip>` (`@littoral/ui/er-chip`): Badge/chip with optional start and end icons.
- `<er-fab>` (`@littoral/ui/er-fab`): Floating action button with responsive expansion classes.
- `<er-h1>` &ndash; `<er-h6>` (`@littoral/ui/er-header`): Semantic heading elements mapped to `--er-sys-title-font-size-*` tokens.
- `<er-icon>` (`@littoral/ui/er-icon`): Icon renderer with automatic contrast adjustment.
- `<er-list-item>` (`@littoral/ui/er-list-item`): List item element.
- `<er-loading>` (`@littoral/ui/er-loading`): Animated loading indicator.
- `<er-bottom-sheet>` (`@littoral/ui/er-bottom-sheet`): Slide-up bottom sheet overlay modal with optional scrim.

---

## Documentation

- [Component API Reference (`COMPONENTS.md`)](./COMPONENTS.md) &mdash; Auto-generated Custom Elements Manifest reference.
- [Storybook Interactive Gallery](https://zoramite.github.io/literally/) &mdash; Visual component demos and testing playground.
