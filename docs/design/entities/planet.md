# Planet

Planets are where the people live and where the resistance fights. A planet consists of one or more regions where the planet's pops live and work.

## API

Exported from `@stellar-resistance/engine`.

### `PlanetState`

A planet's plain data.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `name` | `string` | Display name |
| `regions` | `readonly RegionState[]` | The planet's [regions](region.md); always at least one |

### `createPlanet(fields: PlanetState): PlanetState`

Creates a planet's data with a copy of the given regions. Throws if `regions` is empty.

### `class Planet`

Implements [`Stateful<PlanetState>` and `Tickable<Planet>`](../../architecture/engine/game-state.md). Constructed with `new Planet(state, config?)`. Getters: `id`, `name`, and `regions`, which returns [`Region`](region.md) instances. `tick(n = 1)` returns a new planet whose regions have each ticked n times.

### `testPlanets: readonly PlanetState[]`

A small, hand-written set of planets for development and testing, until planets are generated programmatically.
