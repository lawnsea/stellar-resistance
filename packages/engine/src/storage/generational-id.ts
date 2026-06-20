/**
 * A generational id packs a slot index and a generation counter into a single
 * number, so a stale id from a recycled slot can be detected rather than
 * silently resolving to whatever now occupies that slot.
 *
 * Encoding: id = generation * INDEX_SPACE + index. Safe within
 * Number.MAX_SAFE_INTEGER (2^53 - 1) for any realistic entity count.
 */

export const INDEX_BITS = 24;
export const INDEX_SPACE = 2 ** INDEX_BITS;
export const MAX_INDEX = INDEX_SPACE - 1;

export interface GenerationalId {
  readonly index: number;
  readonly generation: number;
}

export function packId(index: number, generation: number): number {
  if (index < 0 || index > MAX_INDEX) {
    throw new RangeError(`index ${index} out of range [0, ${MAX_INDEX}]`);
  }
  if (generation < 0) {
    throw new RangeError(`generation ${generation} must be non-negative`);
  }
  return generation * INDEX_SPACE + index;
}

export function unpackId(id: number): GenerationalId {
  const index = id % INDEX_SPACE;
  const generation = Math.floor(id / INDEX_SPACE);
  return { index, generation };
}
