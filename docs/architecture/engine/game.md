# Game

`Game` holds the engine's whole game state: its factions and its planets. The game and its entity classes hold their children as instances and their own data as plain, immutable objects: ticking replaces those objects rather than changing them, and `getState()` assembles the whole tree as plain data, so it can be saved or sent between web workers. Each level ticks itself: the game ticks its planets, and each planet ticks its regions. Each level ticks its children exactly once per tick of its own, so every tick's effects are applied in order across the whole game. See [tick](tick.md) for the sequence of a tick.

## API

Exported from `@stellar-resistance/engine`.

### `Stateful<S>`

Implemented by classes that keep their data as a plain object of type `S`.

| Method | Description |
|---|---|
| `getState(): S` | The object's plain data, including its children's, which it gets by calling `getState()` on each child |
| `setState(state: S): void` | Replaces the object's data and rebuilds its children from it |

### `Tickable`

Implemented by classes that advance with the simulation.

| Method | Description |
|---|---|
| `tick(n = 1): void` | Advances the object n ticks in place, replacing its state objects rather than mutating them |

### `GameState`

The game's plain data.

| Field | Type | Description |
|---|---|---|
| `factions` | `readonly FactionState[]` | The [factions](../../design/entities/faction.md) other than the planets' planetary factions, which their planets own |
| `planets` | `readonly PlanetState[]` | The [planets](../../design/entities/planet.md) |

### `class Game`

Implements `Stateful<GameState>` and `Tickable`. Constructed with `new Game(state, config?)`; `config` defaults to [`defaultConfig`](engine-config.md). When created, the game links each of its factions to the [cells](../../design/entities/cell.md) that name it; a cell naming a faction that isn't in the game, or its planet's planetary faction, is an error, as is [infrastructure](../../design/entities/infrastructure.md) controlled by such a faction. Each [planet](../../design/entities/planet.md) links its own planetary faction to its regional cells. Getters: `factions` and `planets`, which return [`Faction`](../../design/entities/faction.md) and [`Planet`](../../design/entities/planet.md) instances. `tick(n = 1)` advances the game n ticks, ticking each planet once per tick.

### `createTestGame(): Game`

Returns a new game of the [test planets](../../design/entities/planet.md) with no factions, for development and testing.
