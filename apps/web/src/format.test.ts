import { describe, expect, test } from "vitest";
import { formatCount, formatTotalAndRate } from "./format";

describe("formatCount", () => {
  test.each([
    [117, "117"],
    [6.15, "6.2"],
    [2449, "2.4K"],
    [15300, "15.3K"],
    [1250000, "1.3M"],
  ])("formats %s as %s", (value, expected) => {
    expect(formatCount(value)).toBe(expected);
  });
});

describe("formatTotalAndRate", () => {
  test("shows the per-tick total followed by the rate", () => {
    expect(formatTotalAndRate(0.027, 4333)).toBe("117 (2.7%)");
    expect(formatTotalAndRate(0.007, 350000)).toBe("2.5K (0.7%)");
  });
});
