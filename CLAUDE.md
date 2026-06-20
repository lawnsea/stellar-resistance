# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Galactic Resistance is a turn-based grand strategy game about building a resistance network inside an oppressive galactic empire.

Design documents live in `design/`:
- `design/entities.md` — data model: all first-class entities and their properties
- `design/mechanics.md` — simulation rules: how entities change state over time

See [CONTRIBUTING.md](CONTRIBUTING.md) for tooling setup.

## Packages

- `packages/engine` — entity schemas and their implementations. Currently models only `Pop` (scope intentionally narrowed); other entities from `design/entities.md` are plain numeric placeholders until modeled. Each entity's shape is defined as a JSON Schema; `src/entity-schema.ts`'s `createObjectImpl` derives a plain-object implementation class from it (see `src/entities/pop.ts`). Binary representation (and entity ids) is deferred — entities are plain objects with no storage/collection layer yet; that comes back once a sub-entity (e.g. attitude rows, currently inlined into `Pop`) is extracted with its own schema and ids.
