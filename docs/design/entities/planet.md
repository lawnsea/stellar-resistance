# Planet

Planets are where the people live and where the resistance fights. A planet consists of one or more regions where the planet's pops live and work.

## API

Exported from `@stellar-resistance/engine`.

### `Planet`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `name` | `string` | Display name |
| `regions` | `readonly Region[]` | The planet's regions; always at least one |

### `Region`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `name` | `string` | Display name |

### `createPlanet(fields: Planet): Planet`

Creates a planet with a copy of the given regions. Throws if `regions` is empty.

### `createRegion(fields: Region): Region`

Creates a region.

### `testPlanets: readonly Planet[]`

A small, hand-written set of planets for development and testing, until planets are generated programmatically.
