# Cell

Cells are the units a faction acts through. Each cell is based in a region.

## API

Exported from `@stellar-resistance/engine`.

### `CellState`

A cell's plain data.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `regionId` | `string` | The id of the [region](region.md) the cell is based in |

### `createCell(fields: CellState): CellState`

Creates a cell's data.

### `class Cell`

Implements [`Stateful<CellState>`](../../architecture/engine/game.md). Constructed with `new Cell(state)`. Getters: `id` and `regionId`.
