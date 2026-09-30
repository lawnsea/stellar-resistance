import { defaultConfig, type EngineConfig } from "./config";

export interface Pop {
  readonly id: string;
  readonly size: number;
  // Share of production received last tick, relative to the pop's
  // consumption requirement. 1.0 means the requirement was exactly met.
  readonly actualStandardOfLiving: number;
  readonly expectedStandardOfLiving: number;
}

export interface PopFields extends Omit<Pop, "actualStandardOfLiving"> {
  readonly actualStandardOfLiving?: number;
}

export function createPop(
  fields: PopFields,
  config: EngineConfig = defaultConfig,
): Pop {
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
