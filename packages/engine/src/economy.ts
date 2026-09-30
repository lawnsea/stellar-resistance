import { defaultConfig, type EngineConfig } from "./config";
import type { Planet } from "./planet";
import type { Pop } from "./pop";
import type { Region } from "./region";

// Amounts are in units of production. One unit meets one person's
// consumption requirement for one tick.
export interface RegionEconomy {
  readonly production: number;
  readonly consumption: number;
  readonly surplus: number;
}

// Region economies for one tick, keyed by region id.
export type TickReport = Readonly<Record<string, RegionEconomy>>;

export interface TickResult {
  readonly planets: readonly Planet[];
  readonly report: TickReport;
}

export function computeRegionEconomy(
  region: Region,
  config: EngineConfig = defaultConfig,
): RegionEconomy {
  let production = 0;
  let consumption = 0;
  for (const pop of region.pops) {
    production +=
      pop.size *
      config.productionRate *
      Math.min(1, pop.actualStandardOfLiving);
    consumption += pop.size;
  }
  return { production, consumption, surplus: production - consumption };
}

export function nextExpectedStandardOfLiving(
  expected: number,
  actual: number,
  config: EngineConfig = defaultConfig,
): number {
  return Math.max(
    1,
    expected + (actual - expected) * config.expectationAdjustmentRate,
  );
}

function tickRegion(
  region: Region,
  config: EngineConfig,
): { region: Region; economy: RegionEconomy } {
  const economy = computeRegionEconomy(region, config);
  // Production is split among pops by size, so every pop in the region gets
  // the same share per person.
  const actual =
    economy.consumption > 0 ? economy.production / economy.consumption : 0;
  const pops = region.pops.map(
    (pop): Pop => ({
      ...pop,
      actualStandardOfLiving: actual,
      expectedStandardOfLiving: nextExpectedStandardOfLiving(
        pop.expectedStandardOfLiving,
        actual,
        config,
      ),
    }),
  );
  return { region: { ...region, pops }, economy };
}

export function tick(
  planets: readonly Planet[],
  config: EngineConfig = defaultConfig,
): TickResult {
  const report: Record<string, RegionEconomy> = {};
  const nextPlanets = planets.map((planet) => ({
    ...planet,
    regions: planet.regions.map((region) => {
      const next = tickRegion(region, config);
      report[region.id] = next.economy;
      return next.region;
    }),
  }));
  return { planets: nextPlanets, report };
}
