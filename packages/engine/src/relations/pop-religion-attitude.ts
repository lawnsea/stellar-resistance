import { createAttitudeTable, type AttitudeTable } from "./attitude-relation.js";
import type { ReligionId } from "../ids.js";

export type PopReligionAttitudeTable = AttitudeTable<ReligionId>;

export function createPopReligionAttitudeTable(initialCapacity?: number): PopReligionAttitudeTable {
  return createAttitudeTable<ReligionId>(initialCapacity);
}
