# Cell

Cells are the units a faction acts through. Each cell belongs to one faction, is based in one region, and holds its member pops; each pop belongs to exactly one cell. Every region has a regional cell, which belongs to its planet's planetary faction and holds every pop in the region that isn't in another cell. Each cell has an income, in units of production, that it receives each tick: the regional cell gets the region's production minus what's extracted, and other cells get what their faction's extraction [infrastructure](infrastructure.md) takes, split among the faction's cells in the region by size. Each cell reserves enough of its income for its pops to have a standard of living of 1.0; a faction's cells in a region pool the rest to pay its infrastructure upkeep there, and what's left returns to each cell in proportion to what it put in. Each cell saves [`savingsRate`](../../architecture/engine/engine-config.md) of its return in its stockpile, and its pops receive its reserve plus the rest of its return, divided by size (see the [tick phases](../../architecture/engine/tick.md)). A cell spends its stockpile on [operations](operation.md), the work it's doing, such as building infrastructure.

## API

Exported from `@stellar-resistance/engine`.

### `CellState`

A cell's plain data.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `faction` | `string` | The id of the [faction](faction.md) the cell belongs to |
| `region` | `string` | The id of the [region](region.md) the cell is based in |
| `income` | `number` | Units of production the cell receives next tick; at least 0.0 |
| `stockpile` | `number` | Units of production the cell has saved |
| `pops` | `readonly PopState[]` | The cell's member [pops](pop.md) |
| `operations` | `readonly OperationState[]` | The cell's running [operations](operation.md) |
| `nextOperationNumber` | `number` | The number in the id of the cell's next operation (`<cell>-op-<n>`) |

### `createCell(fields: CellFields): CellState`

Creates a cell's data with a copy of the given pops. `CellFields` is `CellState` with `income`, `stockpile`, `pops`, `operations`, and `nextOperationNumber` optional; they default to 0.0, 0.0, none, none, and 1.

### `class Cell`

Implements [`Stateful<CellState>`](../../architecture/engine/game.md). Constructed with `new Cell(state, config?, region?)`. Getters: `id`, `factionId`, `regionId`, `faction` (the [`Faction`](faction.md) it's linked to), `region` (the [`Region`](region.md) holding it), `income`, `stockpile`, `pops` (its member [`Pop`](pop.md) instances, each of which refers back to the cell), and `operations` (its [`Operation`](operation.md) instances, each of which refers back to the cell). `build(type)` starts a build operation for new, unbuilt [infrastructure](infrastructure.md) of that type in the cell's region, controlled by the cell's faction, and returns the operation; it throws if the cell isn't in a region, if it's the regional cell and the type is extraction, or if the cell can't afford the initial cost. `startOperation(type, target, costs)` starts an operation, paying its initial cost from the stockpile (or throwing if it can't); `save(amount)` adds to the stockpile; `runOperations()` pays and advances its operations and returns the ones that finish; `cancelOperations(target)` removes the operations on a target. When a member pop splits, its halves stay in the cell; when it dies out, it leaves the cell.
