# Pop

Pops are groups of people who live in a region. Each pop has a size between 1 and a globally configurable maximum, which starts at 5000. Each person needs one unit of production per tick. A pop's actual standard of living is the share of that requirement it received last tick; 1.0 means the requirement was exactly met. Its expected standard of living is always at least 1.0, and each tick it moves toward the actual standard of living, dampened by a configurable rate.

## API

Exported from `@stellar-resistance/engine`.

### `Pop`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `size` | `number` | Number of people; an integer from 1 to [`maxPopSize`](../../architecture/engine/engine-config.md) |
| `actualStandardOfLiving` | `number` | Share of production received last tick ÷ size; at least 0.0 |
| `expectedStandardOfLiving` | `number` | At least 1.0 |

### `createPop(fields: PopFields, config?: EngineConfig): Pop`

Creates a pop. `PopFields` is `Pop` with `actualStandardOfLiving` optional; it defaults to 1.0. Throws if `size` isn't an integer from 1 to `config.maxPopSize`, if `actualStandardOfLiving` is below 0.0, or if `expectedStandardOfLiving` is below 1.0. `config` defaults to [`defaultConfig`](../../architecture/engine/engine-config.md).

### `nextExpectedStandardOfLiving(expected: number, actual: number, config?: EngineConfig): number`

Returns `max(1, expected + (actual − expected) × expectationAdjustmentRate)`.
