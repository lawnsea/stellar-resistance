import { describe, expect, test } from "vitest";
import { Cell, createCell } from "./index";

describe("createCell", () => {
  test("creates a cell based in a region", () => {
    expect(createCell({ id: "c1", regionId: "r1" })).toEqual({
      id: "c1",
      regionId: "r1",
    });
  });
});

describe("Cell", () => {
  test("exposes its id and region", () => {
    const cell = new Cell(createCell({ id: "c1", regionId: "r1" }));
    expect(cell.id).toBe("c1");
    expect(cell.regionId).toBe("r1");
  });

  test("gets and sets its state", () => {
    const cell = new Cell(createCell({ id: "c1", regionId: "r1" }));
    const other = createCell({ id: "c1", regionId: "r2" });
    cell.setState(other);
    expect(cell.regionId).toBe("r2");
    expect(cell.getState()).toBe(other);
  });
});
