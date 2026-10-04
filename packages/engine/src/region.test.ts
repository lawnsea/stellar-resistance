import { describe, expect, test } from "vitest";
import {
  Cell,
  computeRegionEconomy,
  createCell,
  createInfrastructure,
  createOperation,
  createPop,
  createRegion,
  defaultConfig,
  type EngineConfig,
  Infrastructure,
  type InfrastructureState,
  type PopState,
  Region,
  type RegionState,
  regionPops,
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

function region(
  pops: ReturnType<typeof pop>[],
  productionCap = 1e9,
  production?: number,
  engineConfig: EngineConfig = config,
) {
  return createRegion(
    { id: "r1", type: "urban", productionCap, pops, production },
    engineConfig,
  );
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
  const onePop = createPop({
    id: "p1",
    size: 100,
    expectedStandardOfLiving: 1,
  });
  const fields = {
    id: "r1",
    type: "rural" as const,
    productionCap: 1000,
    pops: [onePop],
  };

  test("puts its pops in a new regional cell", () => {
    const { pops, ...own } = fields;
    expect(createRegion(fields)).toEqual({
      ...own,
      production: 100 * defaultConfig.productionRate,
      regionalCell: {
        id: "r1-cell",
        faction: "",
        region: "r1",
        income: 100 * defaultConfig.productionRate,
        stockpile: 0,
        pops,
        operations: [],
        nextOperationNumber: 1,
      },
      cells: [],
      infrastructure: [],
      nextInfrastructureNumber: 1,
    });
  });

  test("keeps other factions' cells and counts their pops' production", () => {
    const resistance = createCell({
      id: "res-1",
      faction: "res",
      region: "r1",
      pops: [pop("b", 300, 1)],
    });
    const r = createRegion({ ...fields, cells: [resistance] });
    expect(r.cells).toEqual([resistance]);
    expect(r.production).toBeCloseTo(400 * defaultConfig.productionRate);
  });

  test("computes production from its pops when not given", () => {
    // size × rate × min(1, actual standard of living), capped.
    const r = region(
      [pop("a", 1000, 0.5), pop("b", 3000, 1.5)],
      1e9,
      undefined,
      {
        ...config,
        productionRate: 2,
      },
    );
    expect(r.production).toBeCloseTo(1000 * 2 * 0.5 + 3000 * 2 * 1);
  });

  test("caps computed production at the production cap", () => {
    expect(region([pop("a", 1000, 1)], 800).production).toBe(800);
    expect(region([pop("a", 1000, 1)], 1200).production).toBe(1000);
  });

  test("keeps a given production", () => {
    expect(region([pop("a", 1000, 1)], 1e9, 250).production).toBe(250);
  });

  test.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects production %s",
    (production) => {
      expect(() => createRegion({ ...fields, production })).toThrow(
        "Region r1 production must be at least 0",
      );
    },
  );

  test("copies the pops array", () => {
    const pops = [onePop];
    const region = createRegion({ ...fields, pops });
    pops.push(createPop({ id: "p2", size: 200, expectedStandardOfLiving: 1 }));
    expect(regionPops(region)).toHaveLength(1);
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
    expect(regionPops(createRegion({ ...fields, pops: [] }))).toEqual([]);
  });
});

describe("Region cells", () => {
  const resistance = createCell({
    id: "res-1",
    faction: "res",
    region: "r1",
    pops: [pop("b", 300)],
  });

  test("holds its regional cell and other cells, with the region as their region", () => {
    const r = new Region(
      createRegion({
        id: "r1",
        type: "urban",
        productionCap: 1e9,
        pops: [pop("a", 100)],
        cells: [resistance],
      }),
    );
    expect(r.regionalCell).toBeInstanceOf(Cell);
    expect(r.regionalCell.region).toBe(r);
    expect(r.cells[0]?.region).toBe(r);
    expect(r.pops.map((p) => p.id)).toEqual(["a", "b"]);
    expect(r.pops[1]?.cell).toBe(r.cells[0]);
  });

  test("a cell naming a different region is an error", () => {
    const elsewhere = { ...resistance, region: "r2" };
    const data = createRegion({ id: "r1", type: "urban", productionCap: 1e9 });
    expect(() => new Region({ ...data, cells: [elsewhere] })).toThrow(
      "Cell res-1 is in region r1 but names region r2",
    );
  });

  test("a split pop's halves stay in its cell", () => {
    const steady = { ...defaultConfig, baseBirthRate: 0, baseDeathRate: 0 };
    const big = createCell({
      ...resistance,
      pops: [withExactSize(pop("big", 100), 5000.7)],
    });
    const r = new Region(
      createRegion(
        { id: "r1", type: "urban", productionCap: 1e9, cells: [big] },
        steady,
      ),
      steady,
    );
    r.tick();
    expect(r.cells[0]?.pops.map((p) => p.id)).toEqual(["big.1", "big.2"]);
    expect(r.cells[0]?.pops.every((p) => p.cell === r.cells[0])).toBe(true);
    expect(r.regionalCell.pops).toEqual([]);
  });
});

describe("computeRegionEconomy", () => {
  test("reports the production from the region's last tick", () => {
    expect(
      computeRegionEconomy(region([pop("a", 1000)], 1e9, 640)).production,
    ).toBe(640);
  });

  test("consumption is one unit per person", () => {
    const r = region([pop("a", 1000), pop("b", 3000)]);
    expect(computeRegionEconomy(r).consumption).toBe(4000);
  });

  test("surplus is production minus consumption", () => {
    const economy = computeRegionEconomy(region([pop("a", 1000)], 1e9, 800));
    expect(economy.surplus).toBe(800 - 1000);
  });

  test("an unpopulated region produces and consumes nothing", () => {
    expect(computeRegionEconomy(region([]))).toEqual({
      production: 0,
      consumption: 0,
      surplus: 0,
    });
  });
});

test("a pop that starves for several ticks comes to expect starvation", () => {
  const starving = regionPops(
    tickRegion(region([pop("a", 1000, 0, 1.2)]), 20),
  )[0];
  expect(starving?.actualStandardOfLiving).toBe(0);
  expect(starving?.expectedStandardOfLiving).toBeLessThan(0.01);
});

describe("Region.tick", () => {
  test("distributes last tick's production among pops by size", () => {
    // 3500 units for 4000 people.
    const [a, b] = regionPops(
      tickRegion(region([pop("a", 1000), pop("b", 3000)], 1e9, 3500)),
    );
    expect(a?.actualStandardOfLiving).toBeCloseTo(3500 / 4000);
    expect(b?.actualStandardOfLiving).toBeCloseTo(3500 / 4000);
  });

  test("a pop of 500 whose share is 500 units has an actual standard of living of 1.0", () => {
    expect(
      regionPops(tickRegion(region([pop("a", 500)], 1e9, 500)))[0]
        ?.actualStandardOfLiving,
    ).toBe(1);
  });

  test("updates expected standard of living toward the new actual", () => {
    // Actual becomes 1.5; expected moves halfway from 2 toward 1.5.
    const next = tickRegion(region([pop("a", 1000, 1, 2)], 1e9, 1500));
    expect(regionPops(next)[0]?.expectedStandardOfLiving).toBeCloseTo(1.75);
  });

  test("produces size × rate × min(1, new actual standard of living) for the next tick", () => {
    const next = tickRegion(region([pop("a", 1000, 1)], 1e9, 500));
    const [ticked] = regionPops(next);
    expect(ticked?.actualStandardOfLiving).toBeCloseTo(0.5);
    expect(next.production).toBeCloseTo(
      (ticked ? exactSize(ticked) : 0) * config.productionRate * 0.5,
    );
  });

  test("caps the next tick's production", () => {
    expect(tickRegion(region([pop("a", 1000)], 800, 1000)).production).toBe(
      800,
    );
  });

  test("a capped region's pops get the capped share", () => {
    const next = tickRegion(region([pop("a", 1000, 1)], 800));
    expect(regionPops(next)[0]?.actualStandardOfLiving).toBeCloseTo(0.8);
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
    const r = region([pop("a", 1000, 1)], 1e9, undefined, defaultConfig);
    expect(computeRegionEconomy(r).surplus).toBeGreaterThan(0);
  });
});

describe("Region.tick splits and removes pops", () => {
  // No births or deaths, so each pop's size stays as set until it's split or
  // removed.
  const steady = { ...defaultConfig, baseBirthRate: 0, baseDeathRate: 0 };

  function popsAfterTick(pops: PopState[]): readonly PopState[] {
    const ticked = new Region(
      createRegion({ id: "r1", type: "urban", productionCap: 1e9, pops }),
      steady,
    );
    ticked.tick();
    return regionPops(ticked.getState());
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
    const region = createRegion(
      {
        id: "r1",
        type: "urban",
        productionCap: 1e9,
        pops: [pop],
      },
      config,
    );
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

describe("Region infrastructure", () => {
  const steady = { ...defaultConfig, baseBirthRate: 0, baseDeathRate: 0 };
  const plant = createInfrastructure({
    id: "i1",
    type: "production",
    controller: "res",
  });

  function regionWith(
    resistancePops: PopState[],
    controller = "res",
    regionalPops: PopState[] = [pop("a", 100)],
  ): Region {
    const data = createRegion(
      {
        id: "r1",
        type: "urban",
        productionCap: 1e9,
        pops: regionalPops,
        cells: [
          createCell({
            id: "res-1",
            faction: "res",
            region: "r1",
            pops: resistancePops,
          }),
        ],
        infrastructure: [{ ...plant, controller }],
      },
      steady,
    );
    return new Region(
      { ...data, regionalCell: { ...data.regionalCell, faction: "gov" } },
      steady,
    );
  }

  test("createRegion keeps a copy of the given infrastructure", () => {
    const infrastructure = [plant];
    const r = createRegion({
      id: "r1",
      type: "urban",
      productionCap: 1e9,
      infrastructure,
    });
    infrastructure.push(plant);
    expect(r.infrastructure).toEqual([plant]);
  });

  test("holds its infrastructure as Infrastructure instances", () => {
    const r = regionWith([pop("b", 100)]);
    expect(r.infrastructure[0]).toBeInstanceOf(Infrastructure);
    expect(r.getState().infrastructure).toEqual([plant]);
  });

  test("a controller with pops in the region keeps control", () => {
    const r = regionWith([pop("b", 100)]);
    r.tick();
    expect(r.infrastructure[0]?.controllerId).toBe("res");
  });

  test("control reverts to the planetary faction when the controller has no cell with pops", () => {
    const r = regionWith([]);
    r.tick();
    expect(r.infrastructure[0]?.controllerId).toBe("gov");
  });

  test("control reverts in the tick the controller's last pop dies out", () => {
    const r = regionWith([withExactSize(pop("b", 100), 0.6)]);
    r.tick();
    expect(r.cells[0]?.pops).toEqual([]);
    expect(r.infrastructure[0]?.controllerId).toBe("gov");
  });

  test("the planetary faction keeps control even with no pops", () => {
    const r = regionWith([], "gov", []);
    expect(r.pops).toEqual([]);
    r.tick();
    expect(r.infrastructure[0]?.controllerId).toBe("gov");
  });
});

describe("Region distribution and upkeep", () => {
  const economy = {
    ...defaultConfig,
    productionRate: 1,
    baseBirthRate: 0,
    baseDeathRate: 0,
    infrastructureUpkeep: { production: 100, extraction: 100 },
    neglectEfficiency: 0.2,
    repairEfficiency: 0.1,
    destructionThreshold: 0.05,
  };

  function infra(id: string, controller: string, fields = {}) {
    return createInfrastructure(
      { id, type: "production", controller, ...fields },
      economy,
    );
  }

  function tickWith(
    production: number,
    infrastructure: ReturnType<typeof infra>[],
    resistancePops: PopState[] = [],
  ): Region {
    const data = createRegion(
      {
        id: "r1",
        type: "urban",
        productionCap: 1e9,
        production,
        pops: [pop("a", 1000)],
        cells: [
          createCell({
            id: "res-1",
            faction: "res",
            region: "r1",
            pops: resistancePops,
          }),
        ],
        infrastructure,
      },
      economy,
    );
    const r = new Region(
      { ...data, regionalCell: { ...data.regionalCell, faction: "gov" } },
      economy,
    );
    r.tick();
    return r;
  }

  test("reserves the regional cell's needs, pays upkeep, and shares the rest with its pops", () => {
    // 1300 units: 1000 reserved, 100 upkeep, 200 left over for the pops.
    const r = tickWith(1300, [infra("i1", "gov")]);
    expect(r.regionalCell.pops[0]?.actualStandardOfLiving).toBeCloseTo(1.2);
    expect(r.infrastructure[0]?.condition).toBe(1);
  });

  test("cuts every budget by the same share when upkeep can't be paid in full", () => {
    // 1200 units: 1000 reserved, 200 for 400 of budgets, so each gets 50%.
    const r = tickWith(1200, [
      infra("i1", "gov"),
      infra("i2", "gov", { upkeepBudget: 300 }),
    ]);
    expect(r.regionalCell.pops[0]?.actualStandardOfLiving).toBeCloseTo(1);
    // i1: 50 of 100 needed against a condition of 1.0: 1.0 − 0.2 × 0.5.
    expect(r.infrastructure[0]?.condition).toBeCloseTo(0.9);
    // i2: 150 of 100 needed, so it stays at 1.0.
    expect(r.infrastructure[1]?.condition).toBe(1);
  });

  test("pops get everything when production doesn't cover their needs", () => {
    const r = tickWith(800, [infra("i1", "gov")]);
    expect(r.regionalCell.pops[0]?.actualStandardOfLiving).toBeCloseTo(0.8);
    expect(r.infrastructure[0]?.condition).toBeCloseTo(0.8);
  });

  test("a budget above the requirement repairs damage", () => {
    const r = tickWith(2000, [
      infra("i1", "gov", { upkeepBudget: 150, condition: 0.5 }),
    ]);
    // 0.5 + 0.1 × (1.5 − 0.5).
    expect(r.infrastructure[0]?.condition).toBeCloseTo(0.6, 6);
  });

  test("pops in other cells with no income receive nothing", () => {
    const r = tickWith(2000, [], [pop("b", 500)]);
    expect(r.cells[0]?.pops[0]?.actualStandardOfLiving).toBe(0);
    expect(r.regionalCell.pops[0]?.actualStandardOfLiving).toBeCloseTo(2);
  });

  test("other factions' infrastructure isn't paid", () => {
    const r = tickWith(2000, [infra("i1", "res")], [pop("b", 500)]);
    expect(r.infrastructure[0]?.condition).toBeCloseTo(0.8);
  });

  test("infrastructure whose condition falls below the threshold is destroyed and removed", () => {
    const r = tickWith(
      2000,
      [infra("i1", "res", { condition: 0.06 })],
      [pop("b", 500)],
    );
    expect(r.infrastructure).toEqual([]);
  });
});

describe("Region staffing, impact, and extraction", () => {
  const economy: EngineConfig = {
    ...defaultConfig,
    productionRate: 1,
    baseBirthRate: 0,
    baseDeathRate: 0,
    infrastructureUpkeep: { production: 0, extraction: 0 },
    infrastructureStaff: { production: 100, extraction: 100 },
    infrastructureImpact: { production: 0.5, extraction: 0.2 },
  };

  function infra(
    id: string,
    type: "production" | "extraction",
    controller: string,
    condition = 1,
  ) {
    return createInfrastructure({ id, type, controller, condition }, economy);
  }

  function cell(id: string, faction: string, size: number) {
    return createCell({
      id,
      faction,
      region: "r1",
      pops: size > 0 ? [pop(`${id}-p`, size, 1)] : [],
    });
  }

  // The regional cell's faction is "" here, so "" is the planetary faction.
  function output(
    infrastructure: ReturnType<typeof infra>[],
    cells: ReturnType<typeof cell>[] = [],
    { productionCap = 1e9, production = undefined as number | undefined } = {},
    config = economy,
  ): RegionState {
    return createRegion(
      {
        id: "r1",
        type: "urban",
        productionCap,
        production,
        pops: [pop("a", 1000, 1)],
        cells,
        infrastructure,
      },
      config,
    );
  }

  const incomes = (r: RegionState) =>
    [r.regionalCell, ...r.cells].map((c) => c.income);

  test("staff don't produce, and production infrastructure multiplies production", () => {
    // 900 working × (1 + 0.5).
    expect(output([infra("i1", "production", "")]).production).toBeCloseTo(
      1350,
      6,
    );
  });

  test("the cap applies before the multiple", () => {
    const r = output([infra("i1", "production", "")], [], {
      productionCap: 500,
    });
    expect(r.production).toBeCloseTo(750, 6);
  });

  test("production multiples add", () => {
    const r = output([
      infra("i1", "production", ""),
      infra("i2", "production", ""),
    ]);
    // 800 working × (1 + 0.5 + 0.5).
    expect(r.production).toBeCloseTo(1600, 6);
  });

  test("staff come from the controller's pops, and impact scales by staffing × condition", () => {
    const r = output(
      [infra("i1", "production", "res", 0.5)],
      [cell("res-1", "res", 50)],
    );
    // The regional cell's 1000 all work; res's 50 all staff, half the 100 needed.
    // 1000 × (1 + 0.5 × 0.5 × 0.5).
    expect(r.production).toBeCloseTo(1125, 6);
  });

  test("extraction moves a share of production to the controller's cell", () => {
    const r = output(
      [infra("i1", "extraction", "res")],
      [cell("res-1", "res", 100)],
    );
    expect(r.production).toBeCloseTo(1000, 6);
    expect(incomes(r)[0]).toBeCloseTo(800, 6);
    expect(incomes(r)[1]).toBeCloseTo(200, 6);
  });

  test("extraction is split among the faction's cells by size", () => {
    const r = output(
      [infra("i1", "extraction", "res")],
      [cell("res-1", "res", 100), cell("res-2", "res", 300)],
    );
    // 1000 + 400 × 0.75 working; 20% extracted, split 1:3.
    expect(r.production).toBeCloseTo(1300, 6);
    const [regional, res1, res2] = incomes(r);
    expect(regional).toBeCloseTo(1040, 6);
    expect(res1).toBeCloseTo(65, 6);
    expect(res2).toBeCloseTo(195, 6);
  });

  test("extraction over 100% is shared in proportion", () => {
    const r = output(
      [infra("i1", "extraction", "res"), infra("i2", "extraction", "ally")],
      [cell("res-1", "res", 100), cell("ally-1", "ally", 100)],
      {},
      {
        ...economy,
        infrastructureImpact: { production: 0.5, extraction: 0.8 },
      },
    );
    const [regional, res, ally] = incomes(r);
    expect(regional).toBeCloseTo(0, 6);
    expect(res).toBeCloseTo(500, 6);
    expect(ally).toBeCloseTo(500, 6);
  });

  test("the planetary faction's extraction infrastructure draws no staff and extracts nothing", () => {
    const r = output([infra("i1", "extraction", "")]);
    expect(r.production).toBeCloseTo(1000, 6);
    expect(incomes(r)).toEqual([r.production]);
  });

  test("a given production is still split by extraction", () => {
    const r = output(
      [infra("i1", "extraction", "res")],
      [cell("res-1", "res", 100)],
      { production: 500 },
    );
    expect(incomes(r)[0]).toBeCloseTo(400, 6);
    expect(incomes(r)[1]).toBeCloseTo(100, 6);
  });

  test("each tick stores production and incomes for the next", () => {
    const data = output(
      [infra("i1", "extraction", "res")],
      [cell("res-1", "res", 100)],
    );
    const r = new Region(data, economy);
    r.tick();
    // The regional cell's pops, fed 800 of 1000, produce at 0.8.
    expect(r.production).toBeCloseTo(800, 6);
    expect(r.regionalCell.income).toBeCloseTo(640, 6);
    expect(r.cells[0]?.income).toBeCloseTo(160, 6);
  });

  test("a faction's cells feed their own pops and pool their surplus for its upkeep", () => {
    const config = {
      ...economy,
      infrastructureUpkeep: { production: 100, extraction: 100 },
    };
    const data = output(
      [{ ...infra("i1", "production", "res", 0.5), upkeepBudget: 100 }],
      [cell("res-1", "res", 100), cell("res-2", "res", 100)],
      {},
      config,
    );
    const [res1, res2] = data.cells;
    if (!res1 || !res2) throw new Error("cells missing");
    const r = new Region(
      {
        ...data,
        cells: [
          { ...res1, income: 300 },
          { ...res2, income: 0 },
        ],
      },
      config,
    );
    r.tick();
    // res-1 reserves 100 and pools 200; upkeep takes 100; 100 returns to res-1.
    expect(r.cells[0]?.pops[0]?.actualStandardOfLiving).toBeCloseTo(2, 6);
    expect(r.cells[1]?.pops[0]?.actualStandardOfLiving).toBe(0);
    // Paid in full against a condition of 0.5: 0.5 + 0.05 × 0.5.
    expect(r.infrastructure[0]?.condition).toBeCloseTo(0.525, 6);
  });
});

describe("Region construction", () => {
  const building: EngineConfig = {
    ...defaultConfig,
    productionRate: 1,
    baseBirthRate: 0,
    baseDeathRate: 0,
    infrastructureUpkeep: { production: 100, extraction: 100 },
    infrastructureStaff: { production: 100, extraction: 100 },
    infrastructureImpact: { production: 0.5, extraction: 0.2 },
    infrastructureBuild: {
      production: { initialCost: 100, duration: 2, perTickCost: 50 },
      extraction: { initialCost: 100, duration: 2, perTickCost: 50 },
    },
    savingsRate: 0.5,
  };

  function regionWith({
    infrastructure = [] as InfrastructureState[],
    resIncome = 0,
    resSize = 100,
    resStockpile = 0,
    regionalStockpile = 0,
  } = {}): Region {
    const data = createRegion(
      {
        id: "r1",
        type: "urban",
        productionCap: 1e9,
        production: 1000,
        pops: [pop("a", 1000, 1)],
        cells: [
          createCell({
            id: "res-1",
            faction: "res",
            region: "r1",
            pops: resSize > 0 ? [pop("b", resSize, 1)] : [],
          }),
        ],
        infrastructure,
      },
      building,
    );
    const [res] = data.cells;
    if (!res) throw new Error("cell missing");
    return new Region(
      {
        ...data,
        regionalCell: {
          ...data.regionalCell,
          faction: "gov",
          stockpile: regionalStockpile,
        },
        cells: [{ ...res, income: resIncome, stockpile: resStockpile }],
      },
      building,
    );
  }

  test("each cell saves a share of what's left after its pops' reserve and upkeep", () => {
    const r = regionWith({ resIncome: 300 });
    r.tick();
    // 100 reserved; 200 left, half saved and half to the pops.
    expect(r.cells[0]?.stockpile).toBeCloseTo(100, 6);
    expect(r.cells[0]?.pops[0]?.actualStandardOfLiving).toBeCloseTo(2, 6);
  });

  test("building starts an operation on the cell and unbuilt infrastructure in the region", () => {
    const r = regionWith({ resStockpile: 150 });
    const cell = r.cells[0];
    if (!cell) throw new Error("cell missing");
    const operation = cell.build("extraction");
    expect(operation.getState()).toEqual(
      createOperation({
        id: "res-1-op-1",
        type: "build",
        target: "r1-infra-1",
        ...building.infrastructureBuild.extraction,
      }),
    );
    expect(cell.operations).toEqual([operation]);
    expect(cell.stockpile).toBe(50);
    expect(r.infrastructure.map((item) => item.getState())).toEqual([
      createInfrastructure(
        {
          id: "r1-infra-1",
          type: "extraction",
          controller: "res",
          built: false,
        },
        building,
      ),
    ]);
    expect(r.getState().nextInfrastructureNumber).toBe(2);
  });

  test("generated ids skip ones already in use", () => {
    const r = regionWith({
      infrastructure: [
        createInfrastructure(
          { id: "r1-infra-1", type: "production", controller: "gov" },
          building,
        ),
      ],
      regionalStockpile: 100,
    });
    expect(r.regionalCell.build("production").target).toBe("r1-infra-2");
    expect(r.getState().nextInfrastructureNumber).toBe(3);
  });

  test("building something the cell can't afford changes nothing", () => {
    const r = regionWith({ resStockpile: 99 });
    expect(() => r.cells[0]?.build("production")).toThrow(
      "Cell res-1 can't afford the initial cost of 100 from its stockpile of 99",
    );
    expect(r.infrastructure).toEqual([]);
    expect(r.getState().nextInfrastructureNumber).toBe(1);
  });

  test("the regional cell can't build extraction infrastructure", () => {
    expect(() =>
      regionWith({ regionalStockpile: 100 }).regionalCell.build("extraction"),
    ).toThrow("Regional cell r1-cell can't build extraction infrastructure");
  });

  test("a cell can only build in its own region", () => {
    const r = regionWith();
    const cell = regionWith().cells[0];
    if (!cell) throw new Error("cell missing");
    expect(() => r.build(cell, "production")).toThrow(
      "Cell res-1 isn't in region r1",
    );
    expect(() =>
      new Cell(createCell({ id: "c", faction: "res", region: "r1" })).build(
        "production",
      ),
    ).toThrow("Cell c isn't in a region");
  });

  test("operations are paid from the stockpile after saving, in part when short", () => {
    const r = regionWith({ resStockpile: 125, resIncome: 300 });
    const operation = r.cells[0]?.build("production");
    // 25 left after the initial cost, plus 100 saved this tick.
    r.tick();
    expect(operation?.progress).toBe(1);
    expect(r.cells[0]?.stockpile).toBeCloseTo(75, 6);
    r.cells[0]?.setIncome(100);
    r.cells[0]?.save(-50);
    r.tick();
    // 25 of 50.
    expect(operation?.progress).toBeCloseTo(1.5, 6);
  });

  test("unbuilt infrastructure draws no staff, needs no upkeep, and has no impact", () => {
    const r = regionWith({ resSize: 0, regionalStockpile: 100 });
    r.regionalCell.build("production");
    r.tick();
    expect(r.production).toBeCloseTo(1000, 6);
    expect(r.infrastructure[0]?.built).toBe(false);
    expect(r.infrastructure[0]?.condition).toBe(1);
  });

  test("a finished build operation builds its infrastructure in time for that tick's production", () => {
    const r = regionWith({ resSize: 0, regionalStockpile: 200 });
    r.regionalCell.build("production");
    r.tick(2);
    expect(r.regionalCell.operations).toEqual([]);
    expect(r.infrastructure[0]?.built).toBe(true);
    // 900 working × (1 + 0.5).
    expect(r.production).toBeCloseTo(1350, 6);
  });

  test("losing its presence cancels the operation and the unbuilt infrastructure reverts", () => {
    const r = regionWith({ resStockpile: 100 });
    const cell = r.cells[0];
    if (!cell) throw new Error("cell missing");
    cell.build("production");
    cell.setState({ ...cell.getState(), pops: [] });
    r.tick();
    expect(cell.operations).toEqual([]);
    expect(r.infrastructure[0]?.controllerId).toBe("gov");
    expect(r.infrastructure[0]?.built).toBe(false);
  });
});
