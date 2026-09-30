import { defaultConfig, type EngineConfig } from "./config";

export function nextExpectedStandardOfLiving(
  expected: number,
  actual: number,
  config: EngineConfig = defaultConfig,
): number {
  return expected + (actual - expected) * config.expectationAdjustmentRate;
}
