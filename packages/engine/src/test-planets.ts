import { createPlanet, type Planet } from "./planet";
import { createPop } from "./pop";
import { createRegion, type Region, type RegionType } from "./region";

// Each pop is [size, expected standard of living, actual standard of living].
function region(
  id: string,
  type: RegionType,
  pops: [number, number, number][],
): Region {
  return createRegion({
    id,
    type,
    pops: pops.map(
      ([size, expectedStandardOfLiving, actualStandardOfLiving], i) =>
        createPop({
          id: `${id}-${i + 1}`,
          size,
          expectedStandardOfLiving,
          actualStandardOfLiving,
        }),
    ),
  });
}

// Hand-written stand-ins until planets are generated programmatically.
export const testPlanets: readonly Planet[] = [
  createPlanet({
    id: "veyra",
    name: "Veyra",
    regions: [
      region("veyra-1", "urban", [
        [5000, 1.3, 1],
        [4200, 1.2, 1],
        [3100, 1.1, 1],
      ]),
      region("veyra-2", "rural", [
        [800, 1.05, 1],
        [450, 1, 1],
      ]),
      region("veyra-3", "rural", [[1200, 1.1, 1]]),
    ],
  }),
  createPlanet({
    id: "caddos-prime",
    name: "Caddos Prime",
    regions: [
      region("caddos-prime-1", "urban", [
        [5000, 1.3, 0.9],
        [5000, 1.2, 0.9],
        [2600, 1.1, 0.9],
      ]),
      region("caddos-prime-2", "urban", [
        [3900, 1.2, 1],
        [1750, 1.1, 1],
      ]),
    ],
  }),
  createPlanet({
    id: "imbrel",
    name: "Imbrel",
    regions: [
      region("imbrel-1", "rural", [
        [300, 1, 0.7],
        [120, 1, 0.7],
      ]),
      region("imbrel-2", "rural", []),
    ],
  }),
  createPlanet({
    id: "korrins-reach",
    name: "Korrin's Reach",
    regions: [
      region("korrins-reach-1", "rural", [[950, 1.05, 1]]),
      region("korrins-reach-2", "urban", [
        [2800, 1.2, 1],
        [1600, 1.1, 1],
      ]),
      region("korrins-reach-3", "rural", [
        [640, 1.05, 1],
        [380, 1, 1],
      ]),
    ],
  }),
  createPlanet({
    id: "mar-oda",
    name: "Mar Oda",
    regions: [
      region("mar-oda-1", "urban", [[3300, 1.3, 1]]),
      region("mar-oda-2", "rural", [
        [720, 1.05, 1],
        [510, 1, 1],
      ]),
    ],
  }),
];
