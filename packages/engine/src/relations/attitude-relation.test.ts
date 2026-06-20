import { describe, expect, it } from "vitest";
import { createAttitudeTable } from "./attitude-relation.js";
import { asFactionId, asPopId } from "../ids.js";

describe("createAttitudeTable", () => {
  it("creates a zero-initialized row on first contact", () => {
    const table = createAttitudeTable<ReturnType<typeof asFactionId>>();
    const pop = asPopId(1);
    const faction = asFactionId(10);

    const id = table.encounter(pop, faction);
    const row = table.get(id)!;
    expect(row.fear).toBe(0);
    expect(row.militancy).toBe(0);
    expect(row.loyalty).toBe(0);
  });

  it("returns the same row on repeated encounters with the same target", () => {
    const table = createAttitudeTable<ReturnType<typeof asFactionId>>();
    const pop = asPopId(1);
    const faction = asFactionId(10);

    const first = table.encounter(pop, faction);
    table.get(first)!.fear = 0.5;
    const second = table.encounter(pop, faction);

    expect(second).toBe(first);
    expect(table.get(second)!.fear).toBe(0.5);
  });

  it("tracks separate rows per target for the same pop", () => {
    const table = createAttitudeTable<ReturnType<typeof asFactionId>>();
    const pop = asPopId(1);
    const factionA = asFactionId(10);
    const factionB = asFactionId(20);

    table.encounter(pop, factionA);
    table.encounter(pop, factionB);

    expect(table.byPop(pop)).toHaveLength(2);
  });
});
