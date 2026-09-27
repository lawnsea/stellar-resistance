import { createPlanet, createRegion } from "@stellar-resistance/engine";
import { beforeEach, describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { PlanetViewer } from "./PlanetViewer";

const planets = [
  createPlanet({
    id: "veyra",
    name: "Veyra",
    regions: [
      createRegion({ id: "ashfall", name: "Ashfall Basin" }),
      createRegion({ id: "oriel", name: "Port Oriel" }),
    ],
  }),
  createPlanet({
    id: "imbrel",
    name: "Imbrel",
    regions: [createRegion({ id: "steppe", name: "Glass Steppe" })],
  }),
];

describe("on wide viewports", () => {
  beforeEach(async () => {
    await page.viewport(1024, 768);
  });

  test("lists every planet", async () => {
    const screen = await render(<PlanetViewer planets={planets} />);
    await expect
      .element(screen.getByRole("option", { name: "Veyra" }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("option", { name: "Imbrel" }))
      .toBeVisible();
  });

  test("filters planets by name", async () => {
    const screen = await render(<PlanetViewer planets={planets} />);
    await screen.getByRole("searchbox", { name: "Filter planets" }).fill("imb");
    await expect
      .element(screen.getByRole("option", { name: "Imbrel" }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("option", { name: "Veyra" }))
      .not.toBeInTheDocument();
  });

  test("shows the selected planet's details beside the list", async () => {
    const screen = await render(<PlanetViewer planets={planets} />);
    await screen.getByRole("option", { name: "Veyra" }).click();
    await expect
      .element(screen.getByRole("heading", { level: 2, name: "Veyra" }))
      .toBeVisible();
    await expect.element(screen.getByText("Ashfall Basin")).toBeVisible();
    await expect.element(screen.getByText("Port Oriel")).toBeVisible();
    await expect
      .element(screen.getByRole("option", { name: "Imbrel" }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("option", { name: "Veyra" }))
      .toHaveFocus();
  });

  test("clears the filter with the clear button", async () => {
    const screen = await render(<PlanetViewer planets={planets} />);
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
    const screen = await render(<PlanetViewer planets={planets} />);
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
    const screen = await render(<PlanetViewer planets={planets} />);
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
