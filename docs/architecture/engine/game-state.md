# Game state

`GameState` holds the engine's whole game state: its factions and its planets. Game state classes keep their data as plain objects, so it can be saved or sent between web workers, and each level ticks itself: the game state ticks its planets, and each planet ticks its regions.

## API

Exported from `@stellar-resistance/engine`.

### `Stateful<S>`

Implemented by classes that keep their data as a plain object of type `S`.

| Method | Description |
|---|---|
| `getState(): S` | The object's plain data |
| `setState(state: S): void` | Replaces the object's data |

### `Tickable<T>`

Implemented by classes that advance with the simulation.

| Method | Description |
|---|---|
| `tick(n = 1): T` | Returns a new object advanced n ticks, leaving the original unchanged |

### `GameStateData`

| Field | Type | Description |
|---|---|---|
| `factions` | `readonly Faction[]` | The [factions](../../design/entities/faction.md) |
| `planets` | `readonly PlanetState[]` | The [planets](../../design/entities/planet.md) |

### `class GameState`

Implements `Stateful<GameStateData>` and `Tickable<GameState>`. Constructed with `new GameState(state, config?)`, which copies the factions and planets arrays; `config` defaults to [`defaultConfig`](engine-config.md). Getters: `factions`, and `planets`, which returns [`Planet`](../../design/entities/planet.md) instances. `tick(n = 1)` returns a new game state with the same factions and each planet ticked n times.

### `testGameState: GameState`

The [test planets](../../design/entities/planet.md) with no factions, for development and testing.
