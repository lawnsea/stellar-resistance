import { defaultConfig, type EngineConfig } from "./config";
import { createFaction, Faction, type FactionState } from "./faction";
import { Region, type RegionState } from "./region";
import type { Stateful, Tickable } from "./traits";

export interface PlanetState {
  readonly id: string;
  readonly name: string;
  readonly planetaryFaction: FactionState;
  readonly regions: readonly RegionState[];
}

export type PlanetFields = Omit<PlanetState, "planetaryFaction">;

export function createPlanet(fields: PlanetFields): PlanetState {
  if (fields.regions.length === 0) {
    throw new Error(`Planet ${fields.id} must have at least one region`);
  }
  const planetaryFaction = createFaction({
    id: `${fields.id}-faction`,
    name: fields.name,
    cellIds: fields.regions.map((region) => region.regionalCell.id),
  });
  return {
    id: fields.id,
    name: fields.name,
    planetaryFaction,
    regions: fields.regions.map((region) => ({
      ...region,
      regionalCell: { ...region.regionalCell, faction: planetaryFaction.id },
    })),
  };
}

export class Planet implements Stateful<PlanetState>, Tickable {
  private _state: Omit<PlanetState, "planetaryFaction" | "regions">;
  private _planetaryFaction!: Faction;
  private _regions: readonly Region[] = [];
  private readonly config: EngineConfig;

  constructor(state: PlanetState, config: EngineConfig = defaultConfig) {
    this.config = config;
    this._state = { id: state.id, name: state.name };
    this.setState(state);
  }

  get id(): string {
    return this._state.id;
  }

  get name(): string {
    return this._state.name;
  }

  get planetaryFaction(): Faction {
    return this._planetaryFaction;
  }

  get regions(): readonly Region[] {
    return this._regions;
  }

  getState(): PlanetState {
    return {
      ...this._state,
      planetaryFaction: this._planetaryFaction.getState(),
      regions: this._regions.map((region) => region.getState()),
    };
  }

  setState(state: PlanetState): void {
    const { planetaryFaction, regions, ...own } = state;
    this._state = own;
    this._regions = regions.map((region) => new Region(region, this.config));
    this._planetaryFaction = new Faction(planetaryFaction);
    for (const region of this._regions) {
      for (const cell of [region.regionalCell, ...region.cells]) {
        if (
          cell === region.regionalCell ||
          cell.factionId === planetaryFaction.id
        ) {
          this._planetaryFaction.addCell(cell);
        }
      }
    }
  }

  tick(n = 1): void {
    for (let i = 0; i < n; i++) {
      for (const region of this._regions) {
        region.tick();
      }
    }
  }
}
