# Tick

A tick advances the simulation one step. Ticks proceed down the hierarchy: the [game](game.md) ticks each planet once, and each planet ticks each of its regions once, so every tick's effects are applied in order across the whole game. All of a tick's work happens in each region, which runs the phases below in order.

## Region phases

Each phase reads only values that are final by the time it runs. "Previous" means the value from the end of the last tick.

| # | Phase | Reads | Writes |
|---|---|---|---|
| 1 | Production | Pop sizes; each pop's previous actual standard of living; the production cap | The region's production and consumption for the tick (see [region economy](../../design/entities/region.md)) |
| 2 | Births and deaths | Pop sizes; each pop's previous actual standard of living | Pop sizes (see [births and deaths](../../design/entities/pop.md)) |
| 3 | Distribution | The region's production and consumption from phase 1 | Each pop's actual standard of living: production ÷ the start-of-tick population |
| 4 | Expectations | Each pop's expected standard of living and its new actual standard of living | Each pop's expected standard of living |
| 5 | Splitting and removal | Pop sizes after births and deaths | Pops over the maximum split into two; pops below 1 are removed |

Phases 1 and 2 both use the previous tick's standard of living, while phase 4 uses the new one. Distribution divides the tick's production among the population as it was at the start of the tick, before births and deaths.
