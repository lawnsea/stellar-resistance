import { describe, expect, test } from "vitest";
import { Cell, createCell, createFaction, Faction } from "./index";

describe("createFaction", () => {
  test("creates a faction with its cell ids", () => {
    expect(
      createFaction({ id: "res", name: "The Resistance", cellIds: ["c1"] }),
    ).toEqual({ id: "res", name: "The Resistance", cellIds: ["c1"] });
  });

  test("cell ids default to none", () => {
    expect(createFaction({ id: "emp", name: "The Empire" }).cellIds).toEqual(
      [],
    );
  });

  test("copies the cell ids", () => {
    const cellIds = ["c1"];
    const faction = createFaction({
      id: "res",
      name: "The Resistance",
      cellIds,
    });
    cellIds.push("c2");
    expect(faction.cellIds).toEqual(["c1"]);
  });
});

describe("Faction", () => {
  test("exposes its id and name", () => {
    const f = new Faction(createFaction({ id: "res", name: "The Resistance" }));
    expect(f.id).toBe("res");
    expect(f.name).toBe("The Resistance");
  });

  test("addCell links the cell both ways and lists it in the faction's state", () => {
    const f = new Faction(createFaction({ id: "res", name: "The Resistance" }));
    const cell = new Cell(
      createCell({ id: "c1", faction: "res", region: "r1" }),
    );
    f.addCell(cell);
    expect(f.cells).toEqual([cell]);
    expect(cell.faction).toBe(f);
    expect(f.getState().cellIds).toEqual(["c1"]);
  });
});
