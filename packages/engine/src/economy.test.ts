import { describe, expect, test } from "vitest";
import {
  computeRegionEconomy,
  createPlanet,
  createPop,
  createRegion,
  defaultConfig,
  nextExpectedStandardOfLiving,
  type Planet,
  tick,
} from "./index";

const config = {
  ...defaultConfig,
  productionRate: 1,
  expectationAdjustmentRate: 0.5,
};

function pop(id: string, size: number, actual = 1, expected = 1) {
  return createPop({
    id,
    size,
    actualStandardOfLiving: actual,
    expectedStandardOfLiving: expected,
  });
}

function region(pops: ReturnType<typeof pop>[]) {
  return createRegion({ id: "r1", type: "urban", pops });
}

describe("computeRegionEconomy", () => {
  test("production is the sum of size × rate × min(1, actual standard of living)", () => {
    const r = region([pop("a", 1000, 0.5), pop("b", 3000, 1.5)]);
    expect(
      computeRegionEconomy(r, { ...config, productionRate: 2 }).production,
    ).toBeCloseTo(1000 * 2 * 0.5 + 3000 * 2 * 1);
  });

  test("consumption is one unit per person", () => {
    const r = region([pop("a", 1000), pop("b", 3000)]);
    expect(computeRegionEconomy(r, config).consumption).toBe(4000);
  });

  test("surplus is production minus consumption", () => {
    const r = region([pop("a", 1000, 0.8)]);
    const { production, consumption, surplus } = computeRegionEconomy(
      r,
      config,
    );
    expect(surplus).toBeCloseTo(production - consumption);
  });

  test("an unpopulated region produces and consumes nothing", () => {
    expect(computeRegionEconomy(region([]), config)).toEqual({
      production: 0,
      consumption: 0,
      surplus: 0,
    });
  });
});

describe("nextExpectedStandardOfLiving", () => {
  test("moves toward actual, dampened by the adjustment rate", () => {
    expect(nextExpectedStandardOfLiving(2, 3, config)).toBeCloseTo(2.5);
    expect(nextExpectedStandardOfLiving(2, 1.5, config)).toBeCloseTo(1.75);
  });

  test("can fall below 1.0", () => {
    expect(nextExpectedStandardOfLiving(1.2, 0.2, config)).toBeCloseTo(0.7);
  });
});

test("a pop that starves for several ticks comes to expect starvation", () => {
  const r = region([pop("a", 1000, 0, 1.2)]);
  let planets: readonly Planet[] = [
    createPlanet({ id: "pl", name: "Ferrix", regions: [r] }),
  ];
  for (let i = 0; i < 20; i++) {
    planets = tick(planets, config).planets;
  }
  const starving = planets[0]?.regions[0]?.pops[0];
  expect(starving?.actualStandardOfLiving).toBe(0);
  expect(starving?.expectedStandardOfLiving).toBeLessThan(0.01);
});

describe("tick", () => {
  test("splits production among pops by size", () => {
    // Production: 1000 × 0.5 + 3000 × 1 = 3500 units for 4000 people.
    const r = region([pop("a", 1000, 0.5), pop("b", 3000, 1)]);
    const planet = createPlanet({ id: "pl", name: "Ferrix", regions: [r] });
    const [next] = tick([planet], config).planets;
    const [a, b] = next?.regions[0]?.pops ?? [];
    expect(a?.actualStandardOfLiving).toBeCloseTo(3500 / 4000);
    expect(b?.actualStandardOfLiving).toBeCloseTo(3500 / 4000);
  });

  test("a pop of 500 whose share is 500 units has an actual standard of living of 1.0", () => {
    const r = region([pop("a", 500, 1)]);
    const planet = createPlanet({ id: "pl", name: "Ferrix", regions: [r] });
    const result = tick([planet], config);
    expect(result.report.r1?.production).toBe(500);
    expect(result.planets[0]?.regions[0]?.pops[0]?.actualStandardOfLiving).toBe(
      1,
    );
  });

  test("updates expected standard of living toward the new actual", () => {
    const r = region([pop("a", 1000, 1, 2)]);
    const planet = createPlanet({ id: "pl", name: "Ferrix", regions: [r] });
    const next = tick([planet], { ...config, productionRate: 1.5 }).planets;
    // Actual becomes 1.5; expected moves halfway from 2 toward 1.5.
    expect(next[0]?.regions[0]?.pops[0]?.expectedStandardOfLiving).toBeCloseTo(
      1.75,
    );
  });

  test("reports each region's economy", () => {
    const r = region([pop("a", 1000, 0.8)]);
    const planet = createPlanet({ id: "pl", name: "Ferrix", regions: [r] });
    expect(tick([planet], config).report).toEqual({
      r1: computeRegionEconomy(r, config),
    });
  });

  test("doesn't mutate its input", () => {
    const r = region([pop("a", 1000, 0.5, 2)]);
    const planet = createPlanet({ id: "pl", name: "Ferrix", regions: [r] });
    const snapshot = JSON.parse(JSON.stringify(planet));
    const result = tick([planet], config);
    expect(planet).toEqual(snapshot);
    expect(result.planets[0]).not.toBe(planet);
  });

  test("pops fully provided for run a surplus at the default production rate", () => {
    expect(defaultConfig.productionRate).toBeGreaterThan(1);
    const r = region([pop("a", 1000, 1)]);
    expect(computeRegionEconomy(r).surplus).toBeGreaterThan(0);
  });
});
