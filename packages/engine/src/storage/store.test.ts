import { describe, expect, it, vi } from "vitest";
import { Store } from "./store.js";
import { unpackId } from "./generational-id.js";

describe("Store", () => {
  it("allocates slots with increasing index and generation 0", () => {
    const store = new Store(() => {});
    const a = store.resolve(store.alloc());
    const b = store.resolve(store.alloc());
    expect(a).toBe(0);
    expect(b).toBe(1);
  });

  it("resolves a live id to its index", () => {
    const store = new Store(() => {});
    const id = store.alloc();
    expect(store.resolve(id)).toBe(unpackId(id).index);
  });

  it("rejects resolving a freed id", () => {
    const store = new Store(() => {});
    const id = store.alloc();
    store.free(id);
    expect(store.resolve(id)).toBeUndefined();
  });

  it("recycles a freed slot with a bumped generation, invalidating the old id", () => {
    const store = new Store(() => {});
    const id1 = store.alloc();
    store.free(id1);
    const id2 = store.alloc();

    expect(unpackId(id2).index).toBe(unpackId(id1).index);
    expect(unpackId(id2).generation).toBe(unpackId(id1).generation + 1);
    expect(store.resolve(id1)).toBeUndefined();
    expect(store.resolve(id2)).toBe(unpackId(id1).index);
  });

  it("throws when freeing an already-freed (stale) id", () => {
    const store = new Store(() => {});
    const id = store.alloc();
    store.free(id);
    expect(() => store.free(id)).toThrow(RangeError);
  });

  it("grows capacity (doubling) and notifies via onGrow", () => {
    const onGrow = vi.fn();
    const store = new Store(onGrow, 2);
    expect(onGrow).toHaveBeenCalledWith(2);

    store.alloc();
    store.alloc();
    expect(store.capacity).toBe(2);

    store.alloc(); // exceeds capacity, must grow
    expect(store.capacity).toBe(4);
    expect(onGrow).toHaveBeenLastCalledWith(4);
  });

  it("preserves resolution of existing ids across growth", () => {
    const store = new Store(() => {}, 1);
    const id = store.alloc();
    store.alloc(); // forces growth
    store.alloc();
    store.alloc();
    expect(store.resolve(id)).toBe(unpackId(id).index);
  });

  it("tracks length distinct from capacity", () => {
    const store = new Store(() => {}, 4);
    const id1 = store.alloc();
    store.alloc();
    expect(store.length).toBe(2);
    store.free(id1);
    expect(store.length).toBe(1);
  });
});
