import { createPlanet, type Planet } from "./planet";
import { createPop } from "./pop";
import { createRegion, type Region, type RegionType } from "./region";

// Each pop is [size, expected standard of living].
function region(
  id: string,
  type: RegionType,
  productivity: number,
  pops: [number, number][],
): Region {
  return createRegion({
    id,
    type,
    productivity,
    pops: pops.map(([size, expectedStandardOfLiving], i) =>
      createPop({ id: `${id}-${i + 1}`, size, expectedStandardOfLiving }),
    ),
  });
}

// Hand-written stand-ins until planets are generated programmatically.
export const testPlanets: readonly Planet[] = [
  createPlanet({
    id: "veyra",
    name: "Veyra",
    regions: [
      region("veyra-1", "urban", 0.9, [
        [5000, 0.8],
        [4200, 0.7],
        [3100, 0.6],
      ]),
      region("veyra-2", "rural", 0.6, [
        [800, 0.5],
        [450, 0.4],
      ]),
      region("veyra-3", "rural", 0.6, [[1200, 0.6]]),
    ],
  }),
  createPlanet({
    id: "caddos-prime",
    name: "Caddos Prime",
    regions: [
      region("caddos-prime-1", "urban", 0.9, [
        [5000, 0.8],
        [5000, 0.7],
        [2600, 0.6],
      ]),
      region("caddos-prime-2", "urban", 0.9, [
        [3900, 0.7],
        [1750, 0.6],
      ]),
    ],
  }),
  createPlanet({
    id: "imbrel",
    name: "Imbrel",
    regions: [
      region("imbrel-1", "rural", 0.6, [
        [300, 0.5],
        [120, 0.4],
      ]),
      region("imbrel-2", "rural", 0.6, []),
    ],
  }),
  createPlanet({
    id: "korrins-reach",
    name: "Korrin's Reach",
    regions: [
      region("korrins-reach-1", "rural", 0.6, [[950, 0.5]]),
      region("korrins-reach-2", "urban", 0.9, [
        [2800, 0.7],
        [1600, 0.6],
      ]),
      region("korrins-reach-3", "rural", 0.6, [
        [640, 0.5],
        [380, 0.4],
      ]),
    ],
  }),
  createPlanet({
    id: "mar-oda",
    name: "Mar Oda",
    regions: [
      region("mar-oda-1", "urban", 0.9, [[3300, 0.8]]),
      region("mar-oda-2", "rural", 0.6, [
        [720, 0.5],
        [510, 0.4],
      ]),
    ],
  }),
];
