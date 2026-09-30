import { describe, expect, test } from "vitest";
import { createPop, createRegion } from "./index";

describe("createRegion", () => {
  const pop = createPop({ id: "p1", size: 100, expectedStandardOfLiving: 0.5 });
  const fields = {
    id: "r1",
    type: "rural" as const,
    productivity: 0.6,
    pops: [pop],
  };

  test("creates a region with its pops", () => {
    expect(createRegion(fields)).toEqual(fields);
  });

  test("copies the pops array", () => {
    const pops = [pop];
    const region = createRegion({ ...fields, pops });
    pops.push(
      createPop({ id: "p2", size: 200, expectedStandardOfLiving: 0.5 }),
    );
    expect(region.pops).toHaveLength(1);
  });

  test("allows an unpopulated region", () => {
    expect(createRegion({ ...fields, pops: [] }).pops).toEqual([]);
  });

  test.each([0.01, 1])("accepts productivity %s", (productivity) => {
    expect(createRegion({ ...fields, productivity }).productivity).toBe(
      productivity,
    );
  });

  test.each([0, -0.5, 1.01, Number.NaN])(
    "rejects productivity %s",
    (productivity) => {
      expect(() => createRegion({ ...fields, productivity })).toThrow(
        "Region r1 productivity must be in (0, 1]",
      );
    },
  );
});
