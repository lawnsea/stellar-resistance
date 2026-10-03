import { expect, test } from "vitest";
import { regionPops, testPlanets } from "./index";

test("test planet, region, cell, and pop ids are unique", () => {
  const ids = testPlanets.flatMap((planet) => [
    planet.id,
    planet.planetaryFaction.id,
    ...planet.regions.flatMap((region) => [
      region.id,
      region.regionalCell.id,
      ...regionPops(region).map((pop) => pop.id),
    ]),
  ]);
  expect(new Set(ids).size).toBe(ids.length);
});
