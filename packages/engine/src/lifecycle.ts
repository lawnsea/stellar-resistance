import type { EngineConfig } from "./config";
import type { Planet } from "./planet";
import { exactSize, type Pop, withExactSize } from "./pop";

// Applies to the result of a tick, after all of the tick's changes. To move
// into a separate after-tick handler (#28).
export function splitAndRemovePops(
  planets: readonly Planet[],
  config: EngineConfig,
): Planet[] {
  return planets.map((planet) => ({
    ...planet,
    regions: planet.regions.map((region) => ({
      ...region,
      pops: region.pops.flatMap((pop) => splitOrRemove(pop, config)),
    })),
  }));
}

function splitOrRemove(pop: Pop, config: EngineConfig): Pop[] {
  const size = exactSize(pop);
  if (size < 1) {
    return [];
  }
  if (size > config.maxPopSize) {
    const half = size / 2;
    return [
      withExactSize({ ...pop, id: `${pop.id}.1` }, half),
      withExactSize({ ...pop, id: `${pop.id}.2` }, half),
    ];
  }
  return [pop];
}
