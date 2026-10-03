import { Cell, type CellState } from "./cell";
import type { Stateful } from "./traits";

export interface FactionState {
  readonly id: string;
  readonly name: string;
  readonly cells: readonly CellState[];
}

export interface FactionFields extends Omit<FactionState, "cells"> {
  readonly cells?: readonly CellState[];
}

export function createFaction(fields: FactionFields): FactionState {
  return { id: fields.id, name: fields.name, cells: [...(fields.cells ?? [])] };
}

export class Faction implements Stateful<FactionState> {
  private _state: Omit<FactionState, "cells">;
  private _cells: readonly Cell[] = [];

  constructor(state: FactionState) {
    this._state = state;
    this.setState(state);
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

  getState(): FactionState {
    return {
      ...this._state,
      cells: this._cells.map((cell) => cell.getState()),
    };
  }

  setState(state: FactionState): void {
    const { cells, ...own } = state;
    this._state = own;
    this._cells = cells.map((cell) => new Cell(cell));
  }
}
