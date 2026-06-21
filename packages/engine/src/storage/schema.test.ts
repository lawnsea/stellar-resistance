import { describe, expect, it } from "vitest";
import { buildAosAccessors, defineEntitySchema } from "./schema.js";

const FIELDS = { health: "f64", level: "u8" } as const;

describe.each([["aos"], ["soa"]] as const)("defineEntitySchema (%s layout)", (layout) => {
  it("round-trips field values", () => {
    const entities = defineEntitySchema({ fields: FIELDS, layout });
    const id = entities.alloc();
    const view = entities.get(id)!;
    view.health = 42.5;
    view.level = 3;
    expect(view.health).toBe(42.5);
    expect(view.level).toBe(3);
  });

  it("zero-initializes a freshly allocated row", () => {
    const entities = defineEntitySchema({ fields: FIELDS, layout });
    const id = entities.alloc();
    const view = entities.get(id)!;
    expect(view.health).toBe(0);
    expect(view.level).toBe(0);
  });

  it("keeps multiple entities' fields independent", () => {
    const entities = defineEntitySchema({ fields: FIELDS, layout });
    const a = entities.alloc();
    const b = entities.alloc();
    entities.get(a)!.health = 1;
    entities.get(b)!.health = 2;
    expect(entities.get(a)!.health).toBe(1);
    expect(entities.get(b)!.health).toBe(2);
  });

  it("returns undefined for a freed id", () => {
    const entities = defineEntitySchema({ fields: FIELDS, layout });
    const id = entities.alloc();
    entities.free(id);
    expect(entities.get(id)).toBeUndefined();
  });

  it("preserves data across growth and keeps prior ids resolvable", () => {
    const entities = defineEntitySchema({ fields: FIELDS, layout, initialCapacity: 1 });
    const a = entities.alloc();
    entities.get(a)!.health = 99;

    // force growth well past initial capacity
    for (let i = 0; i < 10; i++) entities.alloc();

    expect(entities.get(a)!.health).toBe(99);
  });

  it("zero-initializes a recycled slot, not leaking the previous occupant's data", () => {
    const entities = defineEntitySchema({ fields: FIELDS, layout });
    const a = entities.alloc();
    entities.get(a)!.health = 77;
    entities.free(a);

    const b = entities.alloc();
    expect(entities.get(b)!.health).toBe(0);
  });

  it("tracks length and capacity", () => {
    const entities = defineEntitySchema({ fields: FIELDS, layout, initialCapacity: 2 });
    expect(entities.capacity).toBe(2);
    entities.alloc();
    entities.alloc();
    expect(entities.length).toBe(2);
    entities.alloc();
    expect(entities.capacity).toBe(4);
    expect(entities.length).toBe(3);
  });
});

describe("defineEntitySchema validation", () => {
  it("rejects a field named 'id'", () => {
    expect(() => defineEntitySchema({ fields: { id: "u32" } })).toThrow();
  });
});

describe("buildAosAccessors byte layout", () => {
  it("packs fields tightly in declaration order, matching the pre-buffer-layout hand-rolled algorithm (no alignment padding)", () => {
    // Deliberately interleaves small and large fields (u8 before u32, then
    // before f64) so any alignment padding buffer-layout might insert would
    // shift these offsets away from the tightly-packed values asserted here.
    const fields = { a: "u8", b: "u32", c: "u8", d: "f64" } as const;
    const { stride, offsetOf } = buildAosAccessors(fields, 1);

    expect(offsetOf("a")).toBe(0);
    expect(offsetOf("b")).toBe(1);
    expect(offsetOf("c")).toBe(5);
    expect(offsetOf("d")).toBe(6);
    expect(stride).toBe(14);
  });

  it("matches the hand-computed stride/offsets for Pop's actual field set", () => {
    const fields = {
      size: "u32",
      planet: "u32",
      culture: "u32",
      religion: "i32",
      origin: "u8",
      standardOfLiving: "f64",
      expectedStandardOfLiving: "f64",
      tradecraft: "f32",
      discipline: "f32",
    } as const;
    const { stride, offsetOf } = buildAosAccessors(fields, 1);

    expect(offsetOf("size")).toBe(0);
    expect(offsetOf("planet")).toBe(4);
    expect(offsetOf("culture")).toBe(8);
    expect(offsetOf("religion")).toBe(12);
    expect(offsetOf("origin")).toBe(16);
    expect(offsetOf("standardOfLiving")).toBe(17);
    expect(offsetOf("expectedStandardOfLiving")).toBe(25);
    expect(offsetOf("tradecraft")).toBe(33);
    expect(offsetOf("discipline")).toBe(37);
    expect(stride).toBe(41);
  });
});
