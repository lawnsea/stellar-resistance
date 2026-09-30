import { afterEach, describe, expect, test, vi } from "vitest";
import {
  createFaction,
  createPlanet,
  createPop,
  createRegion,
  Game,
  Planet,
  Region,
} from "./index";

const faction = createFaction({ id: "f1", name: "The Resistance" });
const region = createRegion({
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
});
const planet = createPlanet({ id: "pl", name: "Ferrix", regions: [region] });
const data = { factions: [faction], planets: [planet] };

describe("Game", () => {
  test("exposes its factions and planets", () => {
    const game = new Game(data);
    expect(game.factions).toEqual([faction]);
    expect(game.planets.map((p) => p.getState())).toEqual([planet]);
    expect(game.planets[0]).toBeInstanceOf(Planet);
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

  test("tick carries factions through and ticks every planet", () => {
    const next = new Game(data).tick();
    expect(next.factions).toEqual([faction]);
    expect(next.planets[0]?.getState()).toEqual(
      new Planet(planet).tick().getState(),
    );
  });

  test("tick returns a new game without changing the original", () => {
    const game = new Game(data);
    const snapshot = JSON.parse(JSON.stringify(game.getState()));
    const next = game.tick();
    expect(game.getState()).toEqual(snapshot);
    expect(next).not.toBe(game);
  });

  test("tick(n) equals n single ticks", () => {
    const game = new Game(data);
    expect(game.tick(3).getState()).toEqual(
      game.tick().tick().tick().getState(),
    );
  });
});

describe("tick(n) ticks each descendant once per tick", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("Game ticks each planet n times, one tick at a time", () => {
    const planetTick = vi.spyOn(Planet.prototype, "tick");
    new Game({ factions: [], planets: [planet, planet] }).tick(3);
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
  test("exposes its id, name, and regions", () => {
    const p = new Planet(planet);
    expect(p.id).toBe("pl");
    expect(p.name).toBe("Ferrix");
    expect(p.regions[0]).toBeInstanceOf(Region);
    expect(p.regions[0]?.getState()).toEqual(region);
  });

  test("tick ticks every region", () => {
    expect(new Planet(planet).tick().getState().regions[0]).toEqual(
      new Region(region).tick().getState(),
    );
  });

  test("tick(n) equals n single ticks", () => {
    const p = new Planet(planet);
    expect(p.tick(3).getState()).toEqual(p.tick().tick().tick().getState());
  });

  test("gets and sets its state", () => {
    const p = new Planet(planet);
    const other = createPlanet({ ...planet, name: "Aldhani" });
    p.setState(other);
    expect(p.name).toBe("Aldhani");
    expect(p.getState()).toBe(other);
  });
});

describe("Region", () => {
  test("exposes its fields", () => {
    const r = new Region(region);
    expect(r.id).toBe("r1");
    expect(r.type).toBe("rural");
    expect(r.productionCap).toBe(1e9);
    expect(r.pops).toEqual(region.pops);
  });

  test("gets and sets its state", () => {
    const r = new Region(region);
    const other = createRegion({ ...region, type: "urban" });
    r.setState(other);
    expect(r.type).toBe("urban");
    expect(r.getState()).toBe(other);
  });
});
