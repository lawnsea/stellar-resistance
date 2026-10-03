# Pop

Pops are groups of people who live in a region. Each pop has a size between 1 and a globally configurable maximum, which starts at 5000. Each person needs one unit of production per tick. A pop's actual standard of living is the share of that requirement it received this tick; 1.0 means the requirement was exactly met. Its expected standard of living is at least 0.0, and each tick it moves toward the actual standard of living, dampened by a configurable rate, so a pop that starves for long enough comes to expect starvation.

Each tick (see the [tick phases](../../architecture/engine/tick.md)), a pop gains births (birth rate × size) and loses deaths (death rate × size). Both rates follow the actual standard of living the pop received this tick. At 1.0, each equals its base rate. Above 1.0, births rise and deaths fall; below 1.0, births fall and deaths rise. Each change has diminishing returns. The engine tracks size internally as a float, so fractional births and deaths accumulate across ticks; `size` is always the integer part. After every pop in a region has ticked, a pop whose internal size is above the maximum is replaced by two new pops, each with half its internal size (5000.7 becomes 2500.35 and 2500.35), and a pop whose internal size is below 1 dies out and is removed. A region whose last pop dies out becomes unpopulated.

## API

Exported from `@stellar-resistance/engine`.

### `PopState`

A pop's plain data.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `size` | `number` | Number of people; an integer from 1 to [`maxPopSize`](../../architecture/engine/engine-config.md), rounded down from the engine's internal size |
| `actualStandardOfLiving` | `number` | Share of production received this tick ÷ size; at least 0.0 |
| `expectedStandardOfLiving` | `number` | At least 0.0 |

### `createPop(fields: PopFields, config?: EngineConfig): PopState`

Creates a pop's data. `PopFields` is `PopState` with `actualStandardOfLiving` optional; it defaults to 1.0. Throws if `size` isn't an integer from 1 to `config.maxPopSize`, if `actualStandardOfLiving` is below 0.0, or if `expectedStandardOfLiving` is below 0.0. `config` defaults to [`defaultConfig`](../../architecture/engine/engine-config.md).

### `class Pop`

Implements [`Stateful<PopState>` and `Tickable`](../../architecture/engine/game.md). Constructed with `new Pop(state, config?)`. Getters: `id`, `size`, `actualStandardOfLiving`, and `expectedStandardOfLiving`. `receive(share)` gives the pop its share of the region's production, in units. `tick(n = 1)` advances the pop n ticks: each tick sets its actual standard of living to share ÷ size, applies births and deaths at the rates for that standard of living, and moves its expected standard of living toward it. Its [region](region.md) gives each pop its share before ticking it; a pop ticked more than once uses the same share each tick.

### `nextExpectedStandardOfLiving(expected: number, actual: number, config?: EngineConfig): number`

Returns `expected + (actual − expected) × expectationAdjustmentRate`.

### `birthRate(standardOfLiving: number, config?: EngineConfig): number`

Births per person per tick. Both rate formulas use a shared curve, D(x, k) = ln(1 + k·x) / ln(1 + k), which rises with diminishing returns from 0 at x = 0 to 1 at x = 1. With s the standard of living, b [`baseBirthRate`](../../architecture/engine/engine-config.md), and the prosperity and deprivation responses (r) and curvatures (k) from the config:

- s ≥ 1: b × (1 + r_prosperity × D(s − 1, k_prosperity))
- s < 1: b × (1 − D(1 − s, k_deprivation)), which is 0 at s = 0

### `deathRate(standardOfLiving: number, config?: EngineConfig): number`

Deaths per person per tick, with d [`baseDeathRate`](../../architecture/engine/engine-config.md):

- s ≤ 1: d × (1 + r_deprivation × D(1 − s, k_deprivation)), which is d × (1 + r_deprivation) at s = 0
- s > 1: d / (1 + r_prosperity × D(s − 1, k_prosperity)), which approaches but never reaches 0
