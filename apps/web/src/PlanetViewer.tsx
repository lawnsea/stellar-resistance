import type { Planet } from "@stellar-resistance/engine";
import { useState } from "react";
import {
  Button,
  Heading,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  SearchField,
  useFilter,
} from "react-aria-components";

export function PlanetViewer({ planets }: { planets: readonly Planet[] }) {
  const [filterText, setFilterText] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { contains } = useFilter({ sensitivity: "base" });

  const visiblePlanets = planets.filter((planet) =>
    contains(planet.name, filterText),
  );
  const selectedPlanet = planets.find((planet) => planet.id === selectedId);

  // Narrow viewports show either the list or the details; wide ones show both.
  return (
    <div className="flex min-h-0 flex-1">
      <section
        aria-label="Planet list"
        className={`${selectedPlanet ? "hidden md:flex" : "flex"} w-full flex-col gap-3 border-slate-800 p-4 md:w-72 md:border-r`}
      >
        <SearchField
          value={filterText}
          onChange={setFilterText}
          className="flex flex-col gap-1"
        >
          <Label className="text-sm text-slate-400">Filter planets</Label>
          <Input className="rounded border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-sky-400" />
        </SearchField>
        <ListBox
          aria-label="Planets"
          items={visiblePlanets}
          selectionMode="single"
          selectedKeys={selectedId ? [selectedId] : []}
          onSelectionChange={(keys) => {
            if (keys === "all") return;
            const [key] = keys;
            setSelectedId(key === undefined ? null : String(key));
          }}
          renderEmptyState={() => (
            <p className="px-3 py-2 text-slate-400">No planets match.</p>
          )}
          className="flex flex-col gap-1 overflow-y-auto"
        >
          {(planet) => (
            <ListBoxItem
              id={planet.id}
              className="cursor-pointer rounded px-3 py-2 outline-none hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-sky-400 selected:bg-sky-900"
            >
              {planet.name}
            </ListBoxItem>
          )}
        </ListBox>
      </section>
      <section
        aria-label="Planet details"
        className={`${selectedPlanet ? "flex" : "hidden md:flex"} flex-1 flex-col gap-4 p-4`}
      >
        {selectedPlanet ? (
          <PlanetDetails
            planet={selectedPlanet}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <p className="text-slate-400">Select a planet to see its details.</p>
        )}
      </section>
    </div>
  );
}

function PlanetDetails({
  planet,
  onBack,
}: {
  planet: Planet;
  onBack: () => void;
}) {
  return (
    <>
      <Button
        onPress={onBack}
        className="self-start rounded px-2 py-1 text-sky-300 outline-none hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-sky-400 md:hidden"
      >
        <span aria-hidden="true">← </span>Back to planets
      </Button>
      <Heading level={2} className="text-2xl font-bold">
        {planet.name}
      </Heading>
      <div>
        <Heading
          level={3}
          className="text-sm font-semibold uppercase tracking-wide text-slate-400"
        >
          Regions
        </Heading>
        <ul className="mt-2 list-disc pl-5">
          {planet.regions.map((region) => (
            <li key={region.id}>{region.name}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
