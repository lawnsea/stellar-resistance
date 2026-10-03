import type { Cell } from "./cell";
import { defaultConfig, type EngineConfig } from "./config";
import type { Stateful, Tickable } from "./traits";

export interface PopState {
  readonly id: string;
  readonly size: number;
  readonly actualStandardOfLiving: number;
  readonly expectedStandardOfLiving: number;
}

export interface PopFields extends Omit<PopState, "actualStandardOfLiving"> {
  readonly actualStandardOfLiving?: number;
}

export function createPop(
  fields: PopFields,
  config: EngineConfig = defaultConfig,
): PopState {
  const { id, size, expectedStandardOfLiving } = fields;
  const actualStandardOfLiving = fields.actualStandardOfLiving ?? 1;
  if (!Number.isInteger(size) || size < 1 || size > config.maxPopSize) {
    throw new Error(
      `Pop ${id} size must be an integer from 1 to ${config.maxPopSize}, got ${size}`,
    );
  }
  if (
    !(actualStandardOfLiving >= 0) ||
    !Number.isFinite(actualStandardOfLiving)
  ) {
    throw new Error(
      `Pop ${id} actual standard of living must be at least 0, got ${actualStandardOfLiving}`,
    );
  }
  if (
    !(expectedStandardOfLiving >= 0) ||
    !Number.isFinite(expectedStandardOfLiving)
  ) {
    throw new Error(
      `Pop ${id} expected standard of living must be at least 0, got ${expectedStandardOfLiving}`,
    );
  }
  return { id, size, actualStandardOfLiving, expectedStandardOfLiving };
}

export function nextExpectedStandardOfLiving(
  expected: number,
  actual: number,
  config: EngineConfig = defaultConfig,
): number {
  return expected + (actual - expected) * config.expectationAdjustmentRate;
}

// Rises with diminishing returns from 0 at x = 0 to 1 at x = 1. Higher
// curvature front-loads more of the rise.
function diminishing(x: number, curvature: number): number {
  return Math.log1p(curvature * x) / Math.log1p(curvature);
}

// 0 at a standard of living of 1.0, rising with diminishing returns above
// it; prosperityResponse at 2.0.
function prosperity(standardOfLiving: number, config: EngineConfig): number {
  return (
    config.prosperityResponse *
    diminishing(standardOfLiving - 1, config.prosperityCurvature)
  );
}

// 0 at a standard of living of 1.0, rising with diminishing returns to 1 at
// 0.0.
function deprivation(standardOfLiving: number, config: EngineConfig): number {
  return diminishing(1 - standardOfLiving, config.deprivationCurvature);
}

export function birthRate(
  standardOfLiving: number,
  config: EngineConfig = defaultConfig,
): number {
  if (standardOfLiving >= 1) {
    return config.baseBirthRate * (1 + prosperity(standardOfLiving, config));
  }
  return config.baseBirthRate * (1 - deprivation(standardOfLiving, config));
}

export function deathRate(
  standardOfLiving: number,
  config: EngineConfig = defaultConfig,
): number {
  if (standardOfLiving > 1) {
    return config.baseDeathRate / (1 + prosperity(standardOfLiving, config));
  }
  return (
    config.baseDeathRate *
    (1 + config.deprivationResponse * deprivation(standardOfLiving, config))
  );
}

interface PopStateWithExactSize extends PopState {
  readonly exactSize: number;
}

export function exactSize(pop: PopState): number {
  return (pop as Partial<PopStateWithExactSize>).exactSize ?? pop.size;
}

export function withExactSize(pop: PopState, size: number): PopState {
  const next: PopStateWithExactSize = {
    ...pop,
    size: Math.floor(size),
    exactSize: size,
  };
  return next;
}

export class Pop implements Stateful<PopState>, Tickable {
  private _state: PopState;
  private share = 0;
  private readonly config: EngineConfig;
  private readonly _cell: Cell | undefined;

  constructor(
    state: PopState,
    config: EngineConfig = defaultConfig,
    cell?: Cell,
  ) {
    this._state = state;
    this.config = config;
    this._cell = cell;
  }

  get cell(): Cell | undefined {
    return this._cell;
  }

  get id(): string {
    return this._state.id;
  }

  get size(): number {
    return this._state.size;
  }

  get actualStandardOfLiving(): number {
    return this._state.actualStandardOfLiving;
  }

  get expectedStandardOfLiving(): number {
    return this._state.expectedStandardOfLiving;
  }

  getState(): PopState {
    return this._state;
  }

  setState(state: PopState): void {
    this._state = state;
  }

  receive(share: number): void {
    this.share = share;
  }

  tick(n = 1): void {
    for (let i = 0; i < n; i++) {
      const size = exactSize(this._state);
      const actual = size > 0 ? this.share / size : 0;
      const births = birthRate(actual, this.config) * size;
      const deaths = deathRate(actual, this.config) * size;
      this._state = withExactSize(
        {
          ...this._state,
          actualStandardOfLiving: actual,
          expectedStandardOfLiving: nextExpectedStandardOfLiving(
            this._state.expectedStandardOfLiving,
            actual,
            this.config,
          ),
        },
        size + births - deaths,
      );
    }
  }
}
