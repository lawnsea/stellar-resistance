import { describe, expect, test } from "vitest";
import { createPop, createRegion, defaultConfig, Region } from "./index";
import { splitAndRemovePops } from "./lifecycle";
import { exactSize, withExactSize } from "./pop";

const base = createPop({
  id: "p",
  size: 1000,
  actualStandardOfLiving: 1.2,
  expectedStandardOfLiving: 1.1,
});

describe("splitAndRemovePops", () => {
  test("splits a pop over the maximum into two new pops of half its size", () => {
    const big = withExactSize(base, 5000.7);
    const [a, b, ...rest] = splitAndRemovePops([big], defaultConfig);
    expect(rest).toHaveLength(0);
    for (const half of [a, b]) {
      expect(half && exactSize(half)).toBeCloseTo(2500.35, 9);
      expect(half?.size).toBe(2500);
      expect(half?.actualStandardOfLiving).toBe(1.2);
      expect(half?.expectedStandardOfLiving).toBe(1.1);
    }
    expect(a?.id).not.toBe(b?.id);
    expect([a?.id, b?.id]).not.toContain("p");
  });

  test("keeps a pop at exactly the maximum", () => {
    const full = withExactSize(base, 5000);
    expect(splitAndRemovePops([full], defaultConfig)).toEqual([full]);
  });

  test("removes a pop below 1", () => {
    const dying = withExactSize(base, 0.6);
    const other = createPop({ id: "q", size: 10, expectedStandardOfLiving: 1 });
    expect(splitAndRemovePops([dying, other], defaultConfig)).toEqual([other]);
  });

  test("keeps a pop at exactly 1", () => {
    const one = withExactSize(base, 1);
    expect(splitAndRemovePops([one], defaultConfig)).toEqual([one]);
  });
});

describe("Region.tick", () => {
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
