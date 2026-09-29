import { createPlanet, type Planet } from "./planet";
import { createRegion } from "./region";

// Hand-written stand-ins until planets are generated programmatically.
export const testPlanets: readonly Planet[] = [
  createPlanet({
    id: "veyra",
    name: "Veyra",
    regions: [
      createRegion({ id: "veyra-1", type: "urban" }),
      createRegion({ id: "veyra-2", type: "rural" }),
      createRegion({ id: "veyra-3", type: "rural" }),
    ],
  }),
  createPlanet({
    id: "caddos-prime",
    name: "Caddos Prime",
    regions: [
      createRegion({ id: "caddos-prime-1", type: "urban" }),
      createRegion({ id: "caddos-prime-2", type: "urban" }),
    ],
  }),
  createPlanet({
    id: "imbrel",
    name: "Imbrel",
    regions: [createRegion({ id: "imbrel-1", type: "rural" })],
  }),
  createPlanet({
    id: "korrins-reach",
    name: "Korrin's Reach",
    regions: [
      createRegion({ id: "korrins-reach-1", type: "rural" }),
      createRegion({ id: "korrins-reach-2", type: "urban" }),
      createRegion({ id: "korrins-reach-3", type: "rural" }),
    ],
  }),
  createPlanet({
    id: "mar-oda",
    name: "Mar Oda",
    regions: [
      createRegion({ id: "mar-oda-1", type: "urban" }),
      createRegion({ id: "mar-oda-2", type: "rural" }),
    ],
  }),
];
