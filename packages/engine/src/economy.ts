import { defaultConfig, type EngineConfig } from "./config";
import type { Planet } from "./planet";
import type { Region } from "./region";

export interface RegionEconomy {
  readonly production: number;
  readonly consumption: number;
  readonly surplus: number;
}

// Region economies for one tick, keyed by region id.
export type TickReport = Readonly<Record<string, RegionEconomy>>;

export function computeRegionEconomy(
  region: Region,
  config: EngineConfig = defaultConfig,
): RegionEconomy {
  let totalSize = 0;
  let demand = 0;
  for (const pop of region.pops) {
    totalSize += pop.size;
    demand += pop.size * pop.expectedStandardOfLiving;
  }
  const production = totalSize * region.productivity * config.productionRate;
  const consumption = demand * config.consumptionRate;
  return { production, consumption, surplus: production - consumption };
}

export function tick(
  planets: readonly Planet[],
  config: EngineConfig = defaultConfig,
): TickReport {
  const report: Record<string, RegionEconomy> = {};
  for (const planet of planets) {
    for (const region of planet.regions) {
      report[region.id] = computeRegionEconomy(region, config);
    }
  }
  return report;
}
