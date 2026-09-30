export interface EngineConfig {
  readonly maxPopSize: number;
  readonly productionRate: number;
  readonly expectationAdjustmentRate: number;
}

export const defaultConfig: EngineConfig = {
  maxPopSize: 5000,
  // A little above 1.0, so fully provided-for pops produce a small surplus.
  productionRate: 1.05,
  expectationAdjustmentRate: 0.1,
};
