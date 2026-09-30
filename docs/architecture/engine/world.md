# World

The world is the engine's whole game state: its factions and its planets. The simulation advances by ticking the world.

## API

Exported from `@stellar-resistance/engine`.

### `World`

| Field | Type | Description |
|---|---|---|
| `factions` | `readonly Faction[]` | The world's [factions](../../design/entities/faction.md) |
| `planets` | `readonly Planet[]` | The world's [planets](../../design/entities/planet.md) |

### `createWorld(fields: World): World`

Creates a world with copies of the given factions and planets.

### `tick(world: World, config?: EngineConfig): TickResult`

Advances the simulation one tick. Returns `{ world, report }`: the next world, and each region's [economy](../../design/entities/region.md) for the tick, keyed by region id. It doesn't change its input. `config` defaults to [`defaultConfig`](engine-config.md).

### `testWorld: World`

The [test planets](../../design/entities/planet.md) with no factions, for development and testing.
