import { describe, expect, test } from "vitest";
import {
  createPlanet,
  createPop,
  createRegion,
  createWorld,
  defaultConfig,
  type Region,
  testWorld,
  tick,
  type World,
} from "./index";
import { exactSize } from "./pop";

function run(world: World, ticks: number): World {
  let current = world;
  for (let i = 0; i < ticks; i++) {
    current = tick(current).world;
  }
  return current;
}

function singleRegion(
  productionCap: number,
  size: number,
  actualStandardOfLiving: number,
): World {
  const planet = createPlanet({
    id: "pl",
    name: "Ferrix",
    regions: [
      createRegion({
        id: "r",
        type: "rural",
        productionCap,
        pops: [
          createPop({
            id: "p",
            size,
            actualStandardOfLiving,
            expectedStandardOfLiving: 1,
          }),
        ],
      }),
    ],
  });
  return createWorld({ factions: [], planets: [planet] });
}

function region(world: World, id = "r"): Region {
  const found = world.planets
    .flatMap((planet) => planet.regions)
    .find((r) => r.id === id);
  if (!found) throw new Error(`Region ${id} missing`);
  return found;
}

function population(r: Region): number {
  return r.pops.reduce((total, pop) => total + exactSize(pop), 0);
}

describe("over many ticks", () => {
  test("pops with enough production grow", () => {
    const after = region(run(singleRegion(1e9, 1000, 1), 400));
    expect(population(after)).toBeGreaterThan(2000);
    expect(after.pops[0]?.actualStandardOfLiving).toBeCloseTo(1.05, 6);
    expect(after.pops[0]?.expectedStandardOfLiving).toBeCloseTo(1.05, 2);
  });

  test("an underfed region shrinks while its production recovers", () => {
    // Underfed pops produce less, so production recovers 5% per tick.
    const start = singleRegion(1e9, 1000, 0.5);
    const recovering = region(run(start, 10));
    expect(population(recovering)).toBeLessThan(1000);
    expect(recovering.pops[0]?.actualStandardOfLiving).toBeLessThan(1);
    const recovered = region(run(start, 30));
    expect(recovered.pops[0]?.actualStandardOfLiving).toBeCloseTo(1.05, 6);
  });

  test("a region settles at what its production cap can support", () => {
    const settled = run(singleRegion(1000, 900, 1), 500);
    expect(population(region(settled))).toBeCloseTo(1000, 0);
    const later = run(settled, 500);
    expect(population(region(later))).toBeCloseTo(
      population(region(settled)),
      1,
    );
  });

  test("starving pops shrink, expect starvation, and die out", () => {
    const start = singleRegion(0.001, 100, 0.2);
    const starving = region(run(start, 25));
    expect(population(starving)).toBeLessThan(30);
    expect(starving.pops[0]?.expectedStandardOfLiving).toBeLessThan(0.1);
    expect(region(run(start, 150)).pops).toEqual([]);
  });

  test("a growing pop splits when it passes the maximum size", () => {
    const after = region(run(singleRegion(1e9, 4900, 1), 20));
    expect(after.pops).toHaveLength(2);
    for (const pop of after.pops) {
      expect(pop.size).toBeLessThanOrEqual(defaultConfig.maxPopSize);
    }
    expect(population(after)).toBeGreaterThan(5000);
  });

  test("the same input produces the same result", () => {
    expect(run(testWorld, 200)).toEqual(run(testWorld, 200));
  });
});

describe("the test planets over 1,000 ticks", () => {
  const after = run(testWorld, 1000);
  const pops = after.planets.flatMap((planet) =>
    planet.regions.flatMap((r) => r.pops),
  );

  test("pop sizes stay integers within the size limits", () => {
    for (const pop of pops) {
      expect(Number.isInteger(pop.size)).toBe(true);
      expect(pop.size).toBeGreaterThanOrEqual(1);
      expect(pop.size).toBeLessThanOrEqual(defaultConfig.maxPopSize);
    }
  });

  test("pop ids stay unique", () => {
    const ids = pops.map((pop) => pop.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("regions capped below their pops' needs shrink to their caps", () => {
    expect(population(region(after, "veyra-2"))).toBeCloseTo(1200, 0);
    expect(population(region(after, "korrins-reach-1"))).toBeCloseTo(900, 0);
  });

  test("an underfed region recovers and grows to its cap", () => {
    expect(population(region(after, "imbrel-1"))).toBeCloseTo(600, 0);
  });
});
