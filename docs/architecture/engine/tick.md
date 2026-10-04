# Tick

A tick advances the simulation one step. Ticks proceed down the hierarchy: the [game](game.md) ticks each planet once, and each planet ticks each of its regions once, so every tick's effects are applied in order across the whole game. Each region runs the phases below in order, and its pops tick during phase 3.

Production is made at the end of one tick and consumed during the next: each tick, cells feed their pops from the income they received the tick before, then the pops produce for the tick after.

## Region phases

| # | Phase | Reads | Writes |
|---|---|---|---|
| 1 | Distribution | Each cell's income from the previous tick; each cell's pop sizes; each faction's built infrastructure's upkeep budgets | Each [cell](../../design/entities/cell.md) reserves enough of its income for its pops to have a standard of living of 1.0; each faction's cells pool the rest to pay its built [infrastructure](../../design/entities/infrastructure.md)'s upkeep, every budget cut by the same share if there isn't enough. The remainder returns to each cell in proportion to what it put in; each cell saves `savingsRate` of its return in its stockpile, and its pops receive its reserve plus the rest of its return, divided by size |
| 2 | Operations | Each cell's stockpile; its [operations](../../design/entities/operation.md)' per-tick costs and progress | Each cell pays its operations' per-tick costs from its stockpile (every cost cut by the same share if it's short), and each operation's progress advances by the share paid. Finished operations are removed, and a finished build operation's infrastructure is built |
| 3 | Pop ticks | Each pop's share, size, and expected standard of living | Each [pop](../../design/entities/pop.md)'s actual standard of living (share ÷ size), then its size (births and deaths at the rates for that standard of living), then its expected standard of living (moved toward the new actual) |
| 4 | Splitting and removal | Pop sizes after births and deaths | In each [cell](../../design/entities/cell.md), pops over the maximum split into two halves that stay in the cell; pops below 1 are removed |
| 5 | Infrastructure | Each cell's faction and whether it has pops, after phase 4; each piece of infrastructure's controller, upkeep, and condition | Infrastructure whose controller has no cell with pops in the region passes to the planetary faction, cancelling any operation building it; then each built piece offered upkeep this tick has its condition moved toward the share of its requirement it received by a fraction of the gap, and pieces whose condition falls below the destruction threshold are destroyed and removed (see [infrastructure](../../design/entities/infrastructure.md)) |
| 6 | Production | Pop sizes and actual standards of living after phases 3 and 4; infrastructure after phase 5; the production cap | Staff are drawn from each faction's pops for its built infrastructure; working pops produce, capped at the production cap, then multiplied by production infrastructure (see [region economy](../../design/entities/region.md)) |
| 7 | Extraction | The production from phase 6; extraction infrastructure and its staffing | Each cell's income for the next tick: extraction infrastructure's share goes to its faction's cells by size, and the regional cell gets the rest |

A newly created region has no previous tick, so its starting production is computed from its pops as if it had already ticked.
