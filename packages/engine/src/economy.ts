import { defaultConfig, type EngineConfig } from "./config";
import { birthRate, deathRate } from "./demography";
import { splitAndRemovePops } from "./lifecycle";
import { exactSize, withExactSize } from "./pop";
import type { RegionState } from "./region";

export interface RegionEconomy {
  readonly production: number;
  readonly consumption: number;
  readonly surplus: number;
}

export function computeRegionEconomy(
  region: RegionState,
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

export function nextRegionState(
  region: RegionState,
  config: EngineConfig,
): RegionState {
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
  return { ...region, pops: splitAndRemovePops(pops, config) };
}
