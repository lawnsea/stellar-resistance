import { describe, expect, it } from "vitest";
import { createPopStore, Origin } from "./pop.js";
import { asCultureId, asPlanetId, asReligionId, NO_RELIGION } from "../ids.js";

describe("Pop", () => {
  it("defaults to no religion on allocation", () => {
    const pops = createPopStore();
    const id = pops.alloc();
    expect(pops.get(id)!.religion).toBe(NO_RELIGION);
  });

  it("round-trips every field", () => {
    const pops = createPopStore();
    const id = pops.alloc();
    const pop = pops.get(id)!;

    pop.size = 1000;
    pop.planet = asPlanetId(7);
    pop.culture = asCultureId(3);
    pop.religion = asReligionId(2);
    pop.origin = Origin.Conquered;
    pop.standardOfLiving = 0.8;
    pop.expectedStandardOfLiving = 0.6;
    pop.tradecraft = 1.5;
    pop.discipline = 2.5;

    expect(pop.size).toBe(1000);
    expect(pop.planet).toBe(7);
    expect(pop.culture).toBe(3);
    expect(pop.religion).toBe(2);
    expect(pop.origin).toBe(Origin.Conquered);
    expect(pop.standardOfLiving).toBeCloseTo(0.8);
    expect(pop.expectedStandardOfLiving).toBeCloseTo(0.6);
    expect(pop.tradecraft).toBeCloseTo(1.5);
    expect(pop.discipline).toBeCloseTo(2.5);
  });

  it("returns undefined for a freed pop", () => {
    const pops = createPopStore();
    const id = pops.alloc();
    pops.free(id);
    expect(pops.get(id)).toBeUndefined();
  });
});
