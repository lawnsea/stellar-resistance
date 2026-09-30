export { defaultConfig, type EngineConfig } from "./config";
export {
  computeRegionEconomy,
  nextExpectedStandardOfLiving,
  type RegionEconomy,
  type TickReport,
  type TickResult,
  tick,
} from "./economy";
export { createPlanet, type Planet } from "./planet";
export { createPop, type Pop, type PopFields } from "./pop";
export { createRegion, type Region, type RegionType } from "./region";
export { testPlanets } from "./test-planets";
