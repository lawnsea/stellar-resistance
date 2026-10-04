import { defaultConfig, type EngineConfig } from "./config";
import type { Stateful, Tickable } from "./traits";

export type InfrastructureType = "production" | "extraction";

export interface InfrastructureState {
  readonly id: string;
  readonly type: InfrastructureType;
  readonly controller: string;
  readonly condition: number;
  readonly upkeepBudget: number;
  readonly built: boolean;
}

export interface InfrastructureFields
  extends Pick<InfrastructureState, "id" | "type" | "controller"> {
  readonly condition?: number;
  readonly upkeepBudget?: number;
  readonly built?: boolean;
}

export function createInfrastructure(
  fields: InfrastructureFields,
  config: EngineConfig = defaultConfig,
): InfrastructureState {
  const { id, type, controller } = fields;
  const condition = fields.condition ?? 1;
  const upkeepBudget = fields.upkeepBudget ?? config.infrastructureUpkeep[type];
  const built = fields.built ?? true;
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
  return { id, type, controller, condition, upkeepBudget, built };
}

export class Infrastructure implements Stateful<InfrastructureState>, Tickable {
  private _state: InfrastructureState;
  // Undefined until upkeep is offered, so infrastructure built after this
  // tick's distribution keeps its condition.
  private upkeep: number | undefined;
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

  get built(): boolean {
    return this._state.built;
  }

  get staffRequirement(): number {
    return this.config.infrastructureStaff[this._state.type];
  }

  get destroyed(): boolean {
    return (
      this.built && this._state.condition < this.config.destructionThreshold
    );
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
    const upkeep = this.upkeep;
    this.upkeep = undefined;
    for (let i = 0; i < n; i++) {
      if (!this.built || upkeep === undefined) {
        continue;
      }
      const requirement = this.upkeepRequirement;
      const satisfied = requirement > 0 ? upkeep / requirement : 1;
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
