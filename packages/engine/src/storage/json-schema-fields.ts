import type { FieldType } from "./schema.js";

/**
 * A field's logical JSON Schema keywords (type, minimum, enum, etc. — left
 * unconstrained here, validated by a real JSON Schema validator later) plus
 * the binary width tag the storage layer needs. "x-binary" is plain data,
 * not an API surface — reading it requires no library, unlike e.g. a zod
 * .meta() tag, which requires the zod runtime and is tied to schema
 * instance identity.
 */
export interface BinaryFieldSchema {
  readonly "x-binary": FieldType;
  readonly [keyword: string]: unknown;
}

export interface EntityJsonSchema<Properties extends Record<string, BinaryFieldSchema>> {
  readonly type: "object";
  readonly properties: Properties;
  readonly required?: readonly (keyof Properties & string)[];
}

export function fieldsFromJsonSchema<Properties extends Record<string, BinaryFieldSchema>>(
  schema: EntityJsonSchema<Properties>,
): { [K in keyof Properties]: FieldType } {
  const result = {} as { [K in keyof Properties]: FieldType };
  for (const key of Object.keys(schema.properties) as (keyof Properties & string)[]) {
    result[key] = schema.properties[key]!["x-binary"];
  }
  return result;
}
