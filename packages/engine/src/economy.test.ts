import { describe, expect, test } from "vitest";
import {
  birthRate,
  computeRegionEconomy,
  createPop,
  createRegion,
  deathRate,
  defaultConfig,
  type EngineConfig,
  nextExpectedStandardOfLiving,
  Region,
  type RegionState,
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

function region(pops: ReturnType<typeof pop>[], productionCap = 1e9) {
  return createRegion({ id: "r1", type: "urban", productionCap, pops });
}

function tickRegion(
  r: RegionState,
  n = 1,
  engineConfig: EngineConfig = config,
): RegionState {
  const region = new Region(r, engineConfig);
  region.tick(n);
  return region.getState();
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

  test("production never exceeds the region's cap", () => {
    // Uncapped: 1000 × 1 × 1 = 1000 units.
    const r = region([pop("a", 1000, 1)], 800);
    const economy = computeRegionEconomy(r, config);
    expect(economy.production).toBe(800);
    expect(economy.surplus).toBe(800 - 1000);
  });

  test("production below the cap is unaffected", () => {
    const r = region([pop("a", 1000, 1)], 1200);
    expect(computeRegionEconomy(r, config).production).toBe(1000);
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
  const starving = tickRegion(region([pop("a", 1000, 0, 1.2)]), 20).pops[0];
  expect(starving?.actualStandardOfLiving).toBe(0);
  expect(starving?.expectedStandardOfLiving).toBeLessThan(0.01);
});

describe("Region.tick", () => {
  test("splits production among pops by size", () => {
    // Production: 1000 × 0.5 + 3000 × 1 = 3500 units for 4000 people.
    const [a, b] = tickRegion(
      region([pop("a", 1000, 0.5), pop("b", 3000, 1)]),
    ).pops;
    expect(a?.actualStandardOfLiving).toBeCloseTo(3500 / 4000);
    expect(b?.actualStandardOfLiving).toBeCloseTo(3500 / 4000);
  });

  test("a pop of 500 whose share is 500 units has an actual standard of living of 1.0", () => {
    const r = region([pop("a", 500, 1)]);
    expect(computeRegionEconomy(r, config).production).toBe(500);
    expect(tickRegion(r).pops[0]?.actualStandardOfLiving).toBe(1);
  });

  test("updates expected standard of living toward the new actual", () => {
    const next = tickRegion(region([pop("a", 1000, 1, 2)]), 1, {
      ...config,
      productionRate: 1.5,
    });
    // Actual becomes 1.5; expected moves halfway from 2 toward 1.5.
    expect(next.pops[0]?.expectedStandardOfLiving).toBeCloseTo(1.75);
  });

  test("a capped region's pops get the capped share", () => {
    const next = tickRegion(region([pop("a", 1000, 1)], 800));
    expect(next.pops[0]?.actualStandardOfLiving).toBeCloseTo(0.8);
  });

  test("tick replaces its state without mutating the previous state", () => {
    const r = region([pop("a", 1000, 0.5, 2)]);
    const snapshot = JSON.parse(JSON.stringify(r));
    const ticked = new Region(r, config);
    const before = ticked.getState();
    ticked.tick();
    expect(before).toEqual(snapshot);
    expect(ticked.getState()).not.toEqual(snapshot);
  });

  test("tick(n) equals n single ticks", () => {
    const r = region([pop("a", 1000, 0.5, 2), pop("b", 700, 0.5, 1)]);
    const all = new Region(r, config);
    all.tick(5);
    const oneAtATime = new Region(r, config);
    for (let i = 0; i < 5; i++) {
      oneAtATime.tick();
    }
    expect(all.getState()).toEqual(oneAtATime.getState());
  });

  test("pops fully provided for run a surplus at the default production rate", () => {
    expect(defaultConfig.productionRate).toBeGreaterThan(1);
    const r = region([pop("a", 1000, 1)]);
    expect(computeRegionEconomy(r).surplus).toBeGreaterThan(0);
  });
});

describe("births and deaths", () => {
  function tickPop(p: ReturnType<typeof pop>, times = 1) {
    const next = tickRegion(region([p]), times).pops[0];
    if (!next) throw new Error("pop missing");
    return next;
  }

  test("births and deaths follow the previous tick's standard of living", () => {
    // Previous actual 1.5; this tick's actual becomes 1.0.
    const next = tickPop(pop("a", 1000, 1.5));
    const expected =
      1000 + (birthRate(1.5, config) - deathRate(1.5, config)) * 1000;
    expect(next.size).toBe(Math.floor(expected));
  });

  test("a starving pop shrinks", () => {
    expect(tickPop(pop("a", 1000, 0)).size).toBeLessThan(1000);
  });

  test("fractional births accumulate across ticks", () => {
    // A thriving pop of 40 gains less than one person per tick.
    const thriving = { ...config, productionRate: 1.5 };
    const growth = (birthRate(1.5, thriving) - deathRate(1.5, thriving)) * 40;
    expect(growth).toBeLessThan(1);
    const next = tickRegion(region([pop("a", 40, 1.5)]), 10, thriving);
    expect(next.pops[0]?.size).toBeGreaterThan(40);
  });

  test("size in the API is always an integer", () => {
    const next = tickPop(pop("a", 1234, 1.3), 3);
    expect(Number.isInteger(next.size)).toBe(true);
  });
});
