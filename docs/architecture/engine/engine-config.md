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

### `defaultConfig: EngineConfig`

| Field | Value | Why |
|---|---|---|
| `maxPopSize` | `5000` | Starting value |
| `productionRate` | `1.05` | A little above 1.0, so fully provided-for pops produce a small surplus |
| `expectationAdjustmentRate` | `0.1` | Starting value |
