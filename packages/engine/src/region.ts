import { defaultConfig, type EngineConfig } from "./config";
import { nextRegionState } from "./economy";
import type { Pop } from "./pop";
import type { Stateful, Tickable } from "./traits";

export type RegionType = "rural" | "urban";

export interface RegionState {
  readonly id: string;
  readonly type: RegionType;
  readonly productionCap: number;
  readonly pops: readonly Pop[];
}

export function createRegion(fields: RegionState): RegionState {
  const { id, type, productionCap } = fields;
  if (!(productionCap > 0) || !Number.isFinite(productionCap)) {
    throw new Error(
      `Region ${id} production cap must be a positive number, got ${productionCap}`,
    );
  }
  return { id, type, productionCap, pops: [...fields.pops] };
}

export class Region implements Stateful<RegionState>, Tickable {
  private _state: RegionState;
  private readonly config: EngineConfig;

  constructor(state: RegionState, config: EngineConfig = defaultConfig) {
    this._state = state;
    this.config = config;
  }

  get id(): string {
    return this._state.id;
  }

  get type(): RegionType {
    return this._state.type;
  }

  get productionCap(): number {
    return this._state.productionCap;
  }

  get pops(): readonly Pop[] {
    return this._state.pops;
  }

  getState(): RegionState {
    return this._state;
  }

  setState(state: RegionState): void {
    this._state = state;
  }

  tick(n = 1): void {
    for (let i = 0; i < n; i++) {
      this._state = nextRegionState(this._state, this.config);
    }
  }
}
