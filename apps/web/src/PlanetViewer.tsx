import type { Planet, RegionType } from "@stellar-resistance/engine";
import { type Ref, useRef, useState } from "react";
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
import { flushSync } from "react-dom";

const regionTypeLabels: Record<RegionType, string> = {
  rural: "Rural",
  urban: "Urban",
};

export function PlanetViewer({ planets }: { planets: readonly Planet[] }) {
  const [filterText, setFilterText] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { contains } = useFilter({ sensitivity: "base" });
  const listRef = useRef<HTMLElement>(null);
  const detailsHeadingRef = useRef<HTMLHeadingElement>(null);

  const visiblePlanets = planets.filter((planet) =>
    contains(planet.name, filterText),
  );
  const selectedPlanet = planets.find((planet) => planet.id === selectedId);

  function select(id: string | null) {
    flushSync(() => {
      setSelectedId(id);
      if (id !== null) setFilterText("");
    });
    // On narrow viewports the list is now hidden, so move focus to the details.
    if (id !== null && !listRef.current?.checkVisibility()) {
      detailsHeadingRef.current?.focus();
    }
  }

  function back() {
    const previousId = selectedId;
    flushSync(() => setSelectedId(null));
    if (previousId !== null) {
      listRef.current
        ?.querySelector<HTMLElement>(`[data-key="${CSS.escape(previousId)}"]`)
        ?.focus();
    }
  }

  // Narrow viewports show either the list or the details; wide ones show both.
  return (
    <div className="flex min-h-0 flex-1">
      <section
        ref={listRef}
        aria-label="Planet list"
        className={`${selectedPlanet ? "hidden md:flex" : "flex"} w-full flex-col gap-3 border-slate-800 p-4 md:w-72 md:border-r`}
      >
        <SearchField
          value={filterText}
          onChange={setFilterText}
          className="group flex flex-col gap-1"
        >
          <Label className="text-sm text-slate-400">Filter planets</Label>
          <div className="relative">
            <Input className="w-full rounded border border-slate-700 bg-slate-900 py-2 pr-9 pl-3 outline-none focus:border-sky-400 [&::-webkit-search-cancel-button]:appearance-none" />
            <Button className="absolute inset-y-0 right-1 my-auto size-7 rounded text-slate-400 outline-none group-data-[empty]:hidden hover:bg-slate-800 hover:text-slate-100 focus-visible:ring-2 focus-visible:ring-sky-400">
              <span aria-hidden="true">✕</span>
            </Button>
          </div>
        </SearchField>
        <ListBox
          aria-label="Planets"
          items={visiblePlanets}
          selectionMode="single"
          // Select after the press completes, so focus moved by select() sticks.
          shouldSelectOnPressUp
          selectedKeys={selectedId ? [selectedId] : []}
          onSelectionChange={(keys) => {
            if (keys === "all") return;
            const [key] = keys;
            select(key === undefined ? null : String(key));
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
            headingRef={detailsHeadingRef}
            onBack={back}
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
  headingRef,
  onBack,
}: {
  planet: Planet;
  headingRef: Ref<HTMLHeadingElement>;
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
      <Heading
        ref={headingRef}
        tabIndex={-1}
        level={2}
        className="text-2xl font-bold outline-none"
      >
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
            <li key={region.id}>
              <span>{regionTypeLabels[region.type]}</span>
              {region.pops.length > 0 ? (
                <ul className="list-[circle] pl-5 text-slate-300">
                  {region.pops.map((pop) => (
                    <li key={pop.id}>{pop.size.toLocaleString()} people</li>
                  ))}
                </ul>
              ) : (
                <p className="pl-5 text-slate-400">Unpopulated</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
