# Tick

A tick advances the simulation one step. Ticks proceed down the hierarchy: the [game](game.md) ticks each planet once, and each planet ticks each of its regions once, so every tick's effects are applied in order across the whole game. Each region runs the phases below in order, and its pops tick during phase 2. After every planet has ticked, the game updates [cell](../../design/entities/cell.md) membership for pops that split or died out, and adds pops without a cell to their region's planetary cell.

Production is made at the end of one tick and consumed during the next: each tick, pops live on what their region produced the tick before, then produce for the tick after.

## Region phases

| # | Phase | Reads | Writes |
|---|---|---|---|
| 1 | Distribution | The region's production from the previous tick; pop sizes | Each pop's share: production × the pop's size ÷ the region's total population |
| 2 | Pop ticks | Each pop's share, size, and expected standard of living | Each [pop](../../design/entities/pop.md)'s actual standard of living (share ÷ size), then its size (births and deaths at the rates for that standard of living), then its expected standard of living (moved toward the new actual) |
| 3 | Splitting and removal | Pop sizes after births and deaths | Pops over the maximum split into two; pops below 1 are removed |
| 4 | Production | Pop sizes and actual standards of living after phases 2 and 3; the production cap | The region's production for the next tick (see [region economy](../../design/entities/region.md)) |

A newly created region has no previous tick, so its starting production is computed from its pops as if it had already ticked.
