Stellar Resistance is a web app that runs in both mobile and desktop browsers. It can be installed as a progressive web app and is fully playable offline once loaded, with saves stored locally. The app mostly runs in workers, with only a minimal UI layer running on the main thread.

# Architecture pillars

## Built on the web and built for all

The app should be responsive and accessible to reach as many users on as many devices as possible.

## Portable backend

The backend where the simulation is running should be able to run in a web worker on the user's device or in a node.js process on a cloud instance.

## Observable

The app should be instrumented to produce logs and metrics characterizing its behavior and performance. That observability data should be easy to view in development.
