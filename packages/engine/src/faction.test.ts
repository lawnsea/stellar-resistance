import { afterEach, describe, expect, test, vi } from "vitest";
import { Cell, createCell, createFaction, Faction } from "./index";

const cell = createCell({ id: "c1", regionId: "r1" });
const faction = createFaction({
  id: "f1",
  name: "The Resistance",
  cells: [cell],
});

describe("createFaction", () => {
  test("creates a faction with its cells", () => {
    expect(faction).toEqual({
      id: "f1",
      name: "The Resistance",
      cells: [cell],
    });
  });

  test("cells default to none", () => {
    expect(createFaction({ id: "f2", name: "The Empire" }).cells).toEqual([]);
  });

  test("copies the cells array", () => {
    const cells = [cell];
    const f = createFaction({ id: "f1", name: "The Resistance", cells });
    cells.push(createCell({ id: "c2", regionId: "r2" }));
    expect(f.cells).toHaveLength(1);
  });
});

describe("Faction", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("exposes its id, name, and cells", () => {
    const f = new Faction(faction);
    expect(f.id).toBe("f1");
    expect(f.name).toBe("The Resistance");
    expect(f.cells[0]).toBeInstanceOf(Cell);
    expect(f.cells.map((c) => c.getState())).toEqual([cell]);
  });

  test("getState builds its data from its cells' getState", () => {
    const cellGetState = vi.spyOn(Cell.prototype, "getState");
    expect(new Faction(faction).getState()).toEqual(faction);
    expect(cellGetState).toHaveBeenCalledTimes(1);
  });

  test("setState replaces its data and rebuilds its cells", () => {
    const f = new Faction(faction);
    const other = createFaction({
      id: "f1",
      name: "Rebel Alliance",
      cells: [createCell({ id: "c9", regionId: "r9" })],
    });
    f.setState(other);
    expect(f.name).toBe("Rebel Alliance");
    expect(f.cells.map((c) => c.id)).toEqual(["c9"]);
    expect(f.getState()).toEqual(other);
  });
});
