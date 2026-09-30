import { describe, expect, test } from "vitest";
import {
  createPlanet,
  createPop,
  createRegion,
  defaultConfig,
  type Planet,
  type Pop,
  tick,
} from "./index";
import { splitAndRemovePops } from "./lifecycle";
import { exactSize, withExactSize } from "./pop";

const base = createPop({
  id: "p",
  size: 1000,
  actualStandardOfLiving: 1.2,
  expectedStandardOfLiving: 1.1,
});

function planetWith(pops: Pop[]): Planet {
  return createPlanet({
    id: "pl",
    name: "Ferrix",
    regions: [createRegion({ id: "r1", type: "urban", pops })],
  });
}

function popsAfter(planets: readonly Planet[]): readonly Pop[] {
  return planets[0]?.regions[0]?.pops ?? [];
}

describe("splitAndRemovePops", () => {
  test("splits a pop over the maximum into two new pops of half its size", () => {
    const big = withExactSize(base, 5000.7);
    const [a, b, ...rest] = popsAfter(
      splitAndRemovePops([planetWith([big])], defaultConfig),
    );
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
    expect(
      popsAfter(splitAndRemovePops([planetWith([full])], defaultConfig)),
    ).toEqual([full]);
  });

  test("removes a pop below 1", () => {
    const dying = withExactSize(base, 0.6);
    const other = createPop({ id: "q", size: 10, expectedStandardOfLiving: 1 });
    expect(
      popsAfter(
        splitAndRemovePops([planetWith([dying, other])], defaultConfig),
      ),
    ).toEqual([other]);
  });

  test("keeps a pop at exactly 1", () => {
    const one = withExactSize(base, 1);
    expect(
      popsAfter(splitAndRemovePops([planetWith([one])], defaultConfig)),
    ).toEqual([one]);
  });

  test("a region whose last pop dies becomes unpopulated", () => {
    const dying = withExactSize(base, 0.2);
    expect(
      popsAfter(splitAndRemovePops([planetWith([dying])], defaultConfig)),
    ).toEqual([]);
  });
});

describe("tick", () => {
  const config = { ...defaultConfig, productionRate: 2 };

  test("splits a pop that grows past the maximum during the tick", () => {
    // Starts under the maximum; this tick's births push it over.
    const growing = createPop({
      id: "g",
      size: 4990,
      actualStandardOfLiving: 2,
      expectedStandardOfLiving: 1,
    });
    const pops = popsAfter(tick([planetWith([growing])], config).planets);
    expect(pops).toHaveLength(2);
    expect(pops.map((p) => p.size).every((s) => s <= 2600)).toBe(true);
  });

  test("removes a pop that shrinks below 1 during the tick", () => {
    const starving = createPop({
      id: "s",
      size: 1,
      actualStandardOfLiving: 0,
      expectedStandardOfLiving: 1,
    });
    expect(popsAfter(tick([planetWith([starving])], config).planets)).toEqual(
      [],
    );
  });
});
