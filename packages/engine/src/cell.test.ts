import { describe, expect, test } from "vitest";
import { Cell, createCell, createOperation, createPop, Pop } from "./index";

const member = createPop({ id: "p1", size: 100, expectedStandardOfLiving: 1 });
const cell = createCell({
  id: "c1",
  faction: "res",
  region: "r1",
  pops: [member],
});

describe("createCell", () => {
  test("creates a cell of a faction, in a region, with its member pops", () => {
    expect(cell).toEqual({
      id: "c1",
      faction: "res",
      region: "r1",
      income: 0,
      stockpile: 0,
      pops: [member],
      operations: [],
      nextOperationNumber: 1,
    });
  });

  test("keeps a given income", () => {
    expect(
      createCell({ id: "c1", faction: "res", region: "r1", income: 50 }).income,
    ).toBe(50);
  });

  test("members default to none", () => {
    expect(createCell({ id: "c1", faction: "res", region: "r1" }).pops).toEqual(
      [],
    );
  });

  test("copies its member pops", () => {
    const pops = [member];
    const created = createCell({
      id: "c1",
      faction: "res",
      region: "r1",
      pops,
    });
    pops.push(member);
    expect(created.pops).toHaveLength(1);
  });
});

describe("Cell", () => {
  test("exposes its id, faction id, region id, and member pops", () => {
    const c = new Cell(cell);
    expect(c.id).toBe("c1");
    expect(c.factionId).toBe("res");
    expect(c.regionId).toBe("r1");
    expect(c.pops[0]).toBeInstanceOf(Pop);
    expect(c.pops[0]?.cell).toBe(c);
  });

  test("gets and sets its state", () => {
    const c = new Cell(cell);
    expect(c.getState()).toEqual(cell);
    const other = createCell({ ...cell, faction: "gov" });
    c.setState(other);
    expect(c.factionId).toBe("gov");
    expect(c.getState()).toEqual(other);
  });
});

describe("Cell operations", () => {
  const costs = { initialCost: 100, duration: 2, perTickCost: 50 };

  function funded(stockpile: number): Cell {
    return new Cell(
      createCell({ id: "c1", faction: "res", region: "r1", stockpile }),
    );
  }

  test("starting an operation pays its initial cost from the stockpile", () => {
    const cell = funded(150);
    const operation = cell.startOperation("build", "r1-infra-1", costs);
    expect(operation.getState()).toEqual(
      createOperation({
        id: "c1-op-1",
        type: "build",
        target: "r1-infra-1",
        ...costs,
      }),
    );
    expect(operation.cell).toBe(cell);
    expect(cell.stockpile).toBe(50);
    expect(cell.operations).toEqual([operation]);
    expect(
      cell.startOperation("build", "r1-infra-2", { ...costs, initialCost: 0 })
        .id,
    ).toBe("c1-op-2");
  });

  test("an operation it can't afford is an error", () => {
    const cell = funded(99);
    expect(() => cell.startOperation("build", "r1-infra-1", costs)).toThrow(
      "Cell c1 can't afford the initial cost of 100 from its stockpile of 99",
    );
    expect(cell.operations).toEqual([]);
    expect(cell.stockpile).toBe(99);
  });

  test("runs its operations from its stockpile, cut by the same share when short", () => {
    const cell = funded(275);
    const a = cell.startOperation("build", "a", costs);
    const b = cell.startOperation("build", "b", { ...costs, perTickCost: 100 });
    // 75 left for 150 of per-tick costs.
    expect(cell.runOperations()).toEqual([]);
    expect(a.progress).toBeCloseTo(0.5, 6);
    expect(b.progress).toBeCloseTo(0.5, 6);
    expect(cell.stockpile).toBeCloseTo(0, 6);
  });

  test("returns and removes operations that finish", () => {
    const cell = funded(1000);
    const operation = cell.startOperation("build", "a", costs);
    expect(cell.runOperations()).toEqual([]);
    expect(cell.runOperations()).toEqual([operation]);
    expect(cell.operations).toEqual([]);
    expect(cell.stockpile).toBe(800);
  });

  test("saves into its stockpile", () => {
    const cell = funded(10);
    cell.save(5);
    expect(cell.stockpile).toBe(15);
  });

  test("cancels operations on a target", () => {
    const cell = funded(1000);
    cell.startOperation("build", "a", costs);
    const keep = cell.startOperation("build", "b", costs);
    cell.cancelOperations("a");
    expect(cell.operations).toEqual([keep]);
  });

  test("gets and sets its operations as plain data", () => {
    const cell = funded(1000);
    cell.startOperation("build", "a", costs);
    const state = cell.getState();
    const other = funded(0);
    other.setState(state);
    expect(other.getState()).toEqual(state);
    expect(other.operations[0]?.cell).toBe(other);
  });
});
