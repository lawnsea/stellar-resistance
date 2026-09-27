# Tech stack

| Concern | Choice | Reason |
|---|---|---|
| Language | [TypeScript](https://www.typescriptlang.org/) | Runs in browsers, web workers, and Node.js, so the simulation backend stays portable. |
| Typecheck | [`tsc`](https://www.typescriptlang.org/docs/handbook/compiler-options.html) | The reference TypeScript type checker. |
| UI framework | [React](https://react.dev/) | The largest ecosystem, including accessible component libraries such as [React Aria](https://react-spectrum.adobe.com/react-aria/). |
| Bundler / dev server | [Vite](https://vite.dev/) | Fast dev server, with built-in support for web workers and plugins for PWAs. |
| Test | [Vitest](https://vitest.dev/) | Shares Vite's config and pipeline, so tests run the same code transforms as the app. |
| Lint / format | [Biome](https://biomejs.dev/) | One fast tool and one config for both linting and formatting. |
| Package manager | [pnpm](https://pnpm.io/) workspaces | Already in place. See [CONTRIBUTING.md](../../CONTRIBUTING.md). |
