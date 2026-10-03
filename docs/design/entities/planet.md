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
| `planetaryFaction` | `FactionState` | The planet's [planetary faction](faction.md) |
| `regions` | `readonly RegionState[]` | The planet's [regions](region.md); always at least one |

### `createPlanet(fields: PlanetFields): PlanetState`

Creates a planet's data with a copy of the given regions. `PlanetFields` is `PlanetState` without `planetaryFaction`: every planet gets one, so it's created here, named after the planet (id `<planet>-faction`), and set as the faction of each region's regional cell. Throws if `regions` is empty.

### `class Planet`

Implements [`Stateful<PlanetState>` and `Tickable`](../../architecture/engine/game.md). Constructed with `new Planet(state, config?)`. Getters: `id`, `name`, `planetaryFaction` (a [`Faction`](faction.md) linked to its regions' regional cells), and `regions`, which returns [`Region`](region.md) instances. `tick(n = 1)` advances the planet n ticks, ticking each region once per tick.

### `testPlanets: readonly PlanetState[]`

A small, hand-written set of planets for development and testing, until planets are generated programmatically.
