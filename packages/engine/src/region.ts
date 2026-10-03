import { defaultConfig, type EngineConfig } from "./config";
import { birthRate, deathRate } from "./demography";
import {
  exactSize,
  nextExpectedStandardOfLiving,
  type Pop,
  withExactSize,
} from "./pop";
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

interface RegionTick {
  readonly region: RegionState;
  readonly economy: RegionEconomy;
}

type RegionPhase = (tick: RegionTick, config: EngineConfig) => RegionTick;

const regionPhases: readonly RegionPhase[] = [
  produce,
  birthsAndDeaths,
  distribute,
  adjustExpectations,
  splitAndRemove,
];

function nextRegionState(
  region: RegionState,
  config: EngineConfig,
): RegionState {
  let tick: RegionTick = {
    region,
    economy: { production: 0, consumption: 0, surplus: 0 },
  };
  for (const phase of regionPhases) {
    tick = phase(tick, config);
  }
  return tick.region;
}

function withPops(tick: RegionTick, pops: readonly Pop[]): RegionTick {
  return { ...tick, region: { ...tick.region, pops } };
}

function produce(tick: RegionTick, config: EngineConfig): RegionTick {
  return { ...tick, economy: computeRegionEconomy(tick.region, config) };
}

function birthsAndDeaths(tick: RegionTick, config: EngineConfig): RegionTick {
  return withPops(
    tick,
    tick.region.pops.map((pop) => {
      const size = exactSize(pop);
      const previous = pop.actualStandardOfLiving;
      const births = birthRate(previous, config) * size;
      const deaths = deathRate(previous, config) * size;
      return withExactSize(pop, size + births - deaths);
    }),
  );
}

function distribute(tick: RegionTick): RegionTick {
  const { production, consumption } = tick.economy;
  const actualStandardOfLiving = consumption > 0 ? production / consumption : 0;
  return withPops(
    tick,
    tick.region.pops.map((pop) => ({ ...pop, actualStandardOfLiving })),
  );
}

function adjustExpectations(
  tick: RegionTick,
  config: EngineConfig,
): RegionTick {
  return withPops(
    tick,
    tick.region.pops.map((pop) => ({
      ...pop,
      expectedStandardOfLiving: nextExpectedStandardOfLiving(
        pop.expectedStandardOfLiving,
        pop.actualStandardOfLiving,
        config,
      ),
    })),
  );
}

function splitAndRemove(tick: RegionTick, config: EngineConfig): RegionTick {
  return withPops(tick, splitAndRemovePops(tick.region.pops, config));
}

// Applies after all of a region's changes for a tick. To move into a separate
// after-tick handler (#28).
function splitAndRemovePops(pops: readonly Pop[], config: EngineConfig): Pop[] {
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
