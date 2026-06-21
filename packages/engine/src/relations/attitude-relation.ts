import { defineRelationTable, type RelationRow } from "../storage/relation-table.js";
import {
  fieldsFromJsonSchema,
  type BinaryFieldSchema,
  type EntityJsonSchema,
} from "../storage/json-schema-fields.js";
import type { PopId } from "../ids.js";

/**
 * Shared row shape for Pop's three attitude relations (faction/culture/
 * religion) — current value *and* target per axis, since what derives the
 * target (propagation of violence, etc.) isn't modeled yet. For v1 the
 * target is just a settable input; tick/tick.ts relaxes current toward it.
 */
const AttitudeSchema = {
  type: "object",
  properties: {
    fear: { type: "number", "x-binary": "f32" },
    fearTarget: { type: "number", "x-binary": "f32" },
    militancy: { type: "number", "x-binary": "f32" },
    militancyTarget: { type: "number", "x-binary": "f32" },
    loyalty: { type: "number", "x-binary": "f32" },
    loyaltyTarget: { type: "number", "x-binary": "f32" },
  },
} as const satisfies EntityJsonSchema<Record<string, BinaryFieldSchema>>;

export const ATTITUDE_FIELDS = fieldsFromJsonSchema(AttitudeSchema);

export type AttitudeRow = RelationRow<typeof ATTITUDE_FIELDS>;

export interface AttitudeTable<TargetId extends number> {
  /** Returns the existing row for (pop, target), or creates one (all-zero) on first contact. */
  encounter(pop: PopId, target: TargetId): number;
  get(id: number): AttitudeRow | undefined;
  byPop(pop: PopId): AttitudeRow[];
  all(): AttitudeRow[];
  readonly length: number;
}

export function createAttitudeTable<TargetId extends number>(initialCapacity?: number): AttitudeTable<TargetId> {
  const table = defineRelationTable({ fields: ATTITUDE_FIELDS, initialCapacity });

  return {
    encounter(pop: PopId, target: TargetId): number {
      for (const row of table.bySource(pop)) {
        if (row.target === target) return row.id;
      }
      return table.insert(pop, target);
    },
    get(id: number): AttitudeRow | undefined {
      return table.get(id);
    },
    byPop(pop: PopId): AttitudeRow[] {
      return table.bySource(pop);
    },
    all(): AttitudeRow[] {
      return table.all();
    },
    get length(): number {
      return table.length;
    },
  };
}
