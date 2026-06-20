import { defineEntitySchema, type FieldType } from "./schema.js";

export interface RelationTableConfig<Fields extends Record<string, FieldType>> {
  readonly fields: Fields;
  readonly initialCapacity?: number;
}

export type RelationRow<Fields extends Record<string, FieldType>> = {
  readonly id: number;
  source: number;
  target: number;
} & {
  -readonly [K in keyof Fields]: number;
};

export interface RelationTable<Fields extends Record<string, FieldType>> {
  insert(source: number, target: number): number;
  remove(id: number): void;
  get(id: number): RelationRow<Fields> | undefined;
  /** All rows whose `source` matches, in unspecified order. */
  bySource(source: number): RelationRow<Fields>[];
  /** Every row in the table, in unspecified order. */
  all(): RelationRow<Fields>[];
  readonly length: number;
}

const RESERVED_FIELD_NAMES = ["source", "target"] as const;

/**
 * A growable, buffer-backed table of fixed-stride (source, target, ...fields)
 * rows, for the variable-length relational data (attitudes, memberships,
 * etc.) that doesn't fit a fixed-size entity record. Row storage reuses the
 * same growable schema machinery as entities; a plain Map indexes rows by
 * `source` for fast lookup (the index itself isn't buffer-backed — it's
 * bookkeeping over row ids, not game state).
 */
export function defineRelationTable<Fields extends Record<string, FieldType>>(
  config: RelationTableConfig<Fields>,
): RelationTable<Fields> {
  for (const reserved of RESERVED_FIELD_NAMES) {
    if (reserved in config.fields) {
      throw new Error(`field name "${reserved}" is reserved`);
    }
  }

  const rows = defineEntitySchema({
    fields: { source: "u32", target: "u32", ...config.fields } as { source: "u32"; target: "u32" } & Fields,
    layout: "aos",
    initialCapacity: config.initialCapacity,
  });

  const bySourceIndex = new Map<number, Set<number>>();

  function addToIndex(source: number, rowId: number): void {
    let set = bySourceIndex.get(source);
    if (!set) {
      set = new Set();
      bySourceIndex.set(source, set);
    }
    set.add(rowId);
  }

  function removeFromIndex(source: number, rowId: number): void {
    const set = bySourceIndex.get(source);
    if (!set) return;
    set.delete(rowId);
    if (set.size === 0) bySourceIndex.delete(source);
  }

  return {
    insert(source: number, target: number): number {
      const id = rows.alloc();
      const row = rows.get(id)!;
      row.source = source;
      row.target = target;
      addToIndex(source, id);
      return id;
    },
    remove(id: number): void {
      const row = rows.get(id);
      if (!row) return;
      removeFromIndex(row.source, id);
      rows.free(id);
    },
    get(id: number): RelationRow<Fields> | undefined {
      return rows.get(id) as RelationRow<Fields> | undefined;
    },
    bySource(source: number): RelationRow<Fields>[] {
      const set = bySourceIndex.get(source);
      if (!set) return [];
      const result: RelationRow<Fields>[] = [];
      for (const id of set) {
        const row = rows.get(id);
        if (row) result.push(row as RelationRow<Fields>);
      }
      return result;
    },
    all(): RelationRow<Fields>[] {
      return rows.ids().map((id) => rows.get(id) as RelationRow<Fields>);
    },
    get length(): number {
      return rows.length;
    },
  };
}
