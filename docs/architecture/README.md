Stellar Resistance is a web app that runs in both mobile and desktop browsers. It can be installed as a progressive web app and is fully playable offline once loaded, with saves stored locally.

The app is multi-threaded. It is decomposed into collaborating Web Workers, with only a minimal UI layer running on the main thread. The simulation and other heavy work run in workers, keeping the UI responsive even on phones.

# Architecture pillars

## Deterministic simulation

Given the same seed and the same player inputs, the simulation always produces the same result. This makes the engine testable, bugs reproducible, and replays possible.

## True state is separate from perceived state

The engine owns the true game state. Each actor, including the player, maintains its own perceived state. The UI only ever receives the player's perceived state, so the true state can't leak to the player.

## Serializable state

The entire game state can be serialized, so it can be saved, loaded, and passed between workers. Save/load is required from the first playable version.

## Data-driven content

Game content is defined as data rather than code, so that modding can be supported later.

## Built to scale

The simulation handles hundreds of planets and thousands of population groups while staying responsive on mobile devices.
