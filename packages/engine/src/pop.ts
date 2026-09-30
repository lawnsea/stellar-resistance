import { defaultConfig, type EngineConfig } from "./config";

export interface Pop {
  readonly id: string;
  readonly size: number;
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
  return { id: fields.id, size: fields.size };
}
