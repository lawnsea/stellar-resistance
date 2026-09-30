# Engine config

`EngineConfig` holds the global values that shape the simulation: limits on entities and the rates that drive the economy. Engine functions that depend on these values take an optional `config` argument, which defaults to `defaultConfig`. The values will be tuned as the game develops.

## API

Exported from `@stellar-resistance/engine`.

### `EngineConfig`

| Field | Type | Description |
|---|---|---|
| `maxPopSize` | `number` | The largest allowed [pop](../../design/entities/pop.md) size |
| `productionRate` | `number` | Units of production per person per tick for a fully provided-for pop; see [regions](../../design/entities/region.md) |
| `expectationAdjustmentRate` | `number` | In (0.0, 1.0]; how far a [pop](../../design/entities/pop.md)'s expected standard of living moves toward its actual standard of living each tick |
| `baseBirthRate` | `number` | Births per person per tick at a standard of living of 1.0; see [`birthRate`](../../design/entities/pop.md) |
| `baseDeathRate` | `number` | Deaths per person per tick at a standard of living of 1.0; see [`deathRate`](../../design/entities/pop.md) |
| `prosperityResponse` | `number` | How strongly births rise and deaths fall above a standard of living of 1.0; the birth rate at 2.0 is the base × (1 + this) |
| `prosperityCurvature` | `number` | How front-loaded the prosperity response is: higher values put more of it just above 1.0 |
| `deprivationResponse` | `number` | How strongly deaths rise below 1.0; the death rate at 0.0 is the base × (1 + this) |
| `deprivationCurvature` | `number` | How front-loaded the deprivation response is: higher values put more of it just below 1.0 |

### `defaultConfig: EngineConfig`

| Field | Value | Why |
|---|---|---|
| `maxPopSize` | `5000` | Starting value |
| `productionRate` | `1.05` | A little above 1.0, so fully provided-for pops produce a small surplus |
| `expectationAdjustmentRate` | `0.1` | Starting value |
| `baseBirthRate` | `0.01` | Equal to the base death rate, so pops are stable at 1.0 |
| `baseDeathRate` | `0.01` | Starting value |
| `prosperityResponse` | `1.4` | Starting value; about +0.19% net growth per tick at the default production rate's 1.05 |
| `prosperityCurvature` | `1` | Starting value; makes the prosperity curve logarithmic in the standard of living |
| `deprivationResponse` | `4` | Starting value; a starving pop loses 5% per tick |
| `deprivationCurvature` | `4` | Starting value |
