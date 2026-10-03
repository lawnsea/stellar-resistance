import { defaultConfig, type EngineConfig } from "./config";
import type { Stateful, Tickable } from "./traits";

export type InfrastructureType = "production" | "extraction";

export interface InfrastructureState {
  readonly id: string;
  readonly type: InfrastructureType;
  readonly controller: string;
  readonly condition: number;
  readonly upkeepBudget: number;
}

export interface InfrastructureFields
  extends Omit<InfrastructureState, "condition" | "upkeepBudget"> {
  readonly condition?: number;
  readonly upkeepBudget?: number;
}

export function createInfrastructure(
  fields: InfrastructureFields,
  config: EngineConfig = defaultConfig,
): InfrastructureState {
  const { id, type, controller } = fields;
  const condition = fields.condition ?? 1;
  const upkeepBudget = fields.upkeepBudget ?? config.infrastructureUpkeep[type];
  if (!(condition > 0 && condition <= 1)) {
    throw new Error(
      `Infrastructure ${id} condition must be in (0, 1], got ${condition}`,
    );
  }
  if (!(upkeepBudget >= 0) || !Number.isFinite(upkeepBudget)) {
    throw new Error(
      `Infrastructure ${id} upkeep budget must be at least 0, got ${upkeepBudget}`,
    );
  }
  return { id, type, controller, condition, upkeepBudget };
}

export class Infrastructure implements Stateful<InfrastructureState>, Tickable {
  private _state: InfrastructureState;
  private upkeep = 0;
  private readonly config: EngineConfig;

  constructor(
    state: InfrastructureState,
    config: EngineConfig = defaultConfig,
  ) {
    this._state = state;
    this.config = config;
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

  get condition(): number {
    return this._state.condition;
  }

  get upkeepBudget(): number {
    return this._state.upkeepBudget;
  }

  get upkeepRequirement(): number {
    return this.config.infrastructureUpkeep[this._state.type];
  }

  get destroyed(): boolean {
    return this._state.condition <= 0;
  }

  getState(): InfrastructureState {
    return this._state;
  }

  setState(state: InfrastructureState): void {
    this._state = state;
  }

  receive(upkeep: number): void {
    this.upkeep = upkeep;
  }

  tick(n = 1): void {
    for (let i = 0; i < n; i++) {
      const requirement = this.upkeepRequirement;
      const satisfied = requirement > 0 ? this.upkeep / requirement : 1;
      const delta = satisfied - this._state.condition;
      const efficiency =
        delta < 0
          ? this.config.neglectEfficiency
          : this.config.repairEfficiency;
      const condition = Math.min(
        1,
        Math.max(0, this._state.condition + efficiency * delta),
      );
      this._state = { ...this._state, condition };
    }
  }
}
