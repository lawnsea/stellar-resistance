import { defaultConfig, type EngineConfig } from "./config";
import type { Faction } from "./faction";
import { Planet, type PlanetState } from "./planet";
import type { Stateful, Tickable } from "./traits";

export interface GameState {
  readonly factions: readonly Faction[];
  readonly planets: readonly PlanetState[];
}

export class Game implements Stateful<GameState>, Tickable<Game> {
  private _state: GameState;
  private readonly config: EngineConfig;

  constructor(state: GameState, config: EngineConfig = defaultConfig) {
    this._state = {
      factions: [...state.factions],
      planets: [...state.planets],
    };
    this.config = config;
  }

  get factions(): readonly Faction[] {
    return this._state.factions;
  }

  get planets(): readonly Planet[] {
    return this._state.planets.map((planet) => new Planet(planet, this.config));
  }

  getState(): GameState {
    return this._state;
  }

  setState(state: GameState): void {
    this._state = state;
  }

  tick(n = 1): Game {
    let state = this._state;
    for (let i = 0; i < n; i++) {
      state = {
        factions: state.factions,
        planets: state.planets.map((planet) =>
          new Planet(planet, this.config).tick().getState(),
        ),
      };
    }
    return new Game(state, this.config);
  }
}
