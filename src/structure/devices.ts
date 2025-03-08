import { CSSResult, css } from 'lit';

/**
 * Device breakpoint definition.
 */
export interface BreakpointDevice {
  breakpoint: string;
  targetClass: CSSResult;
  query: CSSResult;
  mediaQuery: CSSResult;
}

/**
 * Device breakpoint targeted mixer function for simplifying how breakpoints are
 * automatically targeted in css classes.
 */
export type BreakpointTargetMixer = (
  breakpoint?: BreakpointDevice,
) => CSSResult;

/** Printing :) */
export const print: BreakpointDevice = {
  breakpoint: 'print',
  targetClass: css`-on-print`,
  query: css`print`,
  // prettier-ignore
  mediaQuery: css`@media print`,
};

/** Mobile device. */
export const mobile: BreakpointDevice = {
  breakpoint: 'mobile',
  targetClass: css`-on-mobile`,
  query: css`(max-width: 767px)`,
  // prettier-ignore
  mediaQuery: css`@media (max-width: 767px)`,
};

/** Tablet and lesser device. */
export const tabletLT: BreakpointDevice = {
  breakpoint: 'tabletLT',
  targetClass: css`-on-tablet-lt`,
  query: css`(max-width: 1023px)`,
  // prettier-ignore
  mediaQuery: css`@media (max-width: 1023px)`,
};

/** Tablet device. */
export const tablet: BreakpointDevice = {
  breakpoint: 'tablet',
  targetClass: css`-on-tablet`,
  query: css`(min-width: 768px) and (max-width: 1023px)`,
  // prettier-ignore
  mediaQuery: css`@media (min-width: 768px) and (max-width: 1023px)`,
};

/** Tablet and greater device. */
export const tabletGT: BreakpointDevice = {
  breakpoint: 'tabletGT',
  targetClass: css`-on-tablet-gt`,
  query: css`(min-width: 768px)`,
  // prettier-ignore
  mediaQuery: css`@media (min-width: 768px)`,
};

/** Desktop device. */
export const desktop: BreakpointDevice = {
  breakpoint: 'desktop',
  targetClass: css`-on-desktop`,
  query: css`(min-width: 1024px)`,
  // prettier-ignore
  mediaQuery: css`@media (min-width: 1024px)`,
};

class BreakpointHelper {
  constructor(public breakpoints: BreakpointDevice[]) {}

  mixupStyles(mixer: BreakpointTargetMixer): CSSResult[] {
    const styles: CSSResult[] = [];

    // Add generic styles that are not specific to any breakpoint.
    // Device specific styles will override.
    styles.push(mixer());

    // Loop through all of the known breakpoints and create mixed up class
    // definitions based on the given class name and the styling.
    for (const breakpoint of this.breakpoints) {
      styles.push(mixer(breakpoint));
    }

    return styles;
  }
}

/**
 * Helper for working with all the breakpoints.
 */
export const breakpoints = new BreakpointHelper([
  print,
  mobile,
  tablet,
  desktop,
]);
