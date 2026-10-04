# Tick

A tick advances the simulation one step. Ticks proceed down the hierarchy: the [game](game.md) ticks each planet once, and each planet ticks each of its regions once, so every tick's effects are applied in order across the whole game. Each region runs the phases below in order, and its pops tick during phase 2.

Production is made at the end of one tick and consumed during the next: each tick, cells feed their pops from the income they received the tick before, then the pops produce for the tick after.

## Region phases

| # | Phase | Reads | Writes |
|---|---|---|---|
| 1 | Distribution | Each cell's income from the previous tick; each cell's pop sizes; each faction's infrastructure upkeep and construction budgets | Each [cell](../../design/entities/cell.md) reserves enough of its income for its pops to have a standard of living of 1.0; each faction's cells pool the rest to pay its built [infrastructure](../../design/entities/infrastructure.md)'s upkeep, then its projects' construction, each budget cut by the same share if there isn't enough. The remainder returns to each cell in proportion to what it put in. Each cell's pops receive its reserve plus its return, divided by size |
| 2 | Pop ticks | Each pop's share, size, and expected standard of living | Each [pop](../../design/entities/pop.md)'s actual standard of living (share ÷ size), then its size (births and deaths at the rates for that standard of living), then its expected standard of living (moved toward the new actual) |
| 3 | Splitting and removal | Pop sizes after births and deaths | In each [cell](../../design/entities/cell.md), pops over the maximum split into two halves that stay in the cell; pops below 1 are removed |
| 4 | Infrastructure | Each cell's faction and whether it has pops, after phase 3; each piece of infrastructure's controller, payment, and condition or progress | Infrastructure whose controller has no cell with pops in the region passes to the planetary faction; then each project's progress grows by its payment ÷ its cost, each built piece's condition moves toward the share of its requirement it received by a fraction of the gap, and pieces whose condition falls below the destruction threshold are destroyed and removed (see [infrastructure](../../design/entities/infrastructure.md)) |
| 5 | Production | Pop sizes and actual standards of living after phases 2 and 3; infrastructure after phase 4; the production cap | Staff are drawn from each faction's pops for its built infrastructure; working pops produce, capped at the production cap, then multiplied by production infrastructure (see [region economy](../../design/entities/region.md)) |
| 6 | Extraction | The production from phase 5; extraction infrastructure and its staffing | Each cell's income for the next tick: extraction infrastructure's share goes to its faction's cells by size, and the regional cell gets the rest |

A newly created region has no previous tick, so its starting production is computed from its pops as if it had already ticked.
