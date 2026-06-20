import { createAttitudeTable, type AttitudeTable } from "./attitude-relation.js";
import type { FactionId } from "../ids.js";

export type PopFactionAttitudeTable = AttitudeTable<FactionId>;

export function createPopFactionAttitudeTable(initialCapacity?: number): PopFactionAttitudeTable {
  return createAttitudeTable<FactionId>(initialCapacity);
}
