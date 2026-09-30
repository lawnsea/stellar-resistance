import { defaultConfig, type EngineConfig } from "./config";
import { Region, type RegionState } from "./region";
import type { Stateful, Tickable } from "./traits";

export interface PlanetState {
  readonly id: string;
  readonly name: string;
  readonly regions: readonly RegionState[];
}

export function createPlanet(fields: PlanetState): PlanetState {
  if (fields.regions.length === 0) {
    throw new Error(`Planet ${fields.id} must have at least one region`);
  }
  return { id: fields.id, name: fields.name, regions: [...fields.regions] };
}

export class Planet implements Stateful<PlanetState>, Tickable {
  private _state: Omit<PlanetState, "regions">;
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

  get regions(): readonly Region[] {
    return this._regions;
  }

  getState(): PlanetState {
    return {
      ...this._state,
      regions: this._regions.map((region) => region.getState()),
    };
  }

  setState(state: PlanetState): void {
    const { regions, ...own } = state;
    this._state = own;
    this._regions = regions.map((region) => new Region(region, this.config));
  }

  tick(n = 1): void {
    for (let i = 0; i < n; i++) {
      for (const region of this._regions) {
        region.tick();
      }
    }
  }
}
