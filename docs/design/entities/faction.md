# Faction

Factions are organized groups that act in the game world. A faction acts through its cells.

## API

Exported from `@stellar-resistance/engine`.

### `FactionState`

A faction's plain data.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `name` | `string` | Display name |
| `cells` | `readonly CellState[]` | The faction's [cells](cell.md) |

### `createFaction(fields: FactionFields): FactionState`

Creates a faction's data with a copy of the given cells. `FactionFields` is `FactionState` with `cells` optional; it defaults to none.

### `class Faction`

Implements [`Stateful<FactionState>`](../../architecture/engine/game.md). Constructed with `new Faction(state)`. Getters: `id`, `name`, and `cells`, which returns [`Cell`](cell.md) instances.
