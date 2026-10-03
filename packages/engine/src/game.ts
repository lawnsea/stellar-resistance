import { defaultConfig, type EngineConfig } from "./config";
import { Faction, type FactionState } from "./faction";
import { Planet, type PlanetState } from "./planet";
import { withPlanetaryFactions } from "./planetary-factions";
import type { Stateful, Tickable } from "./traits";

export interface GameState {
  readonly factions: readonly FactionState[];
  readonly planets: readonly PlanetState[];
}

export class Game implements Stateful<GameState>, Tickable {
  private _factions: readonly Faction[] = [];
  private _planets: readonly Planet[] = [];
  private readonly config: EngineConfig;

  constructor(state: GameState, config: EngineConfig = defaultConfig) {
    this.config = config;
    this.setState(state);
  }

  get factions(): readonly Faction[] {
    return this._factions;
  }

  get planets(): readonly Planet[] {
    return this._planets;
  }

  getState(): GameState {
    return {
      factions: this._factions.map((faction) => faction.getState()),
      planets: this._planets.map((planet) => planet.getState()),
    };
  }

  setState(state: GameState): void {
    const filled = withPlanetaryFactions(state);
    this._factions = filled.factions.map((faction) => new Faction(faction));
    this._planets = filled.planets.map(
      (planet) => new Planet(planet, this.config),
    );
  }

  tick(n = 1): void {
    for (let i = 0; i < n; i++) {
      for (const planet of this._planets) {
        planet.tick();
      }
      const { factions } = withPlanetaryFactions(this.getState());
      this._factions = factions.map((faction) => new Faction(faction));
    }
  }
}
