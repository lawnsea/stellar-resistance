import { testGameState } from "@stellar-resistance/engine";
import { Heading } from "react-aria-components";
import { PlanetViewer } from "./PlanetViewer";

export function App() {
  return (
    <div className="flex h-dvh flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-4 py-3">
        <Heading level={1} className="text-xl font-bold">
          Stellar Resistance
        </Heading>
      </header>
      <main className="flex min-h-0 flex-1">
        <PlanetViewer state={testGameState} />
      </main>
    </div>
  );
}
