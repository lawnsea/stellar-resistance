# Region

Regions are part of a planet and contain one or more pops. Regions don't have a name. Each has a type, which is rural or urban for now.

## API

Exported from `@stellar-resistance/engine`.

### `Region`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `type` | `RegionType` | The kind of region |
| `pops` | `readonly Pop[]` | The region's [pops](pop.md); always at least one |

### `RegionType`

`"rural" | "urban"`

### `createRegion(fields: Region): Region`

Creates a region with a copy of the given pops. Throws if `pops` is empty.
