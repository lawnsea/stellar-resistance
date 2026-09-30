export { defaultConfig, type EngineConfig } from "./config";
export { birthRate, deathRate } from "./demography";
export {
  computeRegionEconomy,
  nextExpectedStandardOfLiving,
  type RegionEconomy,
} from "./economy";
export { createFaction, type Faction } from "./faction";
export { GameState, type GameStateData } from "./game-state";
export { createPlanet, Planet, type PlanetState } from "./planet";
export { createPop, type Pop, type PopFields } from "./pop";
export {
  createRegion,
  Region,
  type RegionState,
  type RegionType,
} from "./region";
export { testGameState, testPlanets } from "./test-planets";
export type { Stateful, Tickable } from "./traits";
