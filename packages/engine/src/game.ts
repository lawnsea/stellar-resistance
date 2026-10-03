import { defaultConfig, type EngineConfig } from "./config";
import { Faction, type FactionState } from "./faction";
import { Planet, type PlanetState } from "./planet";
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
    this._factions = state.factions.map((faction) => new Faction(faction));
    this._planets = state.planets.map(
      (planet) => new Planet(planet, this.config),
    );
    const byId = new Map(
      this._factions.map((faction) => [faction.id, faction]),
    );
    for (const planet of this._planets) {
      for (const region of planet.regions) {
        for (const cell of region.cells) {
          if (cell.factionId === planet.planetaryFaction.id) continue;
          const faction = byId.get(cell.factionId);
          if (!faction) {
            throw new Error(
              `Cell ${cell.id} names faction ${cell.factionId}, which isn't in the game`,
            );
          }
          faction.addCell(cell);
        }
        for (const item of region.infrastructure) {
          if (
            item.controllerId !== planet.planetaryFaction.id &&
            !byId.has(item.controllerId)
          ) {
            throw new Error(
              `Infrastructure ${item.id} is controlled by faction ${item.controllerId}, which isn't in the game`,
            );
          }
        }
      }
    }
  }

  tick(n = 1): void {
    for (let i = 0; i < n; i++) {
      for (const planet of this._planets) {
        planet.tick();
      }
    }
  }
}
