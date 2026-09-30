import { describe, expect, test } from "vitest";
import { createPop, createRegion } from "./index";

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
