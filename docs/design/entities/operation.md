# Operation

An operation is work a [cell](cell.md) is doing. It has an initial cost, paid from the cell's stockpile when it starts; a per-tick cost; and a duration in ticks. Each tick, the cell pays its operations' per-tick costs from its stockpile, every cost cut by the same share when the stockpile is short, and each operation's progress advances by the share of its per-tick cost paid. An operation finishes when its progress reaches its duration.

Building [infrastructure](infrastructure.md) is an operation: the infrastructure exists, unbuilt, from the start, and the operation builds it when it finishes. Its costs and duration come from its type's [`infrastructureBuild`](../../architecture/engine/engine-config.md). If the building faction loses its presence in the region, the operation is cancelled and the unbuilt infrastructure reverts to the planetary faction.

## API

Exported from `@stellar-resistance/engine`.

### `OperationState`

An operation's plain data.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (`<cell>-op-<n>`) |
| `type` | `OperationType` | The kind of operation |
| `target` | `string` | The id of what it acts on; for a build operation, the infrastructure it builds |
| `initialCost` | `number` | Units of production paid when it starts; at least 0.0 |
| `duration` | `number` | Ticks of fully paid work it takes; positive |
| `perTickCost` | `number` | Units of production it's paid per tick when available; at least 0.0 |
| `progress` | `number` | Ticks of work done, in [0, `duration`] |

### `OperationType`

`"build"`

### `OperationCosts`

`{ initialCost, duration, perTickCost }`, as in `OperationState`.

### `createOperation(fields: OperationFields): OperationState`

Creates an operation's data. `OperationFields` is `OperationState` with `progress` optional; it defaults to 0. Throws if a cost is below 0.0, `duration` isn't positive, or `progress` isn't in [0, `duration`].

### `class Operation`

Implements [`Stateful<OperationState>` and `Tickable`](../../architecture/engine/game.md). Constructed with `new Operation(state, cell?)`. Getters: `id`, `type`, `target`, `initialCost`, `duration`, `perTickCost`, `progress`, `done`, and `cell`, the [`Cell`](cell.md) running it. `receive(payment)` gives it this tick's payment; `tick(n = 1)` advances its progress by the share of its per-tick cost paid, up to its duration.
