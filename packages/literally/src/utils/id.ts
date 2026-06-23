/**
 * Generate a random id of a given length as a string.
 */
export function randomId(length = 6): string {
  if (length < 1) {
    throw new Error('Unable to create id without a length');
  }

  let id = '';

  while (id.length < length) {
    const uuid = crypto.randomUUID().replace(/-/g, '');
    const remainingLength = length - id.length;
    const uuidLength = uuid.length;
    const newSegment = uuid.slice(0, Math.min(remainingLength, uuidLength));
    id = `${id}${newSegment}`;
  }

  return id;
}
