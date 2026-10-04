import type { Cell } from "./cell";
import type { Stateful, Tickable } from "./traits";

export type OperationType = "build";

export interface OperationCosts {
  readonly initialCost: number;
  readonly duration: number;
  readonly perTickCost: number;
}

export interface OperationState extends OperationCosts {
  readonly id: string;
  readonly type: OperationType;
  readonly target: string;
  readonly progress: number;
}

export interface OperationFields extends Omit<OperationState, "progress"> {
  readonly progress?: number;
}

export function createOperation(fields: OperationFields): OperationState {
  const { id, type, target, initialCost, duration, perTickCost } = fields;
  const progress = fields.progress ?? 0;
  for (const [name, value] of [
    ["initial cost", initialCost],
    ["per-tick cost", perTickCost],
  ] as const) {
    if (!(value >= 0) || !Number.isFinite(value)) {
      throw new Error(
        `Operation ${id} ${name} must be at least 0, got ${value}`,
      );
    }
  }
  if (!(duration > 0) || !Number.isFinite(duration)) {
    throw new Error(
      `Operation ${id} duration must be a positive number, got ${duration}`,
    );
  }
  if (!(progress >= 0 && progress <= duration)) {
    throw new Error(
      `Operation ${id} progress must be in [0, ${duration}], got ${progress}`,
    );
  }
  return { id, type, target, initialCost, duration, perTickCost, progress };
}

export class Operation implements Stateful<OperationState>, Tickable {
  private _state: OperationState;
  private payment = 0;
  private readonly _cell: Cell | undefined;

  constructor(state: OperationState, cell?: Cell) {
    this._state = state;
    this._cell = cell;
  }

  get id(): string {
    return this._state.id;
  }

  get type(): OperationType {
    return this._state.type;
  }

  get target(): string {
    return this._state.target;
  }

  get initialCost(): number {
    return this._state.initialCost;
  }

  get duration(): number {
    return this._state.duration;
  }

  get perTickCost(): number {
    return this._state.perTickCost;
  }

  get progress(): number {
    return this._state.progress;
  }

  get done(): boolean {
    return this._state.progress >= this._state.duration;
  }

  get cell(): Cell | undefined {
    return this._cell;
  }

  getState(): OperationState {
    return this._state;
  }

  setState(state: OperationState): void {
    this._state = state;
  }

  receive(payment: number): void {
    this.payment = payment;
  }

  tick(n = 1): void {
    for (let i = 0; i < n; i++) {
      const { perTickCost, duration } = this._state;
      const share =
        perTickCost > 0 ? Math.min(1, this.payment / perTickCost) : 1;
      const progress = Math.min(duration, this._state.progress + share);
      this._state = { ...this._state, progress };
    }
  }
}
