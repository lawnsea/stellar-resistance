export interface EngineConfig {
  readonly maxPopSize: number;
}

export const defaultConfig: EngineConfig = {
  maxPopSize: 5000,
};
