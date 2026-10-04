import { defaultConfig, type EngineConfig } from "./config";
import type { Faction } from "./faction";
import type { InfrastructureType } from "./infrastructure";
import {
  createOperation,
  Operation,
  type OperationCosts,
  type OperationState,
  type OperationType,
} from "./operation";
import { exactSize, Pop, type PopState, withExactSize } from "./pop";
import type { Region } from "./region";
import type { Stateful } from "./traits";

export interface CellState {
  readonly id: string;
  readonly faction: string;
  readonly region: string;
  readonly income: number;
  readonly stockpile: number;
  readonly pops: readonly PopState[];
  readonly operations: readonly OperationState[];
  readonly nextOperationNumber: number;
}

export interface CellFields
  extends Pick<CellState, "id" | "faction" | "region"> {
  readonly income?: number;
  readonly stockpile?: number;
  readonly pops?: readonly PopState[];
  readonly operations?: readonly OperationState[];
  readonly nextOperationNumber?: number;
}

export function createCell(fields: CellFields): CellState {
  return {
    id: fields.id,
    faction: fields.faction,
    region: fields.region,
    income: fields.income ?? 0,
    stockpile: fields.stockpile ?? 0,
    pops: [...(fields.pops ?? [])],
    operations: [...(fields.operations ?? [])],
    nextOperationNumber: fields.nextOperationNumber ?? 1,
  };
}

export class Cell implements Stateful<CellState> {
  private _state: Omit<CellState, "pops" | "operations">;
  private _pops: readonly Pop[] = [];
  private _operations: readonly Operation[] = [];
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

  get income(): number {
    return this._state.income;
  }

  get stockpile(): number {
    return this._state.stockpile;
  }

  get pops(): readonly Pop[] {
    return this._pops;
  }

  get operations(): readonly Operation[] {
    return this._operations;
  }

  setIncome(income: number): void {
    this._state = { ...this._state, income };
  }

  save(amount: number): void {
    this._state = { ...this._state, stockpile: this._state.stockpile + amount };
  }

  startOperation(
    type: OperationType,
    target: string,
    costs: OperationCosts,
  ): Operation {
    if (this._state.stockpile < costs.initialCost) {
      throw new Error(
        `Cell ${this.id} can't afford the initial cost of ${costs.initialCost} from its stockpile of ${this._state.stockpile}`,
      );
    }
    const n = this._state.nextOperationNumber;
    const operation = new Operation(
      createOperation({ id: `${this.id}-op-${n}`, type, target, ...costs }),
      this,
    );
    this._state = {
      ...this._state,
      stockpile: this._state.stockpile - costs.initialCost,
      nextOperationNumber: n + 1,
    };
    this._operations = [...this._operations, operation];
    return operation;
  }

  // Pays each operation's per-tick cost from the stockpile, all cut by the
  // same share when short, advances them, and returns the ones that finish.
  runOperations(): Operation[] {
    const total = this._operations.reduce(
      (sum, operation) => sum + operation.perTickCost,
      0,
    );
    const share = total > 0 ? Math.min(1, this._state.stockpile / total) : 0;
    for (const operation of this._operations) {
      operation.receive(operation.perTickCost * share);
      operation.tick();
    }
    this._state = {
      ...this._state,
      stockpile: this._state.stockpile - total * share,
    };
    const finished = this._operations.filter((operation) => operation.done);
    this._operations = this._operations.filter((operation) => !operation.done);
    return finished;
  }

  cancelOperations(target: string): void {
    this._operations = this._operations.filter(
      (operation) => operation.target !== target,
    );
  }

  build(type: InfrastructureType): Operation {
    if (!this._region) {
      throw new Error(`Cell ${this.id} isn't in a region`);
    }
    return this._region.build(this, type);
  }

  joinFaction(faction: Faction): void {
    this._faction = faction;
  }

  getState(): CellState {
    return {
      ...this._state,
      pops: this._pops.map((pop) => pop.getState()),
      operations: this._operations.map((operation) => operation.getState()),
    };
  }

  setState(state: CellState): void {
    const { pops, operations, ...own } = state;
    this._state = own;
    this._pops = pops.map((pop) => new Pop(pop, this.config, this));
    this._operations = operations.map(
      (operation) => new Operation(operation, this),
    );
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
