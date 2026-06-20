import { describe, expect, it } from "vitest";
import { createGameState } from "./game-state.js";

describe("createGameState", () => {
  it("starts at tick 0 with empty stores", () => {
    const state = createGameState();
    expect(state.tick).toBe(0);
    expect(state.pops.length).toBe(0);
    expect(state.popFactionAttitudes.length).toBe(0);
    expect(state.popCultureAttitudes.length).toBe(0);
    expect(state.popReligionAttitudes.length).toBe(0);
  });
});
