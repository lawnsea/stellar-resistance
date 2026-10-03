import { describe, expect, test } from "vitest";
import {
  birthRate,
  createPop,
  deathRate,
  defaultConfig,
  nextExpectedStandardOfLiving,
} from "./index";

const fields = {
  id: "p1",
  size: 1200,
  expectedStandardOfLiving: 1.2,
  actualStandardOfLiving: 0.8,
};

describe("createPop", () => {
  test("creates a pop", () => {
    expect(createPop(fields)).toEqual(fields);
  });

  test("actual standard of living defaults to 1.0", () => {
    const { actualStandardOfLiving: _, ...rest } = fields;
    expect(createPop(rest).actualStandardOfLiving).toBe(1);
  });

  test("accepts sizes from 1 to the maximum", () => {
    expect(createPop({ ...fields, size: 1 }).size).toBe(1);
    expect(createPop({ ...fields, size: defaultConfig.maxPopSize }).size).toBe(
      5000,
    );
  });

  test.each([0, -1, 5001, 1.5, Number.NaN])("rejects size %s", (size) => {
    expect(() => createPop({ ...fields, size })).toThrow(
      "Pop p1 size must be an integer from 1 to 5000",
    );
  });

  test("uses the given config's maximum", () => {
    const config = { ...defaultConfig, maxPopSize: 10 };
    expect(createPop({ ...fields, size: 10 }, config).size).toBe(10);
    expect(() => createPop({ ...fields, size: 11 }, config)).toThrow(
      "from 1 to 10",
    );
  });

  test.each([0, 0.5, 2.5])("accepts expected standard of living %s", (sol) => {
    expect(
      createPop({ ...fields, expectedStandardOfLiving: sol })
        .expectedStandardOfLiving,
    ).toBe(sol);
  });

  test.each([-0.1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects expected standard of living %s",
    (sol) => {
      expect(() =>
        createPop({ ...fields, expectedStandardOfLiving: sol }),
      ).toThrow("Pop p1 expected standard of living must be at least 0");
    },
  );

  test.each([0, 0.5, 1.5])("accepts actual standard of living %s", (sol) => {
    expect(
      createPop({ ...fields, actualStandardOfLiving: sol })
        .actualStandardOfLiving,
    ).toBe(sol);
  });

  test.each([-0.1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects actual standard of living %s",
    (sol) => {
      expect(() =>
        createPop({ ...fields, actualStandardOfLiving: sol }),
      ).toThrow("Pop p1 actual standard of living must be at least 0");
    },
  );
});

const expectationConfig = {
  ...defaultConfig,
  expectationAdjustmentRate: 0.5,
};

describe("nextExpectedStandardOfLiving", () => {
  test("moves toward actual, dampened by the adjustment rate", () => {
    expect(nextExpectedStandardOfLiving(2, 3, expectationConfig)).toBeCloseTo(
      2.5,
    );
    expect(nextExpectedStandardOfLiving(2, 1.5, expectationConfig)).toBeCloseTo(
      1.75,
    );
  });

  test("can fall below 1.0", () => {
    expect(
      nextExpectedStandardOfLiving(1.2, 0.2, expectationConfig),
    ).toBeCloseTo(0.7);
  });
});

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
