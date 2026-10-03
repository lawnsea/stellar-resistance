# Tick

A tick advances the simulation one step. Ticks proceed down the hierarchy: the [game](game.md) ticks each planet once, and each planet ticks each of its regions once, so every tick's effects are applied in order across the whole game. Each region runs the phases below in order, and its pops tick during phase 2.

Production is made at the end of one tick and consumed during the next: each tick, pops live on what their region produced the tick before, then produce for the tick after.

## Region phases

| # | Phase | Reads | Writes |
|---|---|---|---|
| 1 | Distribution | The region's production from the previous tick; the regional cell's pop sizes; the upkeep budgets of the planetary faction's infrastructure | The regional cell reserves enough for its pops to have a standard of living of 1.0, pays its faction's [infrastructure](../../design/entities/infrastructure.md) upkeep from the rest (every budget cut by the same share if there isn't enough), and gives its pops the reserve plus anything left over, divided by size. Pops in other cells and other factions' infrastructure receive nothing |
| 2 | Pop ticks | Each pop's share, size, and expected standard of living | Each [pop](../../design/entities/pop.md)'s actual standard of living (share ÷ size), then its size (births and deaths at the rates for that standard of living), then its expected standard of living (moved toward the new actual) |
| 3 | Infrastructure ticks | Each piece of infrastructure's upkeep, requirement, and condition | Each piece's condition: damaged in proportion to a shortfall, repaired in proportion to an overage; pieces whose condition reaches 0.0 are destroyed and removed |
| 4 | Splitting and removal | Pop sizes after births and deaths | In each [cell](../../design/entities/cell.md), pops over the maximum split into two halves that stay in the cell; pops below 1 are removed |
| 5 | Infrastructure control | Each cell's faction and whether it has pops, after phase 4; each piece of infrastructure's controller | Infrastructure whose controller has no cell with pops in the region passes to the planetary faction (see [infrastructure](../../design/entities/infrastructure.md)) |
| 6 | Production | Pop sizes and actual standards of living after phases 2 and 4; the production cap | The region's production for the next tick (see [region economy](../../design/entities/region.md)) |

A newly created region has no previous tick, so its starting production is computed from its pops as if it had already ticked.
