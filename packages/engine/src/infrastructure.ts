import type { Stateful } from "./traits";

export type InfrastructureType = "production" | "extraction";

export interface InfrastructureState {
  readonly id: string;
  readonly type: InfrastructureType;
  readonly controller: string;
}

export function createInfrastructure(
  fields: InfrastructureState,
): InfrastructureState {
  return { id: fields.id, type: fields.type, controller: fields.controller };
}

export class Infrastructure implements Stateful<InfrastructureState> {
  private _state: InfrastructureState;

  constructor(state: InfrastructureState) {
    this._state = state;
  }

  get id(): string {
    return this._state.id;
  }

  get type(): InfrastructureType {
    return this._state.type;
  }

  get controllerId(): string {
    return this._state.controller;
  }

  getState(): InfrastructureState {
    return this._state;
  }

  setState(state: InfrastructureState): void {
    this._state = state;
  }
}
