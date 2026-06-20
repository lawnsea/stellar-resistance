import { createAttitudeTable, type AttitudeTable } from "./attitude-relation.js";
import type { CultureId } from "../ids.js";

export type PopCultureAttitudeTable = AttitudeTable<CultureId>;

export function createPopCultureAttitudeTable(initialCapacity?: number): PopCultureAttitudeTable {
  return createAttitudeTable<CultureId>(initialCapacity);
}
