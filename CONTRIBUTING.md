# Contributing

## Tooling

- Node version managed via [fnm](https://github.com/Schniz/fnm), pinned in `.node-version`.
- Package manager is pnpm, pinned via Corepack's `packageManager` field in `package.json`.
- Monorepo management is via pnpm workspaces, configured in `pnpm-workspace.yaml`.
- Lint and format via [Biome](https://biomejs.dev/), configured in `biome.json`.

## Getting started

```sh
pnpm install
pnpm --filter @stellar-resistance/web exec playwright install chromium  # browser for web tests
pnpm dev
```

## Scripts

Run from the repo root:

| Script | What it does |
|---|---|
| `pnpm dev` | Start the web client's dev server |
| `pnpm build` | Build all packages |
| `pnpm typecheck` | Typecheck all packages |
| `pnpm lint` | Check lint and formatting |
| `pnpm lint:fix` | Fix lint and formatting issues |
| `pnpm test` | Run all tests |
