import { describe, expect, test } from "vitest";
import { createPlanet, createRegion } from "./index";

describe("createRegion", () => {
  test("creates a region", () => {
    expect(createRegion({ id: "r1", name: "Lowlands" })).toEqual({
      id: "r1",
      name: "Lowlands",
    });
  });
});

describe("createPlanet", () => {
  const lowlands = createRegion({ id: "r1", name: "Lowlands" });

  test("creates a planet with its regions", () => {
    expect(
      createPlanet({ id: "p1", name: "Ferrix", regions: [lowlands] }),
    ).toEqual({ id: "p1", name: "Ferrix", regions: [lowlands] });
  });

  test("copies the regions array", () => {
    const regions = [lowlands];
    const planet = createPlanet({ id: "p1", name: "Ferrix", regions });
    regions.push(createRegion({ id: "r2", name: "Highlands" }));
    expect(planet.regions).toHaveLength(1);
  });

  test("throws without regions", () => {
    expect(() =>
      createPlanet({ id: "p1", name: "Ferrix", regions: [] }),
    ).toThrow("Planet p1 must have at least one region");
  });
});
