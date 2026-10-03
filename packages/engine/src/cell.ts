import type { Stateful } from "./traits";

export interface CellState {
  readonly id: string;
  readonly regionId: string;
}

export function createCell(fields: CellState): CellState {
  return { id: fields.id, regionId: fields.regionId };
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

  getState(): CellState {
    return this._state;
  }

  setState(state: CellState): void {
    this._state = state;
  }
}
