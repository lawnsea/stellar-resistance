import { defaultConfig, type EngineConfig } from "./config";
import { birthRate, deathRate } from "./demography";
import { nextExpectedStandardOfLiving } from "./economy";
import { exactSize, type Pop, withExactSize } from "./pop";
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

export interface RegionEconomy {
  readonly production: number;
  readonly consumption: number;
  readonly surplus: number;
}

export function computeRegionEconomy(
  region: RegionState,
  config: EngineConfig = defaultConfig,
): RegionEconomy {
  let production = 0;
  let consumption = 0;
  for (const pop of region.pops) {
    const size = exactSize(pop);
    production +=
      size * config.productionRate * Math.min(1, pop.actualStandardOfLiving);
    consumption += size;
  }
  production = Math.min(production, region.productionCap);
  return { production, consumption, surplus: production - consumption };
}

export function nextRegionState(
  region: RegionState,
  config: EngineConfig,
): RegionState {
  const economy = computeRegionEconomy(region, config);
  const actual =
    economy.consumption > 0 ? economy.production / economy.consumption : 0;
  const pops = region.pops.map((pop) => {
    const size = exactSize(pop);
    const previous = pop.actualStandardOfLiving;
    const births = birthRate(previous, config) * size;
    const deaths = deathRate(previous, config) * size;
    return withExactSize(
      {
        ...pop,
        actualStandardOfLiving: actual,
        expectedStandardOfLiving: nextExpectedStandardOfLiving(
          pop.expectedStandardOfLiving,
          actual,
          config,
        ),
      },
      size + births - deaths,
    );
  });
  return { ...region, pops: splitAndRemovePops(pops, config) };
}

// Applies after all of a region's changes for a tick. To move into a separate
// after-tick handler (#28).
export function splitAndRemovePops(
  pops: readonly Pop[],
  config: EngineConfig,
): Pop[] {
  return pops.flatMap((pop) => splitOrRemove(pop, config));
}

function splitOrRemove(pop: Pop, config: EngineConfig): Pop[] {
  const size = exactSize(pop);
  if (size < 1) {
    return [];
  }
  if (size > config.maxPopSize) {
    const half = size / 2;
    return [
      withExactSize({ ...pop, id: `${pop.id}.1` }, half),
      withExactSize({ ...pop, id: `${pop.id}.2` }, half),
    ];
  }
  return [pop];
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
