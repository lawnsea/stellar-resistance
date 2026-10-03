import { createCell } from "./cell";
import { createFaction, type FactionState } from "./faction";
import type { GameState } from "./game";
import type { PlanetState } from "./planet";

export function withPlanetaryFactions(state: GameState): GameState {
  const factions = [...state.factions];
  const planets = state.planets.map((planet): PlanetState => {
    if (planet.factionId === undefined) {
      const factionId = `${planet.id}-faction`;
      factions.push(createFaction({ id: factionId, name: planet.name }));
      return { ...planet, factionId };
    }
    if (!factions.some((faction) => faction.id === planet.factionId)) {
      throw new Error(
        `Planet ${planet.id} planetary faction ${planet.factionId} not found`,
      );
    }
    return planet;
  });
  return {
    factions: assignPops(withRegionCells(factions, planets), planets),
    planets,
  };
}

function withRegionCells(
  factions: readonly FactionState[],
  planets: readonly PlanetState[],
): FactionState[] {
  return factions.map((faction) => {
    const cells = [...faction.cells];
    for (const planet of planets) {
      if (planet.factionId !== faction.id) continue;
      for (const region of planet.regions) {
        if (!cells.some((cell) => cell.regionId === region.id)) {
          cells.push(
            createCell({ id: `${region.id}-cell`, regionId: region.id }),
          );
        }
      }
    }
    return { ...faction, cells };
  });
}

function assignPops(
  factions: readonly FactionState[],
  planets: readonly PlanetState[],
): FactionState[] {
  const livePopIds = new Set(
    planets.flatMap((planet) =>
      planet.regions.flatMap((region) => region.pops.map((pop) => pop.id)),
    ),
  );
  const assigned = new Set<string>();
  const reconciled = factions.map((faction) => ({
    ...faction,
    cells: faction.cells.map((cell) => {
      const popIds = cell.popIds.flatMap((id) =>
        livePopIds.has(id) ? [id] : splitChildren(id, livePopIds),
      );
      for (const id of popIds) assigned.add(id);
      return { ...cell, popIds };
    }),
  }));
  return reconciled.map((faction) => ({
    ...faction,
    cells: faction.cells.map((cell) => {
      const planet = planets.find(
        (p) =>
          p.factionId === faction.id &&
          p.regions.some((region) => region.id === cell.regionId),
      );
      const region = planet?.regions.find((r) => r.id === cell.regionId);
      if (!region) return cell;
      const joining = region.pops
        .map((pop) => pop.id)
        .filter((id) => !assigned.has(id));
      for (const id of joining) assigned.add(id);
      return joining.length > 0
        ? { ...cell, popIds: [...cell.popIds, ...joining] }
        : cell;
    }),
  }));
}

function splitChildren(id: string, livePopIds: ReadonlySet<string>): string[] {
  return [`${id}.1`, `${id}.2`].filter((child) => livePopIds.has(child));
}
