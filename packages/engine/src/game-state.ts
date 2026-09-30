import { defaultConfig, type EngineConfig } from "./config";
import type { Faction } from "./faction";
import { Planet, type PlanetState } from "./planet";
import type { Stateful, Tickable } from "./traits";

export interface GameStateData {
  readonly factions: readonly Faction[];
  readonly planets: readonly PlanetState[];
}

export class GameState implements Stateful<GameStateData>, Tickable<GameState> {
  private _state: GameStateData;
  private readonly config: EngineConfig;

  constructor(state: GameStateData, config: EngineConfig = defaultConfig) {
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

  getState(): GameStateData {
    return this._state;
  }

  setState(state: GameStateData): void {
    this._state = state;
  }

  tick(n = 1): GameState {
    return new GameState(
      {
        factions: this._state.factions,
        planets: this.planets.map((planet) => planet.tick(n).getState()),
      },
      this.config,
    );
  }
}
