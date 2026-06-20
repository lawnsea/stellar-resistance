import { packId, unpackId, MAX_INDEX } from "./generational-id.js";

const DEFAULT_INITIAL_CAPACITY = 8;

/**
 * Tracks slot lifecycle (capacity, free-list, per-slot generation) for a
 * growable collection. Does not hold field data itself — callers (the schema
 * allocator) own the actual buffers and are notified via `onGrow` so they can
 * resize in lockstep.
 */
export class Store {
  #capacity = 0;
  #nextIndex = 0;
  #freeIndices: number[] = [];
  #freeSet: Set<number> = new Set();
  #generations: Uint32Array = new Uint32Array(0);
  readonly #onGrow: (newCapacity: number) => void;

  constructor(onGrow: (newCapacity: number) => void, initialCapacity = DEFAULT_INITIAL_CAPACITY) {
    this.#onGrow = onGrow;
    if (initialCapacity > 0) {
      this.#growTo(initialCapacity);
    }
  }

  get capacity(): number {
    return this.#capacity;
  }

  get length(): number {
    return this.#nextIndex - this.#freeIndices.length;
  }

  alloc(): number {
    let index: number;
    if (this.#freeIndices.length > 0) {
      index = this.#freeIndices.pop()!;
      this.#freeSet.delete(index);
    } else {
      if (this.#nextIndex >= this.#capacity) {
        this.#growTo(this.#capacity > 0 ? this.#capacity * 2 : DEFAULT_INITIAL_CAPACITY);
      }
      index = this.#nextIndex++;
    }
    const generation = this.#generations[index]!;
    return packId(index, generation);
  }

  free(id: number): void {
    const { index, generation } = unpackId(id);
    if (!this.#isLive(index, generation)) {
      throw new RangeError(`cannot free stale or invalid id ${id}`);
    }
    this.#generations[index] = generation + 1;
    this.#freeIndices.push(index);
    this.#freeSet.add(index);
  }

  resolve(id: number): number | undefined {
    const { index, generation } = unpackId(id);
    return this.#isLive(index, generation) ? index : undefined;
  }

  /** Packed ids for every currently-allocated (non-freed) slot. */
  liveIds(): number[] {
    const ids: number[] = [];
    for (let index = 0; index < this.#nextIndex; index++) {
      if (!this.#freeSet.has(index)) {
        ids.push(packId(index, this.#generations[index]!));
      }
    }
    return ids;
  }

  #isLive(index: number, generation: number): boolean {
    return index >= 0 && index < this.#capacity && this.#generations[index] === generation;
  }

  #growTo(newCapacity: number): void {
    if (newCapacity > MAX_INDEX + 1) {
      throw new RangeError(`capacity ${newCapacity} exceeds maximum index space`);
    }
    const generations = new Uint32Array(newCapacity);
    generations.set(this.#generations);
    this.#generations = generations;
    this.#capacity = newCapacity;
    this.#onGrow(newCapacity);
  }
}
