import type { Faction } from "./faction";
import type { Planet } from "./planet";

export interface World {
  readonly factions: readonly Faction[];
  readonly planets: readonly Planet[];
}

export function createWorld(fields: World): World {
  return { factions: [...fields.factions], planets: [...fields.planets] };
}
