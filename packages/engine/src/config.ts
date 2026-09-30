export interface EngineConfig {
  readonly maxPopSize: number;
  readonly productionRate: number;
  readonly consumptionRate: number;
}

export const defaultConfig: EngineConfig = {
  maxPopSize: 5000,
  // Consumption is a little less than production, so regions run a surplus.
  // To be tuned later.
  productionRate: 1.0,
  consumptionRate: 0.9,
};
