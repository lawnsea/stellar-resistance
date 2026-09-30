# Region

Regions are part of a planet and contain zero or more pops; a region with no pops is unpopulated. Regions don't have a name. Each has a type, which is rural or urban for now.

Each tick, a region's pops produce resources in units of production, where one unit meets one person's consumption requirement for a tick. Each pop produces its size × the production rate × its actual standard of living from the previous tick, capped at 1.0, so underfed pops produce less. The region's production is split among its pops by size, which sets their new actual standard of living.

## API

Exported from `@stellar-resistance/engine`.

### `Region`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `type` | `RegionType` | The kind of region |
| `pops` | `readonly Pop[]` | The region's [pops](pop.md); empty if unpopulated |

### `RegionType`

`"rural" | "urban"`

### `createRegion(fields: Region): Region`

Creates a region with a copy of the given pops.

## Economy API

### `RegionEconomy`

Amounts are in units of production.

| Field | Type | Description |
|---|---|---|
| `production` | `number` | Σ (pop size × [`productionRate`](../../architecture/engine/engine-config.md) × min(1, `actualStandardOfLiving`)) |
| `consumption` | `number` | Total pop size |
| `surplus` | `number` | `production` − `consumption`; negative for a deficit |

### `computeRegionEconomy(region: Region, config?: EngineConfig): RegionEconomy`

Computes one tick of a region's economy. `config` defaults to [`defaultConfig`](../../architecture/engine/engine-config.md).

### `tick(planets: readonly Planet[], config?: EngineConfig): TickResult`

Advances the simulation one tick. Returns `{ planets, report }`: the planets with each pop's actual and expected standard of living updated, and each region's economy keyed by region id. It doesn't change its input.
