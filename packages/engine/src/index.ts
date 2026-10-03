export { defaultConfig, type EngineConfig } from "./config";
export { birthRate, deathRate } from "./demography";
export { createFaction, type Faction } from "./faction";
export { Game, type GameState } from "./game";
export { createPlanet, Planet, type PlanetState } from "./planet";
export {
  createPop,
  nextExpectedStandardOfLiving,
  type Pop,
  type PopFields,
} from "./pop";
export {
  computeRegionEconomy,
  createRegion,
  Region,
  type RegionEconomy,
  type RegionState,
  type RegionType,
} from "./region";
export { createTestGame, testPlanets } from "./test-planets";
export type { Stateful, Tickable } from "./traits";
