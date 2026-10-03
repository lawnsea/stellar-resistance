import { defaultConfig, type EngineConfig } from "./config";
import type { Faction } from "./faction";
import { exactSize, Pop, type PopState, withExactSize } from "./pop";
import type { Region } from "./region";
import type { Stateful } from "./traits";

export interface CellState {
  readonly id: string;
  readonly faction: string;
  readonly region: string;
  readonly pops: readonly PopState[];
}

export interface CellFields extends Omit<CellState, "pops"> {
  readonly pops?: readonly PopState[];
}

export function createCell(fields: CellFields): CellState {
  return {
    id: fields.id,
    faction: fields.faction,
    region: fields.region,
    pops: [...(fields.pops ?? [])],
  };
}

export class Cell implements Stateful<CellState> {
  private _state: Omit<CellState, "pops">;
  private _pops: readonly Pop[] = [];
  private _faction: Faction | undefined;
  private readonly _region: Region | undefined;
  private readonly config: EngineConfig;

  constructor(
    state: CellState,
    config: EngineConfig = defaultConfig,
    region?: Region,
  ) {
    this.config = config;
    this._region = region;
    this._state = state;
    this.setState(state);
  }

  get id(): string {
    return this._state.id;
  }

  get factionId(): string {
    return this._state.faction;
  }

  get regionId(): string {
    return this._state.region;
  }

  get faction(): Faction | undefined {
    return this._faction;
  }

  get region(): Region | undefined {
    return this._region;
  }

  get pops(): readonly Pop[] {
    return this._pops;
  }

  joinFaction(faction: Faction): void {
    this._faction = faction;
  }

  getState(): CellState {
    return { ...this._state, pops: this._pops.map((pop) => pop.getState()) };
  }

  setState(state: CellState): void {
    const { pops, ...own } = state;
    this._state = own;
    this._pops = pops.map((pop) => new Pop(pop, this.config, this));
  }

  splitAndRemovePops(): void {
    this._pops = this._pops.flatMap((pop) => {
      const state = pop.getState();
      const size = exactSize(state);
      if (size < 1) {
        return [];
      }
      if (size > this.config.maxPopSize) {
        const half = size / 2;
        return [1, 2].map(
          (part) =>
            new Pop(
              withExactSize({ ...state, id: `${state.id}.${part}` }, half),
              this.config,
              this,
            ),
        );
      }
      return [pop];
    });
  }
}
