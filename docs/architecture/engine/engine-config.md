# Engine config

`EngineConfig` holds the global values that shape the simulation: limits on entities and the rates that drive the economy. Engine functions that depend on these values take an optional `config` argument, which defaults to `defaultConfig`. The values will be tuned as the game develops.

## API

Exported from `@stellar-resistance/engine`.

### `EngineConfig`

| Field | Type | Description |
|---|---|---|
| `maxPopSize` | `number` | The largest allowed [pop](../../design/entities/pop.md) size |
| `productionRate` | `number` | Resources a [region](../../design/entities/region.md) produces per person at productivity 1.0 |
| `consumptionRate` | `number` | Resources a [pop](../../design/entities/pop.md) consumes per person at expected standard of living 1.0 |

### `defaultConfig: EngineConfig`

| Field | Value | Why |
|---|---|---|
| `maxPopSize` | `5000` | Starting value |
| `productionRate` | `1.0` | Starting value |
| `consumptionRate` | `0.9` | A little below `productionRate`, so regions run a surplus |
