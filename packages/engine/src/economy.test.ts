import { describe, expect, test } from "vitest";
import {
  computeRegionEconomy,
  createPlanet,
  createPop,
  createRegion,
  defaultConfig,
  testPlanets,
  tick,
} from "./index";

const region = createRegion({
  id: "r1",
  type: "urban",
  productivity: 0.8,
  pops: [
    createPop({ id: "p1", size: 1000, expectedStandardOfLiving: 0.5 }),
    createPop({ id: "p2", size: 3000, expectedStandardOfLiving: 0.7 }),
  ],
});

describe("computeRegionEconomy", () => {
  test("production is total pop size times productivity times the rate", () => {
    const config = { ...defaultConfig, productionRate: 2 };
    expect(computeRegionEconomy(region, config).production).toBeCloseTo(
      4000 * 0.8 * 2,
    );
  });

  test("consumption is pop size times standard of living times the rate", () => {
    const config = { ...defaultConfig, consumptionRate: 0.5 };
    expect(computeRegionEconomy(region, config).consumption).toBeCloseTo(
      (1000 * 0.5 + 3000 * 0.7) * 0.5,
    );
  });

  test("surplus is production minus consumption", () => {
    const { production, consumption, surplus } = computeRegionEconomy(region);
    expect(surplus).toBeCloseTo(production - consumption);
  });

  test("an unpopulated region produces and consumes nothing", () => {
    expect(computeRegionEconomy({ ...region, pops: [] })).toEqual({
      production: 0,
      consumption: 0,
      surplus: 0,
    });
  });
});

describe("tick", () => {
  test("reports every region's economy", () => {
    const planet = createPlanet({
      id: "pl1",
      name: "Ferrix",
      regions: [region],
    });
    expect(tick([planet])).toEqual({ r1: computeRegionEconomy(region) });
  });

  test("every populated test region has a surplus", () => {
    const report = tick(testPlanets);
    for (const planet of testPlanets) {
      for (const r of planet.regions) {
        if (r.pops.length > 0) {
          expect(report[r.id]?.surplus, r.id).toBeGreaterThan(0);
        }
      }
    }
  });

  test("consumption is set a little less than production", () => {
    expect(defaultConfig.consumptionRate).toBeLessThan(
      defaultConfig.productionRate,
    );
  });
});
