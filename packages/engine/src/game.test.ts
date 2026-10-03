import { afterEach, describe, expect, test, vi } from "vitest";
import {
  Cell,
  createCell,
  createFaction,
  createPlanet,
  createPop,
  createRegion,
  Faction,
  Game,
  Planet,
  Pop,
  Region,
  regionPops,
} from "./index";

const faction = createFaction({ id: "f1", name: "The Resistance" });
const planet = createPlanet({
  id: "pl",
  name: "Ferrix",
  regions: [
    createRegion({
      id: "r1",
      type: "rural",
      productionCap: 1e9,
      pops: [
        createPop({
          id: "p1",
          size: 1000,
          actualStandardOfLiving: 0.5,
          expectedStandardOfLiving: 1,
        }),
      ],
    }),
  ],
});
const [region] = planet.regions;
if (!region) throw new Error("region missing");
const data = { factions: [faction], planets: [planet] };

describe("Game", () => {
  test("exposes its factions and planets", () => {
    const game = new Game(data);
    expect(game.factions.map((f) => f.getState())).toEqual([faction]);
    expect(game.planets.map((p) => p.getState())).toEqual([planet]);
    expect(game.factions[0]).toBeInstanceOf(Faction);
    expect(game.planets[0]).toBeInstanceOf(Planet);
  });

  test("links each faction to its cells", () => {
    const withCell = createPlanet({
      id: "pl",
      name: "Ferrix",
      regions: [
        createRegion({
          id: "r1",
          type: "rural",
          productionCap: 1e9,
          cells: [createCell({ id: "res-1", faction: "f1", region: "r1" })],
        }),
      ],
    });
    const game = new Game({ factions: [faction], planets: [withCell] });
    const cell = game.planets[0]?.regions[0]?.cells[0];
    expect(cell).toBeInstanceOf(Cell);
    expect(game.factions[0]?.cells).toEqual([cell]);
    expect(cell?.faction).toBe(game.factions[0]);
    expect(game.getState().factions[0]?.cellIds).toEqual(["res-1"]);
  });

  test("a cell naming a faction that isn't in the game is an error", () => {
    const orphan = createPlanet({
      id: "pl",
      name: "Ferrix",
      regions: [
        createRegion({
          id: "r1",
          type: "rural",
          productionCap: 1e9,
          cells: [createCell({ id: "x-1", faction: "x", region: "r1" })],
        }),
      ],
    });
    expect(() => new Game({ factions: [], planets: [orphan] })).toThrow(
      "Cell x-1 names faction x, which isn't in the game",
    );
  });

  test("copies the factions and planets arrays", () => {
    const factions = [faction];
    const planets = [planet];
    const game = new Game({ factions, planets });
    factions.push(createFaction({ id: "f2", name: "The Empire" }));
    planets.push(planet);
    expect(game.factions).toHaveLength(1);
    expect(game.planets).toHaveLength(1);
  });

  test("gets and sets its state as plain data", () => {
    const game = new Game(data);
    const plain = JSON.parse(JSON.stringify(game.getState()));
    expect(plain).toEqual(game.getState());
    const other = new Game({ factions: [], planets: [] });
    other.setState(plain);
    expect(other.getState()).toEqual(game.getState());
  });

  test("getState builds its data from its factions' getState", () => {
    const factionGetState = vi.spyOn(Faction.prototype, "getState");
    expect(new Game(data).getState().factions).toEqual([faction]);
    // Once for the game's faction and once for the planet's planetary faction.
    expect(factionGetState).toHaveBeenCalledTimes(2);
    vi.restoreAllMocks();
  });

  test("getState builds its data from its planets' getState", () => {
    const planetGetState = vi.spyOn(Planet.prototype, "getState");
    new Game(data).getState();
    expect(planetGetState).toHaveBeenCalledTimes(1);
    vi.restoreAllMocks();
  });

  test("tick carries factions through and ticks every planet", () => {
    const game = new Game(data);
    game.tick();
    const expected = new Planet(planet);
    expected.tick();
    expect(game.factions.map((f) => f.getState())).toEqual([faction]);
    expect(game.planets[0]?.getState()).toEqual(expected.getState());
  });

  test("tick updates the game without mutating earlier states", () => {
    const game = new Game(data);
    const before = game.getState();
    const snapshot = JSON.parse(JSON.stringify(before));
    game.tick();
    expect(before).toEqual(snapshot);
    expect(game.getState()).not.toEqual(snapshot);
  });

  test("tick(n) equals n single ticks", () => {
    const all = new Game(data);
    all.tick(3);
    const oneAtATime = new Game(data);
    oneAtATime.tick();
    oneAtATime.tick();
    oneAtATime.tick();
    expect(all.getState()).toEqual(oneAtATime.getState());
  });
});

describe("tick(n) ticks each descendant once per tick", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("Game ticks each planet n times, one tick at a time", () => {
    const planetTick = vi.spyOn(Planet.prototype, "tick");
    new Game({ factions: [faction], planets: [planet, planet] }).tick(3);
    expect(planetTick).toHaveBeenCalledTimes(6);
    for (const call of planetTick.mock.calls) {
      expect(call[0] ?? 1).toBe(1);
    }
  });

  test("Planet ticks each region n times, one tick at a time", () => {
    const regionTick = vi.spyOn(Region.prototype, "tick");
    new Planet(createPlanet({ ...planet, regions: [region, region] })).tick(3);
    expect(regionTick).toHaveBeenCalledTimes(6);
    for (const call of regionTick.mock.calls) {
      expect(call[0] ?? 1).toBe(1);
    }
  });
});

describe("Planet", () => {
  test("createPlanet gives the planet a planetary faction with its regional cells", () => {
    expect(planet.planetaryFaction).toEqual({
      id: "pl-faction",
      name: "Ferrix",
      cellIds: ["r1-cell"],
    });
    expect(region.regionalCell.faction).toBe("pl-faction");
  });

  test("its planetary faction is linked to each region's regional cell", () => {
    const p = new Planet(planet);
    expect(p.planetaryFaction).toBeInstanceOf(Faction);
    expect(p.planetaryFaction.cells).toEqual([p.regions[0]?.regionalCell]);
    expect(p.regions[0]?.regionalCell.faction).toBe(p.planetaryFaction);
  });

  test("exposes its id, name, and regions", () => {
    const p = new Planet(planet);
    expect(p.id).toBe("pl");
    expect(p.name).toBe("Ferrix");
    expect(p.regions[0]).toBeInstanceOf(Region);
    expect(p.regions[0]?.getState()).toEqual(region);
  });

  test("getState builds its data from its regions' getState", () => {
    const regionGetState = vi.spyOn(Region.prototype, "getState");
    const p = new Planet(
      createPlanet({ ...planet, regions: [region, region] }),
    );
    expect(p.getState()).toEqual(
      createPlanet({ ...planet, regions: [region, region] }),
    );
    expect(regionGetState).toHaveBeenCalledTimes(2);
    vi.restoreAllMocks();
  });

  test("keeps the same region instances across ticks", () => {
    const p = new Planet(planet);
    const [before] = p.regions;
    p.tick();
    expect(p.regions[0]).toBe(before);
  });

  test("tick ticks every region", () => {
    const p = new Planet(planet);
    p.tick();
    const expected = new Region(region);
    expected.tick();
    expect(p.getState().regions[0]).toEqual(expected.getState());
  });

  test("tick(n) equals n single ticks", () => {
    const all = new Planet(planet);
    all.tick(3);
    const oneAtATime = new Planet(planet);
    oneAtATime.tick();
    oneAtATime.tick();
    oneAtATime.tick();
    expect(all.getState()).toEqual(oneAtATime.getState());
  });

  test("gets and sets its state", () => {
    const p = new Planet(planet);
    const urban = createRegion({ ...region, id: "r2", type: "urban" });
    const other = createPlanet({
      ...planet,
      name: "Aldhani",
      regions: [urban],
    });
    p.setState(other);
    expect(p.name).toBe("Aldhani");
    expect(p.regions.map((r) => r.type)).toEqual(["urban"]);
    expect(p.getState()).toEqual(other);
  });
});

describe("Region", () => {
  test("exposes its fields", () => {
    const r = new Region(region);
    expect(r.id).toBe("r1");
    expect(r.type).toBe("rural");
    expect(r.productionCap).toBe(1e9);
    expect(r.production).toBe(region.production);
    expect(r.pops[0]).toBeInstanceOf(Pop);
    expect(r.pops.map((pop) => pop.getState())).toEqual(regionPops(region));
  });

  test("getState builds its data from its pops' getState", () => {
    const popGetState = vi.spyOn(Pop.prototype, "getState");
    expect(new Region(region).getState()).toEqual(region);
    expect(popGetState).toHaveBeenCalledTimes(regionPops(region).length);
    vi.restoreAllMocks();
  });

  test("gets and sets its state", () => {
    const r = new Region(region);
    const other = createRegion({ ...region, type: "urban" });
    r.setState(other);
    expect(r.type).toBe("urban");
    expect(r.getState()).toEqual(other);
  });
});
