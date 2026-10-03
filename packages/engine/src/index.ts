export { Cell, type CellFields, type CellState, createCell } from "./cell";
export { defaultConfig, type EngineConfig } from "./config";
export {
  createFaction,
  Faction,
  type FactionFields,
  type FactionState,
} from "./faction";
export { Game, type GameState } from "./game";
export {
  createInfrastructure,
  Infrastructure,
  type InfrastructureFields,
  type InfrastructureState,
  type InfrastructureType,
} from "./infrastructure";
export {
  createPlanet,
  Planet,
  type PlanetFields,
  type PlanetState,
} from "./planet";
export {
  birthRate,
  createPop,
  deathRate,
  nextExpectedStandardOfLiving,
  Pop,
  type PopFields,
  type PopState,
} from "./pop";
export {
  computeRegionEconomy,
  createRegion,
  Region,
  type RegionEconomy,
  type RegionFields,
  type RegionState,
  type RegionType,
  regionPops,
} from "./region";
export { createTestGame, testPlanets } from "./test-planets";
export type { Stateful, Tickable } from "./traits";
