import { expect, test } from "vitest";
import { createFaction } from "./index";

test("createFaction creates a faction", () => {
  expect(createFaction({ id: "f1", name: "The Resistance" })).toEqual({
    id: "f1",
    name: "The Resistance",
  });
});
