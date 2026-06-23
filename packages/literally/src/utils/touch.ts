export type TouchCallback = (evt: TouchEvent) => void;

/**
 * Tap handler for mobile devices that handles detecting taps and double taps.
 *
 * @returns tap handler with support for double tapping
 */
export const tap = (() => {
  let tapTimer: ReturnType<typeof setTimeout> | null = null;
  const dblTapDelta = 300;

  return (
    evt: TouchEvent,
    singleTapFunc: TouchCallback,
    doubleTapFunc: TouchCallback,
  ) => {
    if (!tapTimer) {
      tapTimer = setTimeout(() => {
        singleTapFunc(evt);
        tapTimer = null;
      }, dblTapDelta);
    } else {
      clearTimeout(tapTimer);
      tapTimer = null;
      doubleTapFunc(evt);
    }
  };
})();
