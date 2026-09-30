# Region

Regions are part of a planet and contain zero or more pops; a region with no pops is unpopulated. Regions don't have a name. Each has a type, which is rural or urban for now, and a productivity factor, greater than 0.0 and at most 1.0.

Each tick, a region produces resources in proportion to the total size of its pops, multiplied by its productivity. Its pops consume resources in proportion to their size and expected standard of living. The difference is the region's surplus.

## API

Exported from `@stellar-resistance/engine`.

### `Region`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `type` | `RegionType` | The kind of region |
| `productivity` | `number` | In (0.0, 1.0]; scales the region's production |
| `pops` | `readonly Pop[]` | The region's [pops](pop.md); empty if unpopulated |

### `RegionType`

`"rural" | "urban"`

### `createRegion(fields: Region): Region`

Creates a region with a copy of the given pops. Throws if `productivity` isn't in (0.0, 1.0].

## Economy API

### `RegionEconomy`

| Field | Type | Description |
|---|---|---|
| `production` | `number` | total pop size × `productivity` × [`productionRate`](../engine-config.md) |
| `consumption` | `number` | Σ (pop size × `expectedStandardOfLiving`) × [`consumptionRate`](../engine-config.md) |
| `surplus` | `number` | `production` − `consumption` |

### `computeRegionEconomy(region: Region, config?: EngineConfig): RegionEconomy`

Computes one tick of a region's economy. `config` defaults to [`defaultConfig`](../engine-config.md).

### `tick(planets: readonly Planet[], config?: EngineConfig): TickReport`

Advances the simulation one tick and reports each region's economy, keyed by region id. It doesn't change the planets.
