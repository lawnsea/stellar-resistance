import { describe, expect, it } from "vitest";
import { Origin, PopObjectImpl, type Pop } from "./pop.js";

function samplePop(): Pop {
  return {
    size: 1000,
    planet: 7,
    culture: 3,
    religion: 2,
    origin: Origin.Conquered,
    standardOfLiving: 0.8,
    expectedStandardOfLiving: 0.6,
    tradecraft: 1.5,
    discipline: 2.5,
    factionAttitudes: {
      "1": { fear: 0.1, fearTarget: 0.2, militancy: 0.3, militancyTarget: 0.4, loyalty: 0.5, loyaltyTarget: 0.6 },
    },
    culturalAttitudes: {
      "3": { fear: 0, fearTarget: 0, militancy: 0, militancyTarget: 0, loyalty: 1, loyaltyTarget: 1 },
    },
    religiousAttitudes: {},
  };
}

describe("PopObjectImpl", () => {
  it("round-trips every field, including inlined attitude maps", () => {
    const values = samplePop();
    const pop = new PopObjectImpl(values);

    expect(pop.size).toBe(1000);
    expect(pop.planet).toBe(7);
    expect(pop.culture).toBe(3);
    expect(pop.religion).toBe(2);
    expect(pop.origin).toBe(Origin.Conquered);
    expect(pop.standardOfLiving).toBeCloseTo(0.8);
    expect(pop.expectedStandardOfLiving).toBeCloseTo(0.6);
    expect(pop.tradecraft).toBeCloseTo(1.5);
    expect(pop.discipline).toBeCloseTo(2.5);
    expect(pop.factionAttitudes).toEqual(values.factionAttitudes);
    expect(pop.culturalAttitudes).toEqual(values.culturalAttitudes);
    expect(pop.religiousAttitudes).toEqual({});
  });

  it("represents 'no religion' as null, not a sentinel id", () => {
    const pop = new PopObjectImpl({ ...samplePop(), religion: null });
    expect(pop.religion).toBeNull();
  });
});
