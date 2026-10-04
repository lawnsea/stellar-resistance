import { describe, expect, test } from "vitest";
import { Cell, createCell, createPop, Pop } from "./index";

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
      pops: [member],
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
