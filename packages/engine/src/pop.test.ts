import { describe, expect, test } from "vitest";
import { createPop, defaultConfig } from "./index";

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

  test.each([1, 2.5])("accepts expected standard of living %s", (sol) => {
    expect(
      createPop({ ...fields, expectedStandardOfLiving: sol })
        .expectedStandardOfLiving,
    ).toBe(sol);
  });

  test.each([0.99, 0, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects expected standard of living %s",
    (sol) => {
      expect(() =>
        createPop({ ...fields, expectedStandardOfLiving: sol }),
      ).toThrow("Pop p1 expected standard of living must be at least 1");
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
