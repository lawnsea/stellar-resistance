import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { App } from "./App";

test("renders the title", async () => {
  const screen = await render(<App />);
  await expect
    .element(screen.getByRole("heading", { name: "Stellar Resistance" }))
    .toBeVisible();
});
