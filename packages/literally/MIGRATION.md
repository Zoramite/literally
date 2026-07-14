# Migration Guide: CSS Class Normalization

This release introduces **breaking changes** by normalizing all CSS classes to use `camelCase` naming conventions. This replaces any dash-separated CSS classes (e.g., `.some-class-name`) with their camelCase equivalents (e.g., `.someClassName`).

Furthermore, breakpoint suffixes have been standardized to use the `On<Breakpoint>` PascalCase format (e.g., `OnMobile`, `OnTablet`, `OnDesktop`, `OnWidescreen`). This replaces the old dash-based suffixes (e.g., `-mobile`, `-tablet`, etc.).

---

## Component Migration Matrix

The tables below map the old dash-separated/mixed classes to the new camelCase classes.

### 1. Card Element (`<er-card>`)

| Old CSS Class | New CSS Class | Description |
|---|---|---|
| `.full-height` | `.fullHeight` | Sets height to 100%. |
| `.hover-effect` | `.hoverEffect` | Applies elevation/transform hover transition. |
| `.pad-xsmall` | `.padXsmall` | Sets extra small padding (supports breakpoint suffixes, e.g. `padXsmallOnMobile`). |
| `.pad-small` | `.padSmall` | Sets small padding (supports breakpoint suffixes, e.g. `padSmallOnMobile`). |
| `.pad-medium` | `.padMedium` | Sets medium padding (supports breakpoint suffixes, e.g. `padMediumOnMobile`). |
| `.pad-large` | `.padLarge` | Sets large padding (supports breakpoint suffixes, e.g. `padLargeOnMobile`). |
| `.pad-xlarge` | `.padXlarge` | Sets extra large padding (supports breakpoint suffixes, e.g. `padXlargeOnMobile`). |
| `.pad-xxlarge` | `.padXxlarge` | Sets double extra large padding (supports breakpoint suffixes, e.g. `padXxlargeOnMobile`). |
| `.pad-xxxlarge` | `.padXxxlarge` | Sets triple extra large padding (supports breakpoint suffixes, e.g. `padXxxlargeOnMobile`). |
| `.theme-primary` | `.themePrimary` | Sets primary theme color. |
| `.theme-primary-container` | `.themePrimaryContainer` | Sets primary-container theme color. |
| `.theme-secondary` | `.themeSecondary` | Sets secondary theme color. |
| `.theme-secondary-container`| `.themeSecondaryContainer`| Sets secondary-container theme color. |
| `.theme-tertiary` | `.themeTertiary` | Sets tertiary theme color. |
| `.theme-tertiary-container` | `.themeTertiaryContainer` | Sets tertiary-container theme color. |
| `.theme-error` | `.themeError` | Sets error theme color. |
| `.theme-error-container` | `.themeErrorContainer` | Sets error-container theme color. |
| `.theme-surface-variant` | `.themeSurfaceVariant` | Sets surface-variant theme color. |
| `.theme-surface-container` | `.themeSurfaceContainer` | Sets surface-container theme color. |

### 2. Chip Element (`<er-chip>`)

| Old CSS Class | New CSS Class | Description |
|---|---|---|
| `.align-self-center` | `.alignSelfCenter` | Align the chip to the center of the cross axis. |
| `.justify-self-center` | `.justifySelfCenter` | Justify the chip to the center of the main axis. |
| `.justify-self-flex-end` | `.justifySelfFlexEnd` | Justify the chip to the flex-end. |
| `.theme-primary` | `.themePrimary` | Apply primary theme color. |
| `.theme-secondary` | `.themeSecondary` | Apply secondary theme color. |
| `.theme-tertiary` | `.themeTertiary` | Apply tertiary theme color. |
| `.theme-error` | `.themeError` | Apply error theme color. |

### 3. Floating Action Button (`<er-fab>`)

| Old CSS Class | New CSS Class | Description |
|---|---|---|
| `.expanded-mobile` | `.expandedOnMobile` | Force the fab to be expanded on mobile breakpoint. |
| `.expanded-tablet` | `.expandedOnTablet` | Force the fab to be expanded on tablet breakpoint. |
| `.expanded-desktop` | `.expandedOnDesktop` | Force the fab to be expanded on desktop breakpoint. |
| `.expanded-widescreen` | `.expandedOnWidescreen` | Force the fab to be expanded on widescreen breakpoint. |
| `.theme-primary` | `.themePrimary` | Apply primary theme color. |
| `.theme-secondary` | `.themeSecondary` | Apply secondary theme color. |
| `.theme-tertiary` | `.themeTertiary` | Apply tertiary theme color. |
| `.theme-error` | `.themeError` | Apply error theme color. |

### 4. Header Element (`<er-header>`)

| Old CSS Class | New CSS Class | Description |
|---|---|---|
| `.margin-after-medium` | `.marginAfterMedium` | Adds a medium bottom margin. |
| `.center-mobile` | `.centerOnMobile` | Center aligns the header text on mobile. |
| `.right-mobile` | `.rightOnMobile` | Right aligns the header text on mobile. |
| `.left-mobile` | `.leftOnMobile` | Left aligns the header text on mobile. |

### 5. Link Element (`<er-a>`)

| Old CSS Class | New CSS Class | Description |
|---|---|---|
| `.inline-block` | `.inlineBlock` | Set display to inline-block. |

### 6. Flex Container (`<er-flex>`)

| Old CSS Class | New CSS Class | Description |
|---|---|---|
| `.overflow-hidden` | `.overflowHidden` | Set overflow to hidden. |
| `.gap-small` | `.gapSmall` | Set small gap spacing. |
| `.gap-large` | `.gapLarge` | Set large gap spacing. |
| `.gap-xlarge` | `.gapXlarge` | Set extra large gap spacing. |
| `.flow-column` | `.flowColumn` | Set flex direction to column (supports breakpoint suffixes, e.g. `.flowColumnOnMobile`). |
| `.flow-row` | `.flowRow` | Set flex direction to row (supports breakpoint suffixes, e.g. `.flowRowOnMobile`). |
| `.align-flex-start` | `.alignFlexStart` | Align items to flex-start (supports breakpoint suffixes, e.g. `.alignFlexStartOnMobile`). |
| `.align-flex-end` | `.alignFlexEnd` | Align items to flex-end (supports breakpoint suffixes, e.g. `.alignFlexEndOnMobile`). |
| `.align-space-between` | `.alignSpaceBetween` | Align items with space-between (supports breakpoint suffixes, e.g. `.alignSpaceBetweenOnMobile`). |
| `.align-space-around` | `.alignSpaceAround` | Align items with space-around (supports breakpoint suffixes, e.g. `.alignSpaceAroundOnMobile`). |
| `.align-space-evenly` | `.alignSpaceEvenly` | Align items with space-evenly (supports breakpoint suffixes, e.g. `.alignSpaceEvenlyOnMobile`). |
| `.justify-flex-start` | `.justifyFlexStart` | Justify content to flex-start (supports breakpoint suffixes, e.g. `.justifyFlexStartOnMobile`). |
| `.justify-flex-end` | `.justifyFlexEnd` | Justify content to flex-end (supports breakpoint suffixes, e.g. `.justifyFlexEndOnMobile`). |
| `.justify-space-between` | `.justifySpaceBetween` | Justify content with space-between (supports breakpoint suffixes, e.g. `.justifySpaceBetweenOnMobile`). |
| `.justify-space-around` | `.justifySpaceAround` | Justify content with space-around (supports breakpoint suffixes, e.g. `.justifySpaceAroundOnMobile`). |
| `.justify-space-evenly` | `.justifySpaceEvenly` | Justify content with space-evenly (supports breakpoint suffixes, e.g. `.justifySpaceEvenlyOnMobile`). |
| `.basis-33` | `.basis33` | Set flex basis to 33.3% for slotted items (supports breakpoint suffixes, e.g. `.basis33OnMobile`). |
| `.basis-50` | `.basis50` | Set flex basis to 50% for slotted items (supports breakpoint suffixes, e.g. `.basis50OnMobile`). |
| `.basis-25` | `.basis25` | Set flex basis to 25% for slotted items (supports breakpoint suffixes, e.g. `.basis25OnMobile`). |
| `.basis-20` | `.basis20` | Set flex basis to 20% for slotted items (supports breakpoint suffixes, e.g. `.basis20OnMobile`). |

### 7. Grid Container (`<er-grid>`)

| Old CSS Class | New CSS Class | Description |
|---|---|---|
| `.gap-row-small` | `.gapRowSmall` | Set small row gap (supports breakpoint suffixes, e.g. `.gapRowSmallOnMobile`). |
| `.gap-row-medium` | `.gapRowMedium` | Set medium row gap (supports breakpoint suffixes, e.g. `.gapRowMediumOnMobile`). |
| `.gap-row-large` | `.gapRowLarge` | Set large row gap (supports breakpoint suffixes, e.g. `.gapRowLargeOnMobile`). |
| `.gap-row-xlarge` | `.gapRowXlarge` | Set extra large row gap (supports breakpoint suffixes, e.g. `.gapRowXlargeOnMobile`). |
| `.gap-row-xxlarge` | `.gapRowXxlarge` | Set double extra large row gap (supports breakpoint suffixes, e.g. `.gapRowXxlargeOnMobile`). |
| `.gap-row-xxxlarge` | `.gapRowXxxlarge` | Set triple extra large row gap (supports breakpoint suffixes, e.g. `.gapRowXxxlargeOnMobile`). |
| `.gap-col-small` | `.gapColSmall` | Set small column gap (supports breakpoint suffixes, e.g. `.gapColSmallOnMobile`). |
| `.gap-col-medium` | `.gapColMedium` | Set medium column gap (supports breakpoint suffixes, e.g. `.gapColMediumOnMobile`). |
| `.gap-col-large` | `.gapColLarge` | Set large column gap (supports breakpoint suffixes, e.g. `.gapColLargeOnMobile`). |
| `.gap-col-xlarge` | `.gapColXlarge` | Set extra large column gap (supports breakpoint suffixes, e.g. `.gapColXlargeOnMobile`). |
| `.gap-col-xxlarge` | `.gapColXxlarge` | Set double extra large column gap (supports breakpoint suffixes, e.g. `.gapColXxlargeOnMobile`). |
| `.gap-col-xxxlarge` | `.gapColXxxlarge` | Set triple extra large column gap (supports breakpoint suffixes, e.g. `.gapColXxxlargeOnMobile`). |
| `.align-baseline` | `.alignBaseline` | Align items to baseline (supports breakpoint suffixes, e.g. `.alignBaselineOnMobile`). |
| `.align-end` | `.alignEnd` | Align items to end (supports breakpoint suffixes, e.g. `.alignEndOnMobile`). |
| `.align-center` | `.alignCenter` | Align items to center (supports breakpoint suffixes, e.g. `.alignCenterOnMobile`). |
| `.align-start` | `.alignStart` | Align items to start (supports breakpoint suffixes, e.g. `.alignStartOnMobile`). |
| `.align-self-stretch` | `.alignSelfStretch` | Set align-self to stretch on grid items. |
