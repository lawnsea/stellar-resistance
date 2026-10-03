import type { InfrastructureType } from "./infrastructure";

export interface EngineConfig {
  readonly maxPopSize: number;
  readonly productionRate: number;
  readonly expectationAdjustmentRate: number;
  readonly baseBirthRate: number;
  readonly baseDeathRate: number;
  readonly prosperityResponse: number;
  readonly prosperityCurvature: number;
  readonly deprivationResponse: number;
  readonly deprivationCurvature: number;
  readonly infrastructureUpkeep: Readonly<Record<InfrastructureType, number>>;
  readonly infrastructureDamageRate: number;
  readonly infrastructureRepairRate: number;
}

export const defaultConfig: EngineConfig = {
  maxPopSize: 5000,
  productionRate: 1.05,
  expectationAdjustmentRate: 0.1,
  baseBirthRate: 0.01,
  baseDeathRate: 0.01,
  prosperityResponse: 1.4,
  prosperityCurvature: 1,
  deprivationResponse: 4,
  deprivationCurvature: 4,
  infrastructureUpkeep: { production: 100, extraction: 100 },
  infrastructureDamageRate: 0.1,
  infrastructureRepairRate: 0.05,
};
