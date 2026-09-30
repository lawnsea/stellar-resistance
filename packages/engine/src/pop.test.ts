import { describe, expect, test } from "vitest";
import { createPop, defaultConfig } from "./index";

describe("createPop", () => {
  test("creates a pop", () => {
    expect(createPop({ id: "p1", size: 1200 })).toEqual({
      id: "p1",
      size: 1200,
    });
  });

  test("accepts sizes from 1 to the maximum", () => {
    expect(createPop({ id: "p1", size: 1 }).size).toBe(1);
    expect(createPop({ id: "p1", size: defaultConfig.maxPopSize }).size).toBe(
      5000,
    );
  });

  test.each([0, -1, 5001, 1.5, Number.NaN])("rejects size %s", (size) => {
    expect(() => createPop({ id: "p1", size })).toThrow(
      "Pop p1 size must be an integer from 1 to 5000",
    );
  });

  test("uses the given config's maximum", () => {
    const config = { maxPopSize: 10 };
    expect(createPop({ id: "p1", size: 10 }, config).size).toBe(10);
    expect(() => createPop({ id: "p1", size: 11 }, config)).toThrow(
      "from 1 to 10",
    );
  });
});
