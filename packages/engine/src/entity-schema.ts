import type { JSONSchema } from "json-schema-to-ts";

/**
 * Builds a plain-object implementation class for an entity defined by a
 * JSON Schema. The schema only drives typing at each call site (via
 * FromSchema<typeof TheSchema>, cast on there, not here) — evaluating
 * FromSchema against this function's own generic, unresolved `S extends
 * JSONSchema` bound (rather than a concrete literal schema type) blows
 * past TS's type-instantiation-depth limit. The runtime behavior is
 * schema-shape-agnostic regardless, since a plain object can hold any
 * shape. A future EntityNameBufferImpl would satisfy the same interface
 * with a binary-backed implementation instead.
 */
export function createObjectImpl<S extends JSONSchema>(_schema: S): new (values: Record<string, unknown>) => object {
  return class ObjectImpl {
    constructor(values: Record<string, unknown>) {
      Object.assign(this, values);
    }
  };
}
