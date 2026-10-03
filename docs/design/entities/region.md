# Region

Regions are part of a planet and contain zero or more pops; a region with no pops is unpopulated. Regions don't have a name. Each has a type, which is rural or urban for now.

A region's pops produce resources in units of production, where one unit meets one person's consumption requirement for a tick. Each tick, the region divides the production from its previous tick among its pops by size, and the pops live on that share. At the end of the tick, the pops produce for the next one: each produces its size × the production rate × its new actual standard of living, capped at 1.0, so underfed pops produce less. A region never produces more than its production cap, which represents its carrying capacity, however many pops work it.

## API

Exported from `@stellar-resistance/engine`.

### `RegionState`

A region's plain data.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `type` | `RegionType` | The kind of region |
| `productionCap` | `number` | Carrying capacity: the most units of production the region produces per tick; positive |
| `production` | `number` | Units produced last tick, to be divided among the pops next tick; at least 0.0 |
| `pops` | `readonly PopState[]` | The region's [pops](pop.md); empty if unpopulated |

### `RegionType`

`"rural" | "urban"`

### `createRegion(fields: RegionFields, config?: EngineConfig): RegionState`

Creates a region's data with a copy of the given pops. `RegionFields` is `RegionState` with `production` optional; when it's omitted, the region's production is computed from its pops as if it had already ticked: min(`productionCap`, Σ (pop size × [`productionRate`](../../architecture/engine/engine-config.md) × min(1, `actualStandardOfLiving`))). Throws if `productionCap` isn't a positive, finite number, or if `production` is below 0.0. `config` defaults to [`defaultConfig`](../../architecture/engine/engine-config.md).

### `class Region`

Implements [`Stateful<RegionState>` and `Tickable`](../../architecture/engine/game.md). Constructed with `new Region(state, config?)`. Getters: `id`, `type`, `productionCap`, `production`, and `pops`, which returns [`Pop`](pop.md) instances. `tick(n = 1)` advances the region n ticks, running the [tick phases](../../architecture/engine/tick.md) in order each tick.

## Economy API

### `RegionEconomy`

Amounts are in units of production.

| Field | Type | Description |
|---|---|---|
| `production` | `number` | The region's `production`: what it produced last tick |
| `consumption` | `number` | Total pop size |
| `surplus` | `number` | `production` − `consumption`; negative for a deficit |

### `computeRegionEconomy(region: RegionState): RegionEconomy`

Computes a region's economy on demand: last tick's production against what its pops need this tick.
