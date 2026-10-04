import { Cell, type CellState, createCell } from "./cell";
import { defaultConfig, type EngineConfig } from "./config";
import { Infrastructure, type InfrastructureState } from "./infrastructure";
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
  readonly infrastructure: readonly InfrastructureState[];
}

export interface RegionFields {
  readonly id: string;
  readonly type: RegionType;
  readonly productionCap: number;
  readonly production?: number;
  readonly pops?: readonly PopState[];
  readonly cells?: readonly CellState[];
  readonly infrastructure?: readonly InfrastructureState[];
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
  return {
    id,
    type,
    productionCap,
    production,
    regionalCell,
    cells,
    infrastructure: [...(fields.infrastructure ?? [])],
  };
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
  private _state: Omit<
    RegionState,
    "regionalCell" | "cells" | "infrastructure"
  >;
  private _regionalCell!: Cell;
  private _cells: readonly Cell[] = [];
  private _infrastructure: readonly Infrastructure[] = [];
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

  get infrastructure(): readonly Infrastructure[] {
    return this._infrastructure;
  }

  get pops(): readonly Pop[] {
    return [this._regionalCell, ...this._cells].flatMap((cell) => cell.pops);
  }

  getState(): RegionState {
    return {
      ...this._state,
      regionalCell: this._regionalCell.getState(),
      cells: this._cells.map((cell) => cell.getState()),
      infrastructure: this._infrastructure.map((item) => item.getState()),
    };
  }

  setState(state: RegionState): void {
    const { regionalCell, cells, infrastructure, ...own } = state;
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
    this._infrastructure = infrastructure.map(
      (item) => new Infrastructure(item, this.config),
    );
  }

  tick(n = 1): void {
    for (let i = 0; i < n; i++) {
      this.distribute();
      this.tickPops();
      this.splitAndRemove();
      this.tickInfrastructure();
      this.produce();
    }
  }

  private distribute(): void {
    const members = this._regionalCell.pops;
    const need = members.reduce(
      (sum, pop) => sum + exactSize(pop.getState()),
      0,
    );
    const production = this._state.production;
    const reserved = Math.min(production, need);
    const owned = this._infrastructure.filter(
      (item) => item.controllerId === this._regionalCell.factionId,
    );
    const budget = owned.reduce((sum, item) => sum + item.upkeepBudget, 0);
    const available = production - reserved;
    const paidShare = budget > 0 ? Math.min(1, available / budget) : 0;
    for (const item of this._infrastructure) {
      item.receive(owned.includes(item) ? item.upkeepBudget * paidShare : 0);
    }
    const forPops = production - budget * paidShare;
    for (const pop of this.pops) {
      const share =
        pop.cell === this._regionalCell && need > 0
          ? (forPops * exactSize(pop.getState())) / need
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

  private tickInfrastructure(): void {
    const present = new Set(
      [this._regionalCell, ...this._cells]
        .filter((cell) => cell.pops.length > 0)
        .map((cell) => cell.factionId),
    );
    const planetaryFaction = this._regionalCell.factionId;
    for (const item of this._infrastructure) {
      if (!present.has(item.controllerId)) {
        item.setState({ ...item.getState(), controller: planetaryFaction });
      }
      item.tick();
    }
    this._infrastructure = this._infrastructure.filter(
      (item) => !item.destroyed,
    );
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
