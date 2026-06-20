import { describe, expect, it } from "vitest";
import { packId, unpackId, MAX_INDEX } from "./generational-id.js";

describe("generational-id", () => {
  it("round-trips index and generation", () => {
    expect(unpackId(packId(0, 0))).toEqual({ index: 0, generation: 0 });
    expect(unpackId(packId(42, 7))).toEqual({ index: 42, generation: 7 });
    expect(unpackId(packId(MAX_INDEX, 100))).toEqual({ index: MAX_INDEX, generation: 100 });
  });

  it("rejects out-of-range index", () => {
    expect(() => packId(-1, 0)).toThrow(RangeError);
    expect(() => packId(MAX_INDEX + 1, 0)).toThrow(RangeError);
  });

  it("rejects negative generation", () => {
    expect(() => packId(0, -1)).toThrow(RangeError);
  });
});
