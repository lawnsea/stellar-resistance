import { describe, expect, test } from "vitest";
import { birthRate, deathRate, defaultConfig } from "./index";

const base = defaultConfig.baseBirthRate;
const baseDeath = defaultConfig.baseDeathRate;

describe("birthRate", () => {
  test("is the base rate at a standard of living of 1.0", () => {
    expect(birthRate(1)).toBe(base);
  });

  test("rises above 1.0 with diminishing returns", () => {
    const [a, b, c] = [birthRate(1), birthRate(1.5), birthRate(2)];
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
    expect(c - b).toBeLessThan(b - a);
  });

  test("falls below 1.0 with diminishing returns", () => {
    const [a, b, c] = [birthRate(1), birthRate(0.5), birthRate(0)];
    expect(b).toBeLessThan(a);
    expect(c).toBeLessThan(b);
    expect(b - c).toBeLessThan(a - b);
  });

  test("is zero at a standard of living of 0.0", () => {
    expect(birthRate(0)).toBe(0);
  });
});

describe("deathRate", () => {
  test("is the base rate at a standard of living of 1.0", () => {
    expect(deathRate(1)).toBe(baseDeath);
  });

  test("rises below 1.0 with diminishing returns", () => {
    const [a, b, c] = [deathRate(1), deathRate(0.5), deathRate(0)];
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
    expect(c - b).toBeLessThan(b - a);
  });

  test("reaches base × (1 + starvationDeathMultiplier) at 0.0", () => {
    expect(deathRate(0)).toBeCloseTo(
      baseDeath * (1 + defaultConfig.starvationDeathMultiplier),
    );
  });

  test("falls above 1.0 with diminishing returns", () => {
    const [a, b, c] = [deathRate(1), deathRate(1.5), deathRate(2)];
    expect(b).toBeLessThan(a);
    expect(c).toBeLessThan(b);
    expect(b - c).toBeLessThan(a - b);
  });

  test("never goes below zero", () => {
    expect(deathRate(1e9)).toBeGreaterThan(0);
  });
});
