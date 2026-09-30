import { defaultConfig, type EngineConfig } from "./config";
import { isFraction } from "./fraction";

export interface Pop {
  readonly id: string;
  readonly size: number;
  readonly expectedStandardOfLiving: number;
}

export function createPop(
  fields: Pop,
  config: EngineConfig = defaultConfig,
): Pop {
  if (
    !Number.isInteger(fields.size) ||
    fields.size < 1 ||
    fields.size > config.maxPopSize
  ) {
    throw new Error(
      `Pop ${fields.id} size must be an integer from 1 to ${config.maxPopSize}, got ${fields.size}`,
    );
  }
  if (!isFraction(fields.expectedStandardOfLiving)) {
    throw new Error(
      `Pop ${fields.id} expected standard of living must be in (0, 1], got ${fields.expectedStandardOfLiving}`,
    );
  }
  return {
    id: fields.id,
    size: fields.size,
    expectedStandardOfLiving: fields.expectedStandardOfLiving,
  };
}
