import type { EngineConfig } from "./config";
import { exactSize, type Pop, withExactSize } from "./pop";

// Applies after all of a region's changes for a tick. To move into a separate
// after-tick handler (#28).
export function splitAndRemovePops(
  pops: readonly Pop[],
  config: EngineConfig,
): Pop[] {
  return pops.flatMap((pop) => splitOrRemove(pop, config));
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
