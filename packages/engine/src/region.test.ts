import { describe, expect, test } from "vitest";
import {
  birthRate,
  computeRegionEconomy,
  createPop,
  createRegion,
  deathRate,
  defaultConfig,
  type EngineConfig,
  type Pop,
  Region,
  type RegionState,
} from "./index";
import { exactSize, withExactSize } from "./pop";

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

const base = createPop({
  id: "p",
  size: 1000,
  actualStandardOfLiving: 1.2,
  expectedStandardOfLiving: 1.1,
});

describe("createRegion", () => {
  const pop = createPop({ id: "p1", size: 100, expectedStandardOfLiving: 1 });
  const fields = {
    id: "r1",
    type: "rural" as const,
    productionCap: 1000,
    pops: [pop],
  };

  test("creates a region with its pops", () => {
    expect(createRegion(fields)).toEqual(fields);
  });

  test("copies the pops array", () => {
    const pops = [pop];
    const region = createRegion({ ...fields, pops });
    pops.push(createPop({ id: "p2", size: 200, expectedStandardOfLiving: 1 }));
    expect(region.pops).toHaveLength(1);
  });

  test.each([0.5, 1000])("accepts production cap %s", (productionCap) => {
    expect(createRegion({ ...fields, productionCap }).productionCap).toBe(
      productionCap,
    );
  });

  test.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects production cap %s",
    (productionCap) => {
      expect(() => createRegion({ ...fields, productionCap })).toThrow(
        "Region r1 production cap must be a positive number",
      );
    },
  );

  test("allows an unpopulated region", () => {
    expect(createRegion({ ...fields, pops: [] }).pops).toEqual([]);
  });
});

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

describe("Region.tick splits and removes pops", () => {
  // No births or deaths, so each pop's size stays as set until it's split or
  // removed.
  const steady = { ...defaultConfig, baseBirthRate: 0, baseDeathRate: 0 };

  function popsAfterTick(pops: Pop[]): readonly Pop[] {
    const ticked = new Region(
      createRegion({ id: "r1", type: "urban", productionCap: 1e9, pops }),
      steady,
    );
    ticked.tick();
    return ticked.getState().pops;
  }

  test("splits a pop over the maximum into two new pops of half its size", () => {
    const [a, b, ...rest] = popsAfterTick([withExactSize(base, 5000.7)]);
    expect(rest).toHaveLength(0);
    for (const half of [a, b]) {
      expect(half && exactSize(half)).toBeCloseTo(2500.35, 9);
      expect(half?.size).toBe(2500);
    }
    expect(a?.actualStandardOfLiving).toBe(b?.actualStandardOfLiving);
    expect(a?.expectedStandardOfLiving).toBe(b?.expectedStandardOfLiving);
    expect(a?.id).not.toBe(b?.id);
    expect([a?.id, b?.id]).not.toContain("p");
  });

  test("keeps a pop at exactly the maximum", () => {
    const pops = popsAfterTick([withExactSize(base, 5000)]);
    expect(pops.map((pop) => [pop.id, exactSize(pop)])).toEqual([["p", 5000]]);
  });

  test("removes a pop below 1", () => {
    const other = createPop({ id: "q", size: 10, expectedStandardOfLiving: 1 });
    const pops = popsAfterTick([withExactSize(base, 0.6), other]);
    expect(pops.map((pop) => pop.id)).toEqual(["q"]);
  });

  test("keeps a pop at exactly 1", () => {
    const pops = popsAfterTick([withExactSize(base, 1)]);
    expect(pops.map((pop) => [pop.id, exactSize(pop)])).toEqual([["p", 1]]);
  });
});

describe("Region.tick splitting and removal", () => {
  const config = { ...defaultConfig, productionRate: 2 };

  function tickPops(size: number, actualStandardOfLiving: number) {
    const pop = createPop({
      id: "p",
      size,
      actualStandardOfLiving,
      expectedStandardOfLiving: 1,
    });
    const region = createRegion({
      id: "r1",
      type: "urban",
      productionCap: 1e9,
      pops: [pop],
    });
    const ticked = new Region(region, config);
    ticked.tick();
    return ticked.pops;
  }

  test("splits a pop that grows past the maximum during the tick", () => {
    // Starts under the maximum; this tick's births push it over.
    const pops = tickPops(4990, 2);
    expect(pops).toHaveLength(2);
    expect(pops.every((p) => p.size <= 2600)).toBe(true);
  });

  test("removes a pop that shrinks below 1, leaving the region unpopulated", () => {
    expect(tickPops(1, 0)).toEqual([]);
  });
});
