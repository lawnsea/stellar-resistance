import { defaultConfig, type EngineConfig } from "./config";

// 0 at a standard of living of 1.0, rising with diminishing returns to 1 at
// 0.0.
function deprivation(standardOfLiving: number, config: EngineConfig): number {
  const c = config.deprivationCurvature;
  return Math.log1p(c * (1 - standardOfLiving)) / Math.log1p(c);
}

// 0 at a standard of living of 1.0, rising logarithmically above it.
function prosperity(standardOfLiving: number, config: EngineConfig): number {
  return config.prosperityResponse * Math.log(standardOfLiving);
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
    (1 +
      config.starvationDeathMultiplier * deprivation(standardOfLiving, config))
  );
}
