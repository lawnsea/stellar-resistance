import { describe, expect, it } from "vitest";
import { relax } from "./relax.js";

describe("relax", () => {
  it("moves toward the target by the given rate", () => {
    expect(relax(0, 10, 0.5)).toBe(5);
    expect(relax(10, 0, 0.5)).toBe(5);
  });

  it("doesn't move when rate is 0", () => {
    expect(relax(3, 10, 0)).toBe(3);
  });

  it("snaps fully to target when rate is 1", () => {
    expect(relax(3, 10, 1)).toBe(10);
  });

  it("doesn't move when already at target", () => {
    expect(relax(5, 5, 0.5)).toBe(5);
  });

  it("converges toward target over repeated applications", () => {
    let current = 0;
    for (let i = 0; i < 50; i++) current = relax(current, 1, 0.1);
    expect(current).toBeGreaterThan(0.99);
    expect(current).toBeLessThanOrEqual(1);
  });
});
