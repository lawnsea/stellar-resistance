# Pop

Pops are groups of people who live in a region. Each pop has a size between 1 and a globally configurable maximum, which starts at 5000.

## API

Exported from `@stellar-resistance/engine`.

### `Pop`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `size` | `number` | Number of people; an integer from 1 to `maxPopSize` |

### `createPop(fields: Pop, config?: EngineConfig): Pop`

Creates a pop. Throws if `size` isn't an integer from 1 to `config.maxPopSize`. `config` defaults to `defaultConfig`.

### `EngineConfig`

| Field | Type | Description |
|---|---|---|
| `maxPopSize` | `number` | The largest allowed pop size |

### `defaultConfig: EngineConfig`

The global configuration: `{ maxPopSize: 5000 }`.
