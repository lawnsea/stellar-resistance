import { describe, expect, test } from "vitest";
import { createPlanet, createRegion } from "./index";

describe("createPlanet", () => {
  const rural = createRegion({
    id: "r1",
    type: "rural",
    productionCap: 1000,
    pops: [],
  });

  test("creates a planet with its regions and a planetary faction for their regional cells", () => {
    expect(
      createPlanet({ id: "p1", name: "Ferrix", regions: [rural] }),
    ).toEqual({
      id: "p1",
      name: "Ferrix",
      planetaryFaction: {
        id: "p1-faction",
        name: "Ferrix",
        cellIds: ["r1-cell"],
      },
      regions: [
        {
          ...rural,
          regionalCell: { ...rural.regionalCell, faction: "p1-faction" },
        },
      ],
    });
  });

  test("copies the regions array", () => {
    const regions = [rural];
    const planet = createPlanet({ id: "p1", name: "Ferrix", regions });
    regions.push(
      createRegion({ id: "r2", type: "urban", productionCap: 1000, pops: [] }),
    );
    expect(planet.regions).toHaveLength(1);
  });

  test("throws without regions", () => {
    expect(() =>
      createPlanet({ id: "p1", name: "Ferrix", regions: [] }),
    ).toThrow("Planet p1 must have at least one region");
  });
});
