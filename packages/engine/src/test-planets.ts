import { createPlanet, createRegion, type Planet } from "./planet";

// Hand-written stand-ins until planets are generated programmatically.
export const testPlanets: readonly Planet[] = [
  createPlanet({
    id: "veyra",
    name: "Veyra",
    regions: [
      createRegion({ id: "veyra-ashfall-basin", name: "Ashfall Basin" }),
      createRegion({ id: "veyra-tessel-highlands", name: "Tessel Highlands" }),
      createRegion({ id: "veyra-port-oriel", name: "Port Oriel" }),
    ],
  }),
  createPlanet({
    id: "caddos-prime",
    name: "Caddos Prime",
    regions: [
      createRegion({ id: "caddos-prime-foundry-belt", name: "Foundry Belt" }),
      createRegion({ id: "caddos-prime-lower-warrens", name: "Lower Warrens" }),
    ],
  }),
  createPlanet({
    id: "imbrel",
    name: "Imbrel",
    regions: [
      createRegion({ id: "imbrel-glass-steppe", name: "Glass Steppe" }),
    ],
  }),
  createPlanet({
    id: "korrins-reach",
    name: "Korrin's Reach",
    regions: [
      createRegion({ id: "korrins-reach-salt-flats", name: "Salt Flats" }),
      createRegion({
        id: "korrins-reach-cinder-quarter",
        name: "Cinder Quarter",
      }),
      createRegion({ id: "korrins-reach-old-harbor", name: "Old Harbor" }),
    ],
  }),
  createPlanet({
    id: "mar-oda",
    name: "Mar Oda",
    regions: [
      createRegion({ id: "mar-oda-tidewater", name: "Tidewater" }),
      createRegion({ id: "mar-oda-spire-district", name: "Spire District" }),
    ],
  }),
];
