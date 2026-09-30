import { describe, expect, test } from "vitest";
import {
  createFaction,
  createPlanet,
  createRegion,
  createWorld,
  tick,
} from "./index";

const faction = createFaction({ id: "f1", name: "The Resistance" });
const planet = createPlanet({
  id: "pl",
  name: "Ferrix",
  regions: [
    createRegion({ id: "r1", type: "rural", productionCap: 100, pops: [] }),
  ],
});

describe("createWorld", () => {
  test("creates a world with its factions and planets", () => {
    expect(createWorld({ factions: [faction], planets: [planet] })).toEqual({
      factions: [faction],
      planets: [planet],
    });
  });

  test("copies the factions and planets arrays", () => {
    const factions = [faction];
    const planets = [planet];
    const world = createWorld({ factions, planets });
    factions.push(createFaction({ id: "f2", name: "The Empire" }));
    planets.push(planet);
    expect(world.factions).toHaveLength(1);
    expect(world.planets).toHaveLength(1);
  });
});

describe("tick", () => {
  test("carries the world's factions through", () => {
    const world = createWorld({ factions: [faction], planets: [planet] });
    expect(tick(world).world.factions).toEqual([faction]);
  });

  test("doesn't mutate the world", () => {
    const world = createWorld({ factions: [faction], planets: [planet] });
    const snapshot = JSON.parse(JSON.stringify(world));
    const next = tick(world).world;
    expect(world).toEqual(snapshot);
    expect(next).not.toBe(world);
  });
});
