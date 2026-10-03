import { Cell, type CellState, createCell } from "./cell";
import { defaultConfig, type EngineConfig } from "./config";
import { exactSize, type Pop, type PopState } from "./pop";
import type { Stateful, Tickable } from "./traits";

export type RegionType = "rural" | "urban";

export interface RegionState {
  readonly id: string;
  readonly type: RegionType;
  readonly productionCap: number;
  readonly production: number;
  readonly regionalCell: CellState;
  readonly cells: readonly CellState[];
}

export interface RegionFields {
  readonly id: string;
  readonly type: RegionType;
  readonly productionCap: number;
  readonly production?: number;
  readonly pops?: readonly PopState[];
  readonly cells?: readonly CellState[];
}

export function createRegion(
  fields: RegionFields,
  config: EngineConfig = defaultConfig,
): RegionState {
  const { id, type, productionCap } = fields;
  if (!(productionCap > 0) || !Number.isFinite(productionCap)) {
    throw new Error(
      `Region ${id} production cap must be a positive number, got ${productionCap}`,
    );
  }
  const regionalCell = createCell({
    id: `${id}-cell`,
    faction: "",
    region: id,
    pops: fields.pops ?? [],
  });
  const cells = [...(fields.cells ?? [])];
  const pops = regionPops({ regionalCell, cells });
  const production =
    fields.production ?? computeProduction(pops, productionCap, config);
  if (!(production >= 0) || !Number.isFinite(production)) {
    throw new Error(
      `Region ${id} production must be at least 0, got ${production}`,
    );
  }
  return { id, type, productionCap, production, regionalCell, cells };
}

function computeProduction(
  pops: readonly PopState[],
  productionCap: number,
  config: EngineConfig,
): number {
  let production = 0;
  for (const pop of pops) {
    production +=
      exactSize(pop) *
      config.productionRate *
      Math.min(1, pop.actualStandardOfLiving);
  }
  return Math.min(production, productionCap);
}

export interface RegionEconomy {
  readonly production: number;
  readonly consumption: number;
  readonly surplus: number;
}

export function regionPops(
  region: Pick<RegionState, "regionalCell" | "cells">,
): PopState[] {
  return [region.regionalCell, ...region.cells].flatMap((cell) => cell.pops);
}

export function computeRegionEconomy(region: RegionState): RegionEconomy {
  let consumption = 0;
  for (const pop of regionPops(region)) {
    consumption += exactSize(pop);
  }
  const { production } = region;
  return { production, consumption, surplus: production - consumption };
}

export class Region implements Stateful<RegionState>, Tickable {
  private _state: Omit<RegionState, "regionalCell" | "cells">;
  private _regionalCell!: Cell;
  private _cells: readonly Cell[] = [];
  private readonly config: EngineConfig;

  constructor(state: RegionState, config: EngineConfig = defaultConfig) {
    this.config = config;
    this._state = state;
    this.setState(state);
  }

  get id(): string {
    return this._state.id;
  }

  get type(): RegionType {
    return this._state.type;
  }

  get productionCap(): number {
    return this._state.productionCap;
  }

  get production(): number {
    return this._state.production;
  }

  get regionalCell(): Cell {
    return this._regionalCell;
  }

  get cells(): readonly Cell[] {
    return this._cells;
  }

  get pops(): readonly Pop[] {
    return [this._regionalCell, ...this._cells].flatMap((cell) => cell.pops);
  }

  getState(): RegionState {
    return {
      ...this._state,
      regionalCell: this._regionalCell.getState(),
      cells: this._cells.map((cell) => cell.getState()),
    };
  }

  setState(state: RegionState): void {
    const { regionalCell, cells, ...own } = state;
    for (const cell of [regionalCell, ...cells]) {
      if (cell.region !== own.id) {
        throw new Error(
          `Cell ${cell.id} is in region ${own.id} but names region ${cell.region}`,
        );
      }
    }
    this._state = own;
    this._regionalCell = new Cell(regionalCell, this.config, this);
    this._cells = cells.map((cell) => new Cell(cell, this.config, this));
  }

  tick(n = 1): void {
    for (let i = 0; i < n; i++) {
      this.distribute();
      this.tickPops();
      this.splitAndRemove();
      this.produce();
    }
  }

  private distribute(): void {
    const pops = this.pops;
    const total = pops.reduce((sum, pop) => sum + exactSize(pop.getState()), 0);
    for (const pop of pops) {
      const share =
        total > 0
          ? (this._state.production * exactSize(pop.getState())) / total
          : 0;
      pop.receive(share);
    }
  }

  private tickPops(): void {
    for (const pop of this.pops) {
      pop.tick();
    }
  }

  private splitAndRemove(): void {
    for (const cell of [this._regionalCell, ...this._cells]) {
      cell.splitAndRemovePops();
    }
  }

  private produce(): void {
    this._state = {
      ...this._state,
      production: computeProduction(
        this.pops.map((pop) => pop.getState()),
        this._state.productionCap,
        this.config,
      ),
    };
  }
}
