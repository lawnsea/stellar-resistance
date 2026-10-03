import { describe, expect, test } from "vitest";
import {
  createCell,
  createFaction,
  createPlanet,
  createPop,
  createRegion,
  defaultConfig,
  type FactionState,
  Game,
  type PopState,
} from "./index";
import { withExactSize } from "./pop";

function pop(id: string, size = 100): PopState {
  return createPop({ id, size, expectedStandardOfLiving: 1 });
}

function planet(factionId?: string, pops: PopState[] = [pop("p1"), pop("p2")]) {
  return createPlanet({
    id: "pl",
    name: "Ferrix",
    factionId,
    regions: [
      createRegion({ id: "r1", type: "urban", productionCap: 1e9, pops }),
      createRegion({ id: "r2", type: "rural", productionCap: 1e9, pops: [] }),
    ],
  });
}

function factionStates(game: Game): readonly FactionState[] {
  return game.getState().factions;
}

describe("planetary factions", () => {
  test("a planet without one gets a planetary faction named after it", () => {
    const game = new Game({ factions: [], planets: [planet()] });
    const [faction] = factionStates(game);
    expect(faction?.name).toBe("Ferrix");
    expect(game.planets[0]?.factionId).toBe(faction?.id);
  });

  test("a planet keeps the planetary faction it names", () => {
    const own = createFaction({ id: "gov", name: "Ferrix Council" });
    const game = new Game({ factions: [own], planets: [planet("gov")] });
    expect(factionStates(game).map((f) => f.id)).toEqual(["gov"]);
    expect(game.planets[0]?.factionId).toBe("gov");
  });

  test("a planet naming a missing faction is an error", () => {
    expect(() => new Game({ factions: [], planets: [planet("gov")] })).toThrow(
      "Planet pl planetary faction gov not found",
    );
  });

  test("the planetary faction gets a cell in each of the planet's regions", () => {
    const [faction] = factionStates(
      new Game({ factions: [], planets: [planet()] }),
    );
    expect(faction?.cells.map((cell) => cell.regionId)).toEqual(["r1", "r2"]);
  });

  test("an existing cell in a region is reused", () => {
    const own = createFaction({
      id: "gov",
      name: "Ferrix Council",
      cells: [createCell({ id: "council-r1", regionId: "r1" })],
    });
    const [faction] = factionStates(
      new Game({ factions: [own], planets: [planet("gov")] }),
    );
    expect(faction?.cells.map((cell) => cell.id)).toEqual([
      "council-r1",
      "r2-cell",
    ]);
  });

  test("pops join their region's planetary cell by default", () => {
    const [faction] = factionStates(
      new Game({ factions: [], planets: [planet()] }),
    );
    const r1 = faction?.cells.find((cell) => cell.regionId === "r1");
    expect(r1?.popIds).toEqual(["p1", "p2"]);
  });

  test("pops already in a cell stay in it", () => {
    const resistance = createFaction({
      id: "res",
      name: "The Resistance",
      cells: [createCell({ id: "res-1", regionId: "r1", popIds: ["p2"] })],
    });
    const [res, planetary] = factionStates(
      new Game({ factions: [resistance], planets: [planet()] }),
    );
    expect(res?.cells[0]?.popIds).toEqual(["p2"]);
    expect(
      planetary?.cells.find((cell) => cell.regionId === "r1")?.popIds,
    ).toEqual(["p1"]);
  });

  test("loading a game's own state changes nothing", () => {
    const game = new Game({ factions: [], planets: [planet()] });
    expect(new Game(game.getState()).getState()).toEqual(game.getState());
  });
});

describe("cell membership after a tick", () => {
  // No births or deaths, so sizes stay as set until a pop splits or dies out.
  const steady = { ...defaultConfig, baseBirthRate: 0, baseDeathRate: 0 };

  test("a split pop's halves replace it in its cell", () => {
    const big = withExactSize(pop("big"), 5000.7);
    const resistance = createFaction({
      id: "res",
      name: "The Resistance",
      cells: [createCell({ id: "res-1", regionId: "r1", popIds: ["big"] })],
    });
    const game = new Game(
      { factions: [resistance], planets: [planet(undefined, [big])] },
      steady,
    );
    game.tick();
    expect(factionStates(game)[0]?.cells[0]?.popIds).toEqual([
      "big.1",
      "big.2",
    ]);
  });

  test("a pop that dies out leaves its cell", () => {
    const dying = withExactSize(pop("dying"), 0.6);
    const game = new Game(
      { factions: [], planets: [planet(undefined, [dying, pop("p1")])] },
      steady,
    );
    expect(factionStates(game)[0]?.cells[0]?.popIds).toEqual(["dying", "p1"]);
    game.tick();
    expect(factionStates(game)[0]?.cells[0]?.popIds).toEqual(["p1"]);
  });
});
