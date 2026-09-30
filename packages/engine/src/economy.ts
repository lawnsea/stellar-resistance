import { defaultConfig, type EngineConfig } from "./config";
import { birthRate, deathRate } from "./demography";
import { splitAndRemovePops } from "./lifecycle";
import { exactSize, withExactSize } from "./pop";
import type { Region } from "./region";
import type { World } from "./world";

export interface RegionEconomy {
  readonly production: number;
  readonly consumption: number;
  readonly surplus: number;
}

export type TickReport = Readonly<Record<string, RegionEconomy>>;

export interface TickResult {
  readonly world: World;
  readonly report: TickReport;
}

export function computeRegionEconomy(
  region: Region,
  config: EngineConfig = defaultConfig,
): RegionEconomy {
  let production = 0;
  let consumption = 0;
  for (const pop of region.pops) {
    const size = exactSize(pop);
    production +=
      size * config.productionRate * Math.min(1, pop.actualStandardOfLiving);
    consumption += size;
  }
  production = Math.min(production, region.productionCap);
  return { production, consumption, surplus: production - consumption };
}

export function nextExpectedStandardOfLiving(
  expected: number,
  actual: number,
  config: EngineConfig = defaultConfig,
): number {
  return expected + (actual - expected) * config.expectationAdjustmentRate;
}

function tickRegion(
  region: Region,
  config: EngineConfig,
): { region: Region; economy: RegionEconomy } {
  const economy = computeRegionEconomy(region, config);
  const actual =
    economy.consumption > 0 ? economy.production / economy.consumption : 0;
  const pops = region.pops.map((pop) => {
    const size = exactSize(pop);
    const previous = pop.actualStandardOfLiving;
    const births = birthRate(previous, config) * size;
    const deaths = deathRate(previous, config) * size;
    return withExactSize(
      {
        ...pop,
        actualStandardOfLiving: actual,
        expectedStandardOfLiving: nextExpectedStandardOfLiving(
          pop.expectedStandardOfLiving,
          actual,
          config,
        ),
      },
      size + births - deaths,
    );
  });
  return { region: { ...region, pops }, economy };
}

export function tick(
  world: World,
  config: EngineConfig = defaultConfig,
): TickResult {
  const report: Record<string, RegionEconomy> = {};
  const nextPlanets = world.planets.map((planet) => ({
    ...planet,
    regions: planet.regions.map((region) => {
      const next = tickRegion(region, config);
      report[region.id] = next.economy;
      return next.region;
    }),
  }));
  return {
    world: { ...world, planets: splitAndRemovePops(nextPlanets, config) },
    report,
  };
}
