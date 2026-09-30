import {
  createPlanet,
  createPop,
  createRegion,
  createState,
} from "@stellar-resistance/engine";
import { beforeEach, describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { PlanetViewer } from "./PlanetViewer";

function pop(id: string, size: number, actual: number, expected: number) {
  return createPop({
    id,
    size,
    actualStandardOfLiving: actual,
    expectedStandardOfLiving: expected,
  });
}

const planets = [
  createPlanet({
    id: "veyra",
    name: "Veyra",
    regions: [
      createRegion({
        id: "veyra-1",
        type: "urban",
        productionCap: 6000,
        pops: [pop("veyra-1-1", 4200, 1, 1.2), pop("veyra-1-2", 1500, 0.6, 1)],
      }),
      createRegion({
        id: "veyra-2",
        type: "rural",
        productionCap: 700,
        pops: [pop("veyra-2-1", 800, 1, 1.1)],
      }),
      createRegion({
        id: "veyra-3",
        type: "rural",
        productionCap: 500,
        pops: [],
      }),
    ],
  }),
  createPlanet({
    id: "imbrel",
    name: "Imbrel",
    regions: [
      createRegion({
        id: "imbrel-1",
        type: "rural",
        productionCap: 1000,
        pops: [pop("imbrel-1-1", 300, 1, 1)],
      }),
    ],
  }),
];

const state = createState({ factions: [], planets });

describe("on wide viewports", () => {
  beforeEach(async () => {
    await page.viewport(1024, 768);
  });

  test("lists every planet", async () => {
    const screen = await render(<PlanetViewer state={state} />);
    await expect
      .element(screen.getByRole("option", { name: "Veyra" }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("option", { name: "Imbrel" }))
      .toBeVisible();
  });

  test("filters planets by name", async () => {
    const screen = await render(<PlanetViewer state={state} />);
    await screen.getByRole("searchbox", { name: "Filter planets" }).fill("imb");
    await expect
      .element(screen.getByRole("option", { name: "Imbrel" }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("option", { name: "Veyra" }))
      .not.toBeInTheDocument();
  });

  test("shows the selected planet's details beside the list", async () => {
    const screen = await render(<PlanetViewer state={state} />);
    await screen.getByRole("option", { name: "Veyra" }).click();
    await expect
      .element(screen.getByRole("heading", { level: 2, name: "Veyra" }))
      .toBeVisible();
    await expect.element(screen.getByText("Urban")).toBeVisible();
    await expect.element(screen.getByText("Rural").first()).toBeVisible();
    await expect.element(screen.getByText("4,200 people")).toBeVisible();
    await expect.element(screen.getByText("1,500 people")).toBeVisible();
    await expect.element(screen.getByText("800 people")).toBeVisible();
    await expect.element(screen.getByText("Unpopulated")).toBeVisible();
  });

  test("shows each region's economy for one tick", async () => {
    const screen = await render(<PlanetViewer state={state} />);
    await screen.getByRole("option", { name: "Veyra" }).click();
    // The urban region: cap 6,000; 4,200 × 1.05 + 1,500 × 1.05 × 0.6 = 5,355 units of
    // production for 5,700 people.
    await expect
      .element(screen.getByText("6,000", { exact: true }))
      .toBeVisible();
    await expect
      .element(screen.getByText("5,355", { exact: true }))
      .toBeVisible();
    await expect
      .element(screen.getByText("5,700", { exact: true }))
      .toBeVisible();
    await expect
      .element(screen.getByText("-345", { exact: true }))
      .toBeVisible();
    await expect
      .element(
        screen.getByText("(standard of living: actual 0.6, expected 1.0)"),
      )
      .toBeVisible();
    // At an actual standard of living of 0.6, the default curves give a birth
    // rate of 0.41% and a death rate of 3.37% per tick: 6.1 and 50.6 people.
    await expect
      .element(
        screen.getByText("births 6.1 (0.4%), deaths 50.6 (3.4%) per tick"),
      )
      .toBeVisible();
    await expect
      .element(screen.getByRole("option", { name: "Imbrel" }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("option", { name: "Veyra" }))
      .toHaveFocus();
  });

  test("clears the filter with the clear button", async () => {
    const screen = await render(<PlanetViewer state={state} />);
    const filter = screen.getByRole("searchbox", { name: "Filter planets" });
    await expect
      .element(screen.getByRole("button", { name: "Clear search" }))
      .not.toBeInTheDocument();
    await filter.fill("imb");
    await screen.getByRole("button", { name: "Clear search" }).click();
    await expect.element(filter).toHaveValue("");
    await expect
      .element(screen.getByRole("option", { name: "Veyra" }))
      .toBeVisible();
  });

  test("clears the filter when a planet is selected", async () => {
    const screen = await render(<PlanetViewer state={state} />);
    const filter = screen.getByRole("searchbox", { name: "Filter planets" });
    await filter.fill("imb");
    await screen.getByRole("option", { name: "Imbrel" }).click();
    await expect.element(filter).toHaveValue("");
    await expect
      .element(screen.getByRole("option", { name: "Veyra" }))
      .toBeVisible();
  });
});

describe("on narrow viewports", () => {
  beforeEach(async () => {
    await page.viewport(375, 667);
  });

  test("shows details in place of the list, with a way back", async () => {
    const screen = await render(<PlanetViewer state={state} />);
    await expect
      .element(screen.getByText("Select a planet to see its details."))
      .not.toBeVisible();

    await screen.getByRole("option", { name: "Imbrel" }).click();
    await expect
      .element(screen.getByRole("heading", { level: 2, name: "Imbrel" }))
      .toHaveFocus();
    await expect.element(screen.getByText("Veyra")).not.toBeVisible();

    await screen.getByRole("button", { name: "Back to planets" }).click();
    await expect
      .element(screen.getByRole("option", { name: "Imbrel" }))
      .toHaveFocus();
    await expect
      .element(screen.getByRole("heading", { level: 2 }))
      .not.toBeInTheDocument();
  });
});
