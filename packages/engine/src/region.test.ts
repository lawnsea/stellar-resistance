import { expect, test } from "vitest";
import { createRegion } from "./index";

test("createRegion creates a region", () => {
  expect(createRegion({ id: "r1", type: "rural" })).toEqual({
    id: "r1",
    type: "rural",
  });
});
