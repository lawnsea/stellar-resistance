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
| `prosperityResponse` | `number` | How strongly births rise and deaths fall above a standard of living of 1.0 |
| `deprivationCurvature` | `number` | How sharply births fall and deaths rise just below 1.0, versus near 0.0 |
| `starvationDeathMultiplier` | `number` | Death rate at a standard of living of 0.0, as a multiple of the base rate above it |

### `defaultConfig: EngineConfig`

| Field | Value | Why |
|---|---|---|
| `maxPopSize` | `5000` | Starting value |
| `productionRate` | `1.05` | A little above 1.0, so fully provided-for pops produce a small surplus |
| `expectationAdjustmentRate` | `0.1` | Starting value |
| `baseBirthRate` | `0.01` | Equal to the base death rate, so pops are stable at 1.0 |
| `baseDeathRate` | `0.01` | Starting value |
| `prosperityResponse` | `2` | Starting value; about +0.19% net growth per tick at the default production rate's 1.05 |
| `deprivationCurvature` | `4` | Starting value |
| `starvationDeathMultiplier` | `4` | Starting value; a starving pop loses 5% per tick |
