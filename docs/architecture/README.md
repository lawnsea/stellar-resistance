Stellar Resistance is a web app that runs in both mobile and desktop browsers. It can be installed as a progressive web app and is fully playable offline once loaded, with saves stored locally. The app mostly runs in web workers, with only a minimal UI layer on the main thread.

# Architecture pillars

## Built on the web and built for all

The app is responsive and accessible so that it reaches as many users on as many devices as possible.

## Portable backend

The simulation backend can run either in a web worker on the user's device or in a Node.js process.

## Observable

The app is instrumented to produce logs and metrics characterizing its behavior and performance. This observability data is easy to view in development.
