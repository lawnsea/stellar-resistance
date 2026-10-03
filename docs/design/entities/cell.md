# Cell

Cells are the units a faction acts through. Each cell belongs to one faction, is based in one region, and holds its member pops; each pop belongs to exactly one cell. Every region has a regional cell, which belongs to its planet's planetary faction and holds every pop in the region that isn't in another cell.

## API

Exported from `@stellar-resistance/engine`.

### `CellState`

A cell's plain data.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `faction` | `string` | The id of the [faction](faction.md) the cell belongs to |
| `region` | `string` | The id of the [region](region.md) the cell is based in |
| `pops` | `readonly PopState[]` | The cell's member [pops](pop.md) |

### `createCell(fields: CellFields): CellState`

Creates a cell's data with a copy of the given pops. `CellFields` is `CellState` with `pops` optional; it defaults to none.

### `class Cell`

Implements [`Stateful<CellState>`](../../architecture/engine/game.md). Constructed with `new Cell(state, config?, region?)`. Getters: `id`, `factionId`, `regionId`, `faction` (the [`Faction`](faction.md) it's linked to), `region` (the [`Region`](region.md) holding it), and `pops`, its member [`Pop`](pop.md) instances, each of which refers back to the cell. When a member pop splits, its halves stay in the cell; when it dies out, it leaves the cell.
