import { expect, test } from "vitest";
import { testPlanets } from "./index";

test("test planet and region ids are unique", () => {
  const ids = testPlanets.flatMap((planet) => [
    planet.id,
    ...planet.regions.map((region) => region.id),
  ]);
  expect(new Set(ids).size).toBe(ids.length);
});
