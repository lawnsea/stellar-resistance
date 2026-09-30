# State

`State` holds the engine's whole game state: its factions and its planets. The simulation advances by ticking the state.

## API

Exported from `@stellar-resistance/engine`.

### `State`

| Field | Type | Description |
|---|---|---|
| `factions` | `readonly Faction[]` | The [factions](../../design/entities/faction.md) |
| `planets` | `readonly Planet[]` | The [planets](../../design/entities/planet.md) |

### `createState(fields: State): State`

Creates a state with copies of the given factions and planets.

### `tick(state: State, config?: EngineConfig): TickResult`

Advances the simulation one tick. Returns `{ state, report }`: the next state, and each region's [economy](../../design/entities/region.md) for the tick, keyed by region id. It doesn't change its input. `config` defaults to [`defaultConfig`](engine-config.md).

### `testState: State`

The [test planets](../../design/entities/planet.md) with no factions, for development and testing.
