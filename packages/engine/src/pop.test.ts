import { describe, expect, test } from "vitest";
import { createPop, defaultConfig } from "./index";

const fields = { id: "p1", size: 1200, expectedStandardOfLiving: 0.5 };

describe("createPop", () => {
  test("creates a pop", () => {
    expect(createPop(fields)).toEqual(fields);
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

  test.each([0.01, 1])("accepts expected standard of living %s", (sol) => {
    expect(
      createPop({ ...fields, expectedStandardOfLiving: sol })
        .expectedStandardOfLiving,
    ).toBe(sol);
  });

  test.each([0, -0.5, 1.01, Number.NaN])(
    "rejects expected standard of living %s",
    (sol) => {
      expect(() =>
        createPop({ ...fields, expectedStandardOfLiving: sol }),
      ).toThrow("Pop p1 expected standard of living must be in (0, 1]");
    },
  );
});
