import { expect, test } from "vitest";
import { testPlanets } from "./index";

test("test planet, region, and pop ids are unique", () => {
  const ids = testPlanets.flatMap((planet) => [
    planet.id,
    ...planet.regions.flatMap((region) => [
      region.id,
      ...region.pops.map((pop) => pop.id),
    ]),
  ]);
  expect(new Set(ids).size).toBe(ids.length);
});
