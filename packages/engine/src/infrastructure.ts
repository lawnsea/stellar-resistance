import { defaultConfig, type EngineConfig } from "./config";
import type { Stateful, Tickable } from "./traits";

export type InfrastructureType = "production" | "extraction";

export interface InfrastructureState {
  readonly id: string;
  readonly type: InfrastructureType;
  readonly controller: string;
  readonly condition: number;
  readonly upkeepBudget: number;
  readonly progress: number;
  readonly constructionBudget: number;
}

export interface InfrastructureFields
  extends Pick<InfrastructureState, "id" | "type" | "controller"> {
  readonly condition?: number;
  readonly upkeepBudget?: number;
  readonly progress?: number;
  readonly constructionBudget?: number;
}

export function createInfrastructure(
  fields: InfrastructureFields,
  config: EngineConfig = defaultConfig,
): InfrastructureState {
  const { id, type, controller } = fields;
  const condition = fields.condition ?? 1;
  const upkeepBudget = fields.upkeepBudget ?? config.infrastructureUpkeep[type];
  const progress = fields.progress ?? 1;
  const constructionBudget =
    fields.constructionBudget ?? config.infrastructureConstructionBudget[type];
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
  if (!(progress >= 0 && progress <= 1)) {
    throw new Error(
      `Infrastructure ${id} progress must be in [0, 1], got ${progress}`,
    );
  }
  if (!(constructionBudget >= 0) || !Number.isFinite(constructionBudget)) {
    throw new Error(
      `Infrastructure ${id} construction budget must be at least 0, got ${constructionBudget}`,
    );
  }
  return {
    id,
    type,
    controller,
    condition,
    upkeepBudget,
    progress,
    constructionBudget,
  };
}

export class Infrastructure implements Stateful<InfrastructureState>, Tickable {
  private _state: InfrastructureState;
  private payment = 0;
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

  get progress(): number {
    return this._state.progress;
  }

  get built(): boolean {
    return this._state.progress >= 1;
  }

  get cost(): number {
    return this.config.infrastructureCost[this._state.type];
  }

  // What it asks for this tick: upkeep once built, otherwise construction
  // up to the remaining cost.
  get budget(): number {
    return this.built
      ? this._state.upkeepBudget
      : Math.min(
          this._state.constructionBudget,
          this.cost * (1 - this._state.progress),
        );
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

  receive(amount: number): void {
    this.payment = amount;
  }

  tick(n = 1): void {
    for (let i = 0; i < n; i++) {
      if (!this.built) {
        const cost = this.cost;
        const progress =
          cost > 0
            ? Math.min(1, this._state.progress + this.payment / cost)
            : 1;
        this._state = { ...this._state, progress };
        continue;
      }
      const requirement = this.upkeepRequirement;
      const satisfied = requirement > 0 ? this.payment / requirement : 1;
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
