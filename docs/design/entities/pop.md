# Pop

Pops are groups of people who live in a region. Each pop has a size between 1 and a globally configurable maximum, which starts at 5000. Each pop also has an expected standard of living, greater than 0.0 and at most 1.0, which sets how much it consumes.

## API

Exported from `@stellar-resistance/engine`.

### `Pop`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `size` | `number` | Number of people; an integer from 1 to [`maxPopSize`](../engine-config.md) |
| `expectedStandardOfLiving` | `number` | In (0.0, 1.0]; scales the pop's consumption |

### `createPop(fields: Pop, config?: EngineConfig): Pop`

Creates a pop. Throws if `size` isn't an integer from 1 to `config.maxPopSize`, or if `expectedStandardOfLiving` isn't in (0.0, 1.0]. `config` defaults to [`defaultConfig`](../engine-config.md).
