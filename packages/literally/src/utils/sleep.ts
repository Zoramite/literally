/**
 * Allow for a sleep in the middle of async code.
 */
export function sleep(timeout = 1000): Promise<void> {
  return new Promise((resolve) => {
    if (timeout <= 0) {
      resolve();
    }
    setTimeout(resolve, timeout);
  });
}
