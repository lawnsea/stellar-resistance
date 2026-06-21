import { describe, expect, it } from "vitest";
import { fieldsFromJsonSchema } from "./json-schema-fields.js";

describe("fieldsFromJsonSchema", () => {
  it("extracts the binary FieldType for every property", () => {
    const schema = {
      type: "object",
      properties: {
        a: { type: "integer", "x-binary": "u8" },
        b: { type: "integer", "x-binary": "u16" },
        c: { type: "integer", "x-binary": "u32" },
        d: { type: "integer", "x-binary": "i32" },
        e: { type: "number", "x-binary": "f32" },
        f: { type: "number", "x-binary": "f64" },
      },
    } as const;

    expect(fieldsFromJsonSchema(schema)).toEqual({
      a: "u8",
      b: "u16",
      c: "u32",
      d: "i32",
      e: "f32",
      f: "f64",
    });
  });

  it("ignores logical JSON Schema keywords other than x-binary", () => {
    const schema = {
      type: "object",
      properties: {
        size: { type: "integer", minimum: 0, "x-binary": "u32" },
        origin: { enum: [0, 1, 2], "x-binary": "u8" },
      },
      required: ["size"],
    } as const;

    expect(fieldsFromJsonSchema(schema)).toEqual({ size: "u32", origin: "u8" });
  });

  it("returns an empty object for a schema with no properties", () => {
    const schema = { type: "object", properties: {} } as const;
    expect(fieldsFromJsonSchema(schema)).toEqual({});
  });
});
