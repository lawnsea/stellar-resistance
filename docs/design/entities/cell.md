# Cell

Cells are the units a faction acts through. Each cell is based in a region and has pops as members; each pop belongs to one cell.

## API

Exported from `@stellar-resistance/engine`.

### `CellState`

A cell's plain data.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `regionId` | `string` | The id of the [region](region.md) the cell is based in |
| `popIds` | `readonly string[]` | The ids of the cell's member [pops](pop.md) |

### `createCell(fields: CellFields): CellState`

Creates a cell's data with a copy of the given member ids. `CellFields` is `CellState` with `popIds` optional; it defaults to none.

### `class Cell`

Implements [`Stateful<CellState>`](../../architecture/engine/game.md). Constructed with `new Cell(state)`. Getters: `id`, `regionId`, and `popIds`.
