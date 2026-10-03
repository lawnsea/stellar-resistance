# Infrastructure

Infrastructure is built in a region and controlled by a faction. Each piece has a type, which is production or extraction for now. A faction keeps control only while it has a presence in the region, meaning a cell there with at least one pop; when it loses its presence, control reverts to the region's planetary faction.

## API

Exported from `@stellar-resistance/engine`.

### `InfrastructureState`

A piece of infrastructure's plain data.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `type` | `InfrastructureType` | The kind of infrastructure |
| `controller` | `string` | The id of the [faction](faction.md) that controls it |

### `InfrastructureType`

`"production" | "extraction"`

### `createInfrastructure(fields: InfrastructureState): InfrastructureState`

Creates a piece of infrastructure's data.

### `class Infrastructure`

Implements [`Stateful<InfrastructureState>`](../../architecture/engine/game.md). Constructed with `new Infrastructure(state)`. Getters: `id`, `type`, and `controllerId`. Its [region](region.md) holds it and reverts its control when needed.
