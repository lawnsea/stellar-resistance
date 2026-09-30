import { describe, expect, test } from "vitest";
import { defaultConfig, nextExpectedStandardOfLiving } from "./index";

const config = {
  ...defaultConfig,
  productionRate: 1,
  expectationAdjustmentRate: 0.5,
};

describe("nextExpectedStandardOfLiving", () => {
  test("moves toward actual, dampened by the adjustment rate", () => {
    expect(nextExpectedStandardOfLiving(2, 3, config)).toBeCloseTo(2.5);
    expect(nextExpectedStandardOfLiving(2, 1.5, config)).toBeCloseTo(1.75);
  });

  test("can fall below 1.0", () => {
    expect(nextExpectedStandardOfLiving(1.2, 0.2, config)).toBeCloseTo(0.7);
  });
});
