import { defaultConfig, type EngineConfig } from "./config";

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
