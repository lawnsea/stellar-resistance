import { defaultConfig, type EngineConfig } from "./config";
import { exactSize, Pop, type PopState, withExactSize } from "./pop";
import type { Stateful, Tickable } from "./traits";

export type RegionType = "rural" | "urban";

export interface RegionState {
  readonly id: string;
  readonly type: RegionType;
  readonly productionCap: number;
  readonly production: number;
  readonly pops: readonly PopState[];
}

export interface RegionFields extends Omit<RegionState, "production"> {
  readonly production?: number;
}

export function createRegion(
  fields: RegionFields,
  config: EngineConfig = defaultConfig,
): RegionState {
  const { id, type, productionCap } = fields;
  if (!(productionCap > 0) || !Number.isFinite(productionCap)) {
    throw new Error(
      `Region ${id} production cap must be a positive number, got ${productionCap}`,
    );
  }
  const pops = [...fields.pops];
  const production =
    fields.production ?? computeProduction(pops, productionCap, config);
  if (!(production >= 0) || !Number.isFinite(production)) {
    throw new Error(
      `Region ${id} production must be at least 0, got ${production}`,
    );
  }
  return { id, type, productionCap, production, pops };
}

function computeProduction(
  pops: readonly PopState[],
  productionCap: number,
  config: EngineConfig,
): number {
  let production = 0;
  for (const pop of pops) {
    production +=
      exactSize(pop) *
      config.productionRate *
      Math.min(1, pop.actualStandardOfLiving);
  }
  return Math.min(production, productionCap);
}

export interface RegionEconomy {
  readonly production: number;
  readonly consumption: number;
  readonly surplus: number;
}

export function computeRegionEconomy(region: RegionState): RegionEconomy {
  let consumption = 0;
  for (const pop of region.pops) {
    consumption += exactSize(pop);
  }
  const { production } = region;
  return { production, consumption, surplus: production - consumption };
}

export class Region implements Stateful<RegionState>, Tickable {
  private _state: Omit<RegionState, "pops">;
  private _pops: readonly Pop[] = [];
  private readonly config: EngineConfig;

  constructor(state: RegionState, config: EngineConfig = defaultConfig) {
    this.config = config;
    this._state = state;
    this.setState(state);
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

  get production(): number {
    return this._state.production;
  }

  get pops(): readonly Pop[] {
    return this._pops;
  }

  getState(): RegionState {
    return { ...this._state, pops: this._pops.map((pop) => pop.getState()) };
  }

  setState(state: RegionState): void {
    const { pops, ...own } = state;
    this._state = own;
    this._pops = pops.map((pop) => new Pop(pop, this.config));
  }

  tick(n = 1): void {
    for (let i = 0; i < n; i++) {
      this.distribute();
      this.tickPops();
      this.splitAndRemove();
      this.produce();
    }
  }

  private distribute(): void {
    const total = this._pops.reduce(
      (sum, pop) => sum + exactSize(pop.getState()),
      0,
    );
    for (const pop of this._pops) {
      const share =
        total > 0
          ? (this._state.production * exactSize(pop.getState())) / total
          : 0;
      pop.receive(share);
    }
  }

  private tickPops(): void {
    for (const pop of this._pops) {
      pop.tick();
    }
  }

  private splitAndRemove(): void {
    this._pops = this._pops.flatMap((pop) => {
      const state = pop.getState();
      const size = exactSize(state);
      if (size < 1) {
        return [];
      }
      if (size > this.config.maxPopSize) {
        const half = size / 2;
        return [1, 2].map(
          (part) =>
            new Pop(
              withExactSize({ ...state, id: `${state.id}.${part}` }, half),
              this.config,
            ),
        );
      }
      return [pop];
    });
  }

  private produce(): void {
    this._state = {
      ...this._state,
      production: computeProduction(
        this._pops.map((pop) => pop.getState()),
        this._state.productionCap,
        this.config,
      ),
    };
  }
}
