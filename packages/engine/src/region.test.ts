import { describe, expect, test } from "vitest";
import { createPop, createRegion } from "./index";

describe("createRegion", () => {
  const pop = createPop({ id: "p1", size: 100 });

  test("creates a region with its pops", () => {
    expect(createRegion({ id: "r1", type: "rural", pops: [pop] })).toEqual({
      id: "r1",
      type: "rural",
      pops: [pop],
    });
  });

  test("copies the pops array", () => {
    const pops = [pop];
    const region = createRegion({ id: "r1", type: "rural", pops });
    pops.push(createPop({ id: "p2", size: 200 }));
    expect(region.pops).toHaveLength(1);
  });

  test("allows an unpopulated region", () => {
    expect(createRegion({ id: "r1", type: "rural", pops: [] }).pops).toEqual(
      [],
    );
  });
});
