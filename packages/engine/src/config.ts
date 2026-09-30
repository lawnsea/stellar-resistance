export interface EngineConfig {
  readonly maxPopSize: number;
  readonly productionRate: number;
  readonly expectationAdjustmentRate: number;
  readonly baseBirthRate: number;
  readonly baseDeathRate: number;
  readonly prosperityResponse: number;
  readonly deprivationCurvature: number;
  readonly starvationDeathMultiplier: number;
}

export const defaultConfig: EngineConfig = {
  maxPopSize: 5000,
  // A little above 1.0, so fully provided-for pops produce a small surplus.
  productionRate: 1.05,
  expectationAdjustmentRate: 0.1,
  baseBirthRate: 0.01,
  baseDeathRate: 0.01,
  prosperityResponse: 2,
  deprivationCurvature: 4,
  starvationDeathMultiplier: 4,
};
