# Region

Regions are part of a planet and contain zero or more pops, held in the region's [cells](cell.md); a region with no pops is unpopulated. Regions don't have a name. Each has a type, which is rural or urban for now.

A region's pops produce resources in units of production, where one unit meets one person's consumption requirement for a tick. Each tick, the region's regional cell receives the production from its previous tick: it reserves enough for its own pops to have a standard of living of 1.0, pays its faction's [infrastructure](infrastructure.md) upkeep from the rest, and gives its pops the reserve plus anything left over, divided by size (see the [tick phases](../../architecture/engine/tick.md)). Pops in other cells receive nothing for now. At the end of the tick, the pops produce for the next one: each produces its size × the production rate × its new actual standard of living, capped at 1.0, so underfed pops produce less. A region never produces more than its production cap, which represents its carrying capacity, however many pops work it.

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
| `regionalCell` | `CellState` | The region's [regional cell](cell.md), which belongs to its planet's planetary faction and holds every pop not in another cell |
| `cells` | `readonly CellState[]` | The region's other [cells](cell.md), such as resistance cells |
| `infrastructure` | `readonly InfrastructureState[]` | The region's [infrastructure](infrastructure.md) |

### `RegionType`

`"rural" | "urban"`

### `createRegion(fields: RegionFields, config?: EngineConfig): RegionState`

Creates a region's data. `RegionFields` takes `id`, `type`, `productionCap`, and optionally `production`, `pops`, `cells`, and `infrastructure`: the given pops go into a new regional cell (id `<region>-cell`), and the given cells are kept. When `production` is omitted, it's computed from all the region's pops as if the region had already ticked: min(`productionCap`, Σ (pop size × [`productionRate`](../../architecture/engine/engine-config.md) × min(1, `actualStandardOfLiving`))). Throws if `productionCap` isn't a positive, finite number, or if `production` is below 0.0. `config` defaults to [`defaultConfig`](../../architecture/engine/engine-config.md).

### `class Region`

Implements [`Stateful<RegionState>` and `Tickable`](../../architecture/engine/game.md). Constructed with `new Region(state, config?)`. Getters: `id`, `type`, `productionCap`, `production`, `regionalCell` and `cells` (its [`Cell`](cell.md) instances, each referring back to the region), `infrastructure` (its [`Infrastructure`](infrastructure.md) instances), and `pops`, all its cells' [`Pop`](pop.md) instances. A cell whose `region` doesn't name the region holding it is an error. `tick(n = 1)` advances the region n ticks, running the [tick phases](../../architecture/engine/tick.md) in order each tick.

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

### `regionPops(region: RegionState): PopState[]`

All the pops in a region's data, across its regional cell and other cells.
