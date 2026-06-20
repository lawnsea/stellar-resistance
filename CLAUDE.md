# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Galactic Resistance is a turn-based grand strategy game about building a resistance network inside an oppressive galactic empire.

Design documents live in `design/`:
- `design/entities.md` — data model: all first-class entities and their properties
- `design/mechanics.md` — simulation rules: how entities change state over time

See [CONTRIBUTING.md](CONTRIBUTING.md) for tooling setup.

## Packages

- `packages/engine` — entity schemas, ArrayBuffer-backed game state, and the tick loop. Currently models only `Pop` (scope intentionally narrowed); other entities from `design/entities.md` are opaque placeholder ids until modeled. See its `src/storage/` for the generic schema-driven binary storage layer (array-of-structs by default, struct-of-arrays opt-in, generational ids, growable buffers) that every future entity will reuse.
