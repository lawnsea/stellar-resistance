import type { Faction } from "./faction";
import type { Planet } from "./planet";

export interface State {
  readonly factions: readonly Faction[];
  readonly planets: readonly Planet[];
}

export function createState(fields: State): State {
  return { factions: [...fields.factions], planets: [...fields.planets] };
}
