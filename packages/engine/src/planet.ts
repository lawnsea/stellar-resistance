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

export class Planet implements Stateful<PlanetState>, Tickable<Planet> {
  private _state: PlanetState;
  private readonly config: EngineConfig;

  constructor(state: PlanetState, config: EngineConfig = defaultConfig) {
    this._state = state;
    this.config = config;
  }

  get id(): string {
    return this._state.id;
  }

  get name(): string {
    return this._state.name;
  }

  get regions(): readonly Region[] {
    return this._state.regions.map((region) => new Region(region, this.config));
  }

  getState(): PlanetState {
    return this._state;
  }

  setState(state: PlanetState): void {
    this._state = state;
  }

  tick(n = 1): Planet {
    return new Planet(
      {
        ...this._state,
        regions: this.regions.map((region) => region.tick(n).getState()),
      },
      this.config,
    );
  }
}
