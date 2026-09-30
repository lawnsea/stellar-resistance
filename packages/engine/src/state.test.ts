import { describe, expect, test } from "vitest";
import {
  createFaction,
  createPlanet,
  createRegion,
  createState,
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

describe("createState", () => {
  test("creates a state with its factions and planets", () => {
    expect(createState({ factions: [faction], planets: [planet] })).toEqual({
      factions: [faction],
      planets: [planet],
    });
  });

  test("copies the factions and planets arrays", () => {
    const factions = [faction];
    const planets = [planet];
    const state = createState({ factions, planets });
    factions.push(createFaction({ id: "f2", name: "The Empire" }));
    planets.push(planet);
    expect(state.factions).toHaveLength(1);
    expect(state.planets).toHaveLength(1);
  });
});

describe("tick", () => {
  test("carries the state's factions through", () => {
    const state = createState({ factions: [faction], planets: [planet] });
    expect(tick(state).state.factions).toEqual([faction]);
  });

  test("doesn't mutate the state", () => {
    const state = createState({ factions: [faction], planets: [planet] });
    const snapshot = JSON.parse(JSON.stringify(state));
    const next = tick(state).state;
    expect(state).toEqual(snapshot);
    expect(next).not.toBe(state);
  });
});
