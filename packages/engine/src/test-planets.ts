import { createPlanet, type Planet } from "./planet";
import { createPop } from "./pop";
import { createRegion, type Region, type RegionType } from "./region";

function region(id: string, type: RegionType, popSizes: number[]): Region {
  return createRegion({
    id,
    type,
    pops: popSizes.map((size, i) => createPop({ id: `${id}-${i + 1}`, size })),
  });
}

// Hand-written stand-ins until planets are generated programmatically.
export const testPlanets: readonly Planet[] = [
  createPlanet({
    id: "veyra",
    name: "Veyra",
    regions: [
      region("veyra-1", "urban", [5000, 4200, 3100]),
      region("veyra-2", "rural", [800, 450]),
      region("veyra-3", "rural", [1200]),
    ],
  }),
  createPlanet({
    id: "caddos-prime",
    name: "Caddos Prime",
    regions: [
      region("caddos-prime-1", "urban", [5000, 5000, 2600]),
      region("caddos-prime-2", "urban", [3900, 1750]),
    ],
  }),
  createPlanet({
    id: "imbrel",
    name: "Imbrel",
    regions: [region("imbrel-1", "rural", [300, 120])],
  }),
  createPlanet({
    id: "korrins-reach",
    name: "Korrin's Reach",
    regions: [
      region("korrins-reach-1", "rural", [950]),
      region("korrins-reach-2", "urban", [2800, 1600]),
      region("korrins-reach-3", "rural", [640, 380]),
    ],
  }),
  createPlanet({
    id: "mar-oda",
    name: "Mar Oda",
    regions: [
      region("mar-oda-1", "urban", [3300]),
      region("mar-oda-2", "rural", [720, 510]),
    ],
  }),
];
