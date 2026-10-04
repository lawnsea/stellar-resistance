import { Cell, type CellState, createCell } from "./cell";
import { defaultConfig, type EngineConfig } from "./config";
import {
  createInfrastructure,
  Infrastructure,
  type InfrastructureState,
  type InfrastructureType,
} from "./infrastructure";
import type { Operation } from "./operation";
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
  readonly nextInfrastructureNumber: number;
}

export interface RegionFields {
  readonly id: string;
  readonly type: RegionType;
  readonly productionCap: number;
  readonly production?: number;
  readonly pops?: readonly PopState[];
  readonly cells?: readonly CellState[];
  readonly infrastructure?: readonly InfrastructureState[];
  readonly nextInfrastructureNumber?: number;
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
  const infrastructure = [...(fields.infrastructure ?? [])];
  if (
    fields.production !== undefined &&
    (!(fields.production >= 0) || !Number.isFinite(fields.production))
  ) {
    throw new Error(
      `Region ${id} production must be at least 0, got ${fields.production}`,
    );
  }
  const draft = { productionCap, regionalCell, cells, infrastructure };
  const production = fields.production ?? computeProduction(draft, config);
  const [regionalIncome = 0, ...incomes] = computeIncomes(
    draft,
    production,
    config,
  );
  return {
    id,
    type,
    productionCap,
    production,
    regionalCell: { ...regionalCell, income: regionalIncome },
    cells: cells.map((cell, i) => ({ ...cell, income: incomes[i] ?? 0 })),
    infrastructure,
    nextInfrastructureNumber: fields.nextInfrastructureNumber ?? 1,
  };
}

type RegionOutputState = Pick<
  RegionState,
  "productionCap" | "regionalCell" | "cells" | "infrastructure"
>;

interface Staffing {
  readonly cells: readonly CellState[];
  readonly sizes: readonly number[];
  readonly factionSize: ReadonlyMap<string, number>;
  readonly active: readonly InfrastructureState[];
  // The share of each faction's staff requirement that's met.
  staffed(faction: string): number;
  // The share of each faction's pops drawn as staff.
  staffShare(faction: string): number;
  effect(item: InfrastructureState): number;
}

function sizeOf(cell: CellState): number {
  return cell.pops.reduce((sum, pop) => sum + exactSize(pop), 0);
}

function computeStaffing(
  region: RegionOutputState,
  config: EngineConfig,
): Staffing {
  const cells = [region.regionalCell, ...region.cells];
  const planetaryFaction = region.regionalCell.faction;
  const active = region.infrastructure.filter(
    (item) =>
      item.built &&
      (item.type !== "extraction" || item.controller !== planetaryFaction),
  );
  const sizes = cells.map(sizeOf);
  const factionSize = new Map<string, number>();
  cells.forEach((cell, i) => {
    factionSize.set(
      cell.faction,
      (factionSize.get(cell.faction) ?? 0) + (sizes[i] ?? 0),
    );
  });
  const demand = new Map<string, number>();
  for (const item of active) {
    demand.set(
      item.controller,
      (demand.get(item.controller) ?? 0) +
        config.infrastructureStaff[item.type],
    );
  }
  const staffed = (faction: string): number => {
    const needed = demand.get(faction) ?? 0;
    return needed > 0
      ? Math.min(1, (factionSize.get(faction) ?? 0) / needed)
      : 1;
  };
  const staffShare = (faction: string): number => {
    const available = factionSize.get(faction) ?? 0;
    return available > 0
      ? Math.min(1, (demand.get(faction) ?? 0) / available)
      : 0;
  };
  const effect = (item: InfrastructureState): number =>
    config.infrastructureImpact[item.type] *
    staffed(item.controller) *
    item.condition;
  return { cells, sizes, factionSize, active, staffed, staffShare, effect };
}

function computeProduction(
  region: RegionOutputState,
  config: EngineConfig,
): number {
  const staffing = computeStaffing(region, config);
  let base = 0;
  for (const cell of staffing.cells) {
    const working = 1 - staffing.staffShare(cell.faction);
    for (const pop of cell.pops) {
      base +=
        exactSize(pop) *
        working *
        config.productionRate *
        Math.min(1, pop.actualStandardOfLiving);
    }
  }
  const multiple = staffing.active
    .filter((item) => item.type === "production")
    .reduce((sum, item) => sum + staffing.effect(item), 0);
  return Math.min(base, region.productionCap) * (1 + multiple);
}

// Each cell's income, for [regionalCell, ...cells].
function computeIncomes(
  region: RegionOutputState,
  production: number,
  config: EngineConfig,
): number[] {
  const staffing = computeStaffing(region, config);
  const extraction = new Map<string, number>();
  for (const item of staffing.active) {
    if (item.type === "extraction") {
      extraction.set(
        item.controller,
        (extraction.get(item.controller) ?? 0) + staffing.effect(item),
      );
    }
  }
  const total = [...extraction.values()].reduce((sum, e) => sum + e, 0);
  const scale = total > 1 ? 1 / total : 1;
  let extracted = 0;
  const incomes = staffing.cells.map((cell, i) => {
    const share = extraction.get(cell.faction) ?? 0;
    const size = staffing.factionSize.get(cell.faction) ?? 0;
    if (share === 0 || size === 0) {
      return 0;
    }
    const income =
      (production * share * scale * (staffing.sizes[i] ?? 0)) / size;
    extracted += income;
    return income;
  });
  incomes[0] = production - extracted;
  return incomes;
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

  build(cell: Cell, type: InfrastructureType): Operation {
    if (cell.region !== this) {
      throw new Error(`Cell ${cell.id} isn't in region ${this.id}`);
    }
    if (type === "extraction" && cell === this._regionalCell) {
      throw new Error(
        `Regional cell ${cell.id} can't build extraction infrastructure`,
      );
    }
    const taken = new Set(this._infrastructure.map((item) => item.id));
    let n = this._state.nextInfrastructureNumber;
    while (taken.has(`${this.id}-infra-${n}`)) {
      n++;
    }
    const id = `${this.id}-infra-${n}`;
    const operation = cell.startOperation(
      "build",
      id,
      this.config.infrastructureBuild[type],
    );
    const item = new Infrastructure(
      createInfrastructure(
        { id, type, controller: cell.factionId, built: false },
        this.config,
      ),
      this.config,
    );
    this._state = { ...this._state, nextInfrastructureNumber: n + 1 };
    this._infrastructure = [...this._infrastructure, item];
    return operation;
  }

  tick(n = 1): void {
    for (let i = 0; i < n; i++) {
      this.distribute();
      this.runOperations();
      this.tickPops();
      this.splitAndRemove();
      this.tickInfrastructure();
      this.produce();
      this.extract();
    }
  }

  private distribute(): void {
    const byFaction = new Map<string, Cell[]>();
    for (const cell of [this._regionalCell, ...this._cells]) {
      byFaction.set(cell.factionId, [
        ...(byFaction.get(cell.factionId) ?? []),
        cell,
      ]);
    }
    for (const item of this._infrastructure) {
      if (!byFaction.has(item.controllerId)) {
        item.receive(0);
      }
    }
    for (const [faction, cells] of byFaction) {
      const needs = cells.map((cell) =>
        cell.pops.reduce((sum, pop) => sum + exactSize(pop.getState()), 0),
      );
      const reserves = cells.map((cell, i) =>
        Math.min(cell.income, needs[i] ?? 0),
      );
      const remainders = cells.map(
        (cell, i) => cell.income - (reserves[i] ?? 0),
      );
      const pool = remainders.reduce((sum, r) => sum + r, 0);
      const owned = this._infrastructure.filter(
        (item) => item.controllerId === faction && item.built,
      );
      const budget = owned.reduce((sum, item) => sum + item.upkeepBudget, 0);
      const paidShare = budget > 0 ? Math.min(1, pool / budget) : 0;
      for (const item of owned) {
        item.receive(item.upkeepBudget * paidShare);
      }
      const leftover = pool - budget * paidShare;
      cells.forEach((cell, i) => {
        const need = needs[i] ?? 0;
        const returned =
          pool > 0 ? (leftover * (remainders[i] ?? 0)) / pool : 0;
        const saved = returned * this.config.savingsRate;
        cell.save(saved);
        const forPops = (reserves[i] ?? 0) + returned - saved;
        for (const pop of cell.pops) {
          pop.receive(
            need > 0 ? (forPops * exactSize(pop.getState())) / need : 0,
          );
        }
      });
    }
  }

  private runOperations(): void {
    for (const cell of [this._regionalCell, ...this._cells]) {
      for (const operation of cell.runOperations()) {
        const item = this._infrastructure.find(
          (candidate) => candidate.id === operation.target,
        );
        item?.setState({ ...item.getState(), built: true });
      }
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
        for (const cell of this._cells) {
          cell.cancelOperations(item.id);
        }
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
      production: computeProduction(this.getState(), this.config),
    };
  }

  private extract(): void {
    const incomes = computeIncomes(
      this.getState(),
      this._state.production,
      this.config,
    );
    [this._regionalCell, ...this._cells].forEach((cell, i) => {
      cell.setIncome(incomes[i] ?? 0);
    });
  }
}
