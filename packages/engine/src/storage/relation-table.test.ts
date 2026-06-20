import { describe, expect, it } from "vitest";
import { defineRelationTable } from "./relation-table.js";

describe("defineRelationTable", () => {
  it("inserts a row and reads back source/target/fields", () => {
    const table = defineRelationTable({ fields: { weight: "f64" } });
    const id = table.insert(1, 2);
    const row = table.get(id)!;
    row.weight = 3.5;
    expect(row.source).toBe(1);
    expect(row.target).toBe(2);
    expect(row.weight).toBe(3.5);
  });

  it("looks up all rows by source", () => {
    const table = defineRelationTable({ fields: { weight: "f64" } });
    table.insert(1, 10);
    table.insert(1, 20);
    table.insert(2, 30);

    const fromOne = table.bySource(1);
    expect(fromOne).toHaveLength(2);
    expect(fromOne.map((r) => r.target).sort()).toEqual([10, 20]);

    const fromTwo = table.bySource(2);
    expect(fromTwo).toHaveLength(1);
    expect(fromTwo[0]!.target).toBe(30);
  });

  it("returns an empty array for a source with no rows", () => {
    const table = defineRelationTable({ fields: { weight: "f64" } });
    expect(table.bySource(999)).toEqual([]);
  });

  it("removes a row and drops it from the source index", () => {
    const table = defineRelationTable({ fields: { weight: "f64" } });
    const id = table.insert(1, 2);
    table.remove(id);
    expect(table.get(id)).toBeUndefined();
    expect(table.bySource(1)).toEqual([]);
  });

  it("grows past initial capacity while preserving existing rows", () => {
    const table = defineRelationTable({ fields: { weight: "f64" }, initialCapacity: 1 });
    const first = table.insert(1, 1);
    table.get(first)!.weight = 7;
    for (let i = 0; i < 10; i++) table.insert(1, i);
    expect(table.get(first)!.weight).toBe(7);
    expect(table.bySource(1)).toHaveLength(11);
  });

  it("rejects a field named 'source' or 'target'", () => {
    expect(() => defineRelationTable({ fields: { source: "u32" } })).toThrow();
    expect(() => defineRelationTable({ fields: { target: "u32" } })).toThrow();
  });
});
