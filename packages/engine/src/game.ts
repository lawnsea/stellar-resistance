import { defaultConfig, type EngineConfig } from "./config";
import type { Faction } from "./faction";
import { Planet, type PlanetState } from "./planet";
import type { Stateful, Tickable } from "./traits";

export interface GameState {
  readonly factions: readonly Faction[];
  readonly planets: readonly PlanetState[];
}

export class Game implements Stateful<GameState>, Tickable {
  private _state: Omit<GameState, "planets">;
  private _planets: readonly Planet[] = [];
  private readonly config: EngineConfig;

  constructor(state: GameState, config: EngineConfig = defaultConfig) {
    this.config = config;
    this._state = { factions: [] };
    this.setState(state);
  }

  get factions(): readonly Faction[] {
    return this._state.factions;
  }

  get planets(): readonly Planet[] {
    return this._planets;
  }

  getState(): GameState {
    return {
      ...this._state,
      planets: this._planets.map((planet) => planet.getState()),
    };
  }

  setState(state: GameState): void {
    this._state = { factions: [...state.factions] };
    this._planets = state.planets.map(
      (planet) => new Planet(planet, this.config),
    );
  }

  tick(n = 1): void {
    for (let i = 0; i < n; i++) {
      for (const planet of this._planets) {
        planet.tick();
      }
    }
  }
}
