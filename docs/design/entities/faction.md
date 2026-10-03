# Faction

Factions are organized groups that act in the game world. A faction acts through its cells.

Each planet has a planetary faction, its local government, which owns the regional cell in each of the planet's regions.

## API

Exported from `@stellar-resistance/engine`.

### `FactionState`

A faction's plain data.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `name` | `string` | Display name |
| `cellIds` | `readonly string[]` | The ids of the faction's [cells](cell.md) |

### `createFaction(fields: FactionFields): FactionState`

Creates a faction's data with a copy of the given cell ids. `FactionFields` is `FactionState` with `cellIds` optional; it defaults to none.

### `class Faction`

Implements [`Stateful<FactionState>`](../../architecture/engine/game.md). Constructed with `new Faction(state)`. Getters: `id`, `name`, and `cells`, its linked [`Cell`](cell.md) instances. `addCell(cell)` links a cell to the faction both ways. A faction's cells live in their regions, so a [planet](planet.md) links its planetary faction to its regional cells, and the [game](../../architecture/engine/game.md) links other factions to their cells by each cell's `faction`. `getState()` lists the linked cells' ids.
