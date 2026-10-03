import type { Stateful } from "./traits";

export interface CellState {
  readonly id: string;
  readonly regionId: string;
  readonly popIds: readonly string[];
}

export interface CellFields extends Omit<CellState, "popIds"> {
  readonly popIds?: readonly string[];
}

export function createCell(fields: CellFields): CellState {
  return {
    id: fields.id,
    regionId: fields.regionId,
    popIds: [...(fields.popIds ?? [])],
  };
}

export class Cell implements Stateful<CellState> {
  private _state: CellState;

  constructor(state: CellState) {
    this._state = state;
  }

  get id(): string {
    return this._state.id;
  }

  get regionId(): string {
    return this._state.regionId;
  }

  get popIds(): readonly string[] {
    return this._state.popIds;
  }

  getState(): CellState {
    return this._state;
  }

  setState(state: CellState): void {
    this._state = state;
  }
}
