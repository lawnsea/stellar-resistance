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

  test("rises by prosperityResponse × base at 2.0", () => {
    expect(birthRate(2)).toBeCloseTo(
      base * (1 + defaultConfig.prosperityResponse),
      6,
    );
  });

  test("higher prosperity curvature front-loads the rise", () => {
    const steep = { ...defaultConfig, prosperityCurvature: 10 };
    expect(birthRate(1.2, steep)).toBeGreaterThan(birthRate(1.2));
    expect(birthRate(2, steep)).toBeCloseTo(birthRate(2), 6);
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

  test("reaches base × (1 + deprivationResponse) at 0.0", () => {
    expect(deathRate(0)).toBeCloseTo(
      baseDeath * (1 + defaultConfig.deprivationResponse),
      6,
    );
  });

  test("falls above 1.0 with diminishing returns", () => {
    const [a, b, c] = [deathRate(1), deathRate(1.5), deathRate(2)];
    expect(b).toBeLessThan(a);
    expect(c).toBeLessThan(b);
    expect(b - c).toBeLessThan(a - b);
  });

  test("deprivationResponse sets the death rate at 0.0", () => {
    const harsh = { ...defaultConfig, deprivationResponse: 9 };
    expect(deathRate(0, harsh)).toBeCloseTo(baseDeath * 10, 6);
  });

  test("higher deprivation curvature front-loads the rise", () => {
    const steep = { ...defaultConfig, deprivationCurvature: 20 };
    expect(deathRate(0.9, steep)).toBeGreaterThan(deathRate(0.9));
    expect(deathRate(0, steep)).toBeCloseTo(deathRate(0), 6);
  });

  test("never goes below zero", () => {
    expect(deathRate(1e9)).toBeGreaterThan(0);
  });
});
