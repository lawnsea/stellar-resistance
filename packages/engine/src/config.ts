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
  readonly infrastructureStaff: Readonly<Record<InfrastructureType, number>>;
  readonly infrastructureImpact: Readonly<Record<InfrastructureType, number>>;
  readonly neglectEfficiency: number;
  readonly repairEfficiency: number;
  readonly destructionThreshold: number;
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
  infrastructureStaff: { production: 100, extraction: 100 },
  infrastructureImpact: { production: 0.25, extraction: 0.1 },
  neglectEfficiency: 0.1,
  repairEfficiency: 0.05,
  destructionThreshold: 0.05,
};
