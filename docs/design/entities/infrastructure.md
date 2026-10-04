# Infrastructure

Infrastructure is built in a region and controlled by a faction. Each piece has a type, which is production or extraction for now. A faction keeps control only while it has a presence in the region, meaning a cell there with at least one pop; when it loses its presence, control reverts to the region's planetary faction.

Infrastructure needs upkeep, in units of production per tick, set per type. Each piece has an upkeep budget, which defaults to its type's requirement. Each tick, the controlling faction's [cells](cell.md) in the region pay the budgets from their income, after reserving enough for their pops' needs. A piece's condition runs from 0.0 to 1.0. Each tick, its condition moves toward the share of its requirement it received (upkeep ÷ requirement, which can exceed 1.0): down by [`neglectEfficiency`](../../architecture/engine/engine-config.md) × the gap when the share is lower, and up by [`repairEfficiency`](../../architecture/engine/engine-config.md) × the gap when it's higher, never above 1.0. So a piece paid half its upkeep tick after tick settles near 0.5. Below [`destructionThreshold`](../../architecture/engine/engine-config.md) it's destroyed and removed.

Infrastructure also needs staff, a number of people set per type. Staff come from the pops in the controlling faction's cells in the region, drawn in proportion to size; if the faction has fewer people than all its infrastructure needs, every piece is staffed at the same share. Staff still consume but don't produce. Each piece's impact is scaled by the share staffed × its condition:

- **Production** infrastructure adds its [impact](../../architecture/engine/engine-config.md) to a multiple of the region's production: after the production cap is applied, production is multiplied by 1 plus the sum of every production piece's scaled impact.
- **Extraction** infrastructure takes its scaled impact as a fraction of the region's production for its faction's cells. A faction's pieces add together; if all factions' fractions add up to more than 1.0, the production is shared in proportion. The planetary faction doesn't build extraction infrastructure, so extraction it controls draws no staff and extracts nothing; the regional cell receives everything that isn't extracted.

## Construction

A [cell](cell.md) builds infrastructure in its region with a build [operation](operation.md), and its faction controls the new piece; the regional cell can't build extraction infrastructure. The piece exists from the start but isn't built until the operation finishes. Until then it draws no staff, needs no upkeep, has no impact, and its condition doesn't change. Control of an unbuilt piece reverts to the planetary faction like control of built infrastructure, which cancels its operation and leaves it unbuilt.

## API

Exported from `@stellar-resistance/engine`.

### `InfrastructureState`

A piece of infrastructure's plain data.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `type` | `InfrastructureType` | The kind of infrastructure |
| `controller` | `string` | The id of the [faction](faction.md) that controls it |
| `condition` | `number` | In (0.0, 1.0]; 1.0 is intact |
| `upkeepBudget` | `number` | Units of production it's paid per tick when available; at least 0.0 |
| `built` | `boolean` | Whether it's finished; false while its build operation runs |

### `InfrastructureType`

`"production" | "extraction"`

### `createInfrastructure(fields: InfrastructureFields, config?: EngineConfig): InfrastructureState`

Creates a piece of infrastructure's data. `InfrastructureFields` is `InfrastructureState` with `condition`, `upkeepBudget`, and `built` optional; they default to 1.0, the type's [`infrastructureUpkeep`](../../architecture/engine/engine-config.md), and true. Throws if `condition` isn't in (0.0, 1.0] or `upkeepBudget` is below 0.0.

### `class Infrastructure`

Implements [`Stateful<InfrastructureState>` and `Tickable`](../../architecture/engine/game.md). Constructed with `new Infrastructure(state, config?)`. Getters: `id`, `type`, `controllerId`, `condition`, `upkeepBudget`, `upkeepRequirement` (its type's upkeep), `staffRequirement` (its type's staff), `built`, and `destroyed`. `receive(upkeep)` offers it this tick's upkeep; `tick(n = 1)` damages or repairs it by that upkeep. Infrastructure that's unbuilt, or that wasn't offered upkeep this tick because it was built after distribution, keeps its condition. Its [region](region.md) holds it and reverts its control when needed.
