import { describe, expect, it } from "vitest";
import { createGameState } from "../state/game-state.js";
import { tick } from "./tick.js";
import { asFactionId } from "../ids.js";

describe("tick", () => {
  it("increments the tick counter", () => {
    const state = createGameState();
    tick(state);
    tick(state);
    expect(state.tick).toBe(2);
  });

  it("relaxes a pop's expected standard of living toward its standard of living", () => {
    const state = createGameState();
    const id = state.pops.alloc();
    const pop = state.pops.get(id)!;
    pop.standardOfLiving = 1;
    pop.expectedStandardOfLiving = 0;

    tick(state);

    expect(pop.expectedStandardOfLiving).toBeGreaterThan(0);
    expect(pop.expectedStandardOfLiving).toBeLessThan(1);
  });

  it("relaxes pop-faction attitudes toward their per-row targets", () => {
    const state = createGameState();
    const popId = state.pops.alloc();
    const faction = asFactionId(1);
    const rowId = state.popFactionAttitudes.encounter(popId, faction);
    const row = state.popFactionAttitudes.get(rowId)!;
    row.fearTarget = 1;
    row.militancyTarget = 1;
    row.loyaltyTarget = 1;

    tick(state);

    const after = state.popFactionAttitudes.get(rowId)!;
    expect(after.fear).toBeGreaterThan(0);
    expect(after.militancy).toBeGreaterThan(0);
    expect(after.loyalty).toBeGreaterThan(0);
    // fear decays fastest, loyalty slowest (most inertial)
    expect(after.fear).toBeGreaterThan(after.militancy);
    expect(after.militancy).toBeGreaterThan(after.loyalty);
  });

  it("converges expected SoL to SoL over many ticks", () => {
    const state = createGameState();
    const id = state.pops.alloc();
    const pop = state.pops.get(id)!;
    pop.standardOfLiving = 0.5;
    pop.expectedStandardOfLiving = 0;

    for (let i = 0; i < 200; i++) tick(state);

    expect(pop.expectedStandardOfLiving).toBeCloseTo(0.5, 5);
  });
});
