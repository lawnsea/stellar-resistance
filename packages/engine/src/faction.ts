import type { Cell } from "./cell";
import type { Stateful } from "./traits";

export interface FactionState {
  readonly id: string;
  readonly name: string;
  readonly cellIds: readonly string[];
}

export interface FactionFields extends Omit<FactionState, "cellIds"> {
  readonly cellIds?: readonly string[];
}

export function createFaction(fields: FactionFields): FactionState {
  return {
    id: fields.id,
    name: fields.name,
    cellIds: [...(fields.cellIds ?? [])],
  };
}

export class Faction implements Stateful<FactionState> {
  private _state: FactionState;
  private _cells: readonly Cell[] = [];

  constructor(state: FactionState) {
    this._state = state;
  }

  get id(): string {
    return this._state.id;
  }

  get name(): string {
    return this._state.name;
  }

  get cells(): readonly Cell[] {
    return this._cells;
  }

  addCell(cell: Cell): void {
    this._cells = [...this._cells, cell];
    cell.joinFaction(this);
  }

  getState(): FactionState {
    return { ...this._state, cellIds: this._cells.map((cell) => cell.id) };
  }

  setState(state: FactionState): void {
    this._state = state;
  }
}
