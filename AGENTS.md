# AGENTS.md

This file provides guidance to AI coding agents working in this repository. `CLAUDE.md` is a symlink to it.

## Project overview

Stellar Resistance is a grand strategy game about building a resistance network inside an oppressive interstellar empire. It's a pnpm monorepo:

- `apps/web` — React + Vite web client
- `packages/engine` — UI-free simulation engine, consumed as TypeScript source

Docs:
- `docs/design/README.md` — design summary and pillars, bibliography
- `docs/design/entities/` — entity descriptions and their APIs
- `docs/architecture/engine/game.md` — the game, `Stateful`, and `Tickable`
- `docs/architecture/engine/engine-config.md` — global simulation settings (`EngineConfig`)
- `docs/architecture/README.md` — architecture summary and pillars
- `docs/architecture/stack.md` — tech stack

See [CONTRIBUTING.md](CONTRIBUTING.md) for tooling setup.

## Commands

Run from the repo root:

- Typecheck: `pnpm typecheck`
- Lint and format check: `pnpm lint` (auto-fix: `pnpm lint:fix`)
- Test: `pnpm test`
- Build: `pnpm build`
- Dev server: `pnpm dev`

Web tests run in a real browser via Vitest browser mode. Install Chromium once with `pnpm --filter @stellar-resistance/web exec playwright install chromium`.
