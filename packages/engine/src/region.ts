import type { Pop } from "./pop";

export type RegionType = "rural" | "urban";

export interface Region {
  readonly id: string;
  readonly type: RegionType;
  readonly pops: readonly Pop[];
}

export function createRegion(fields: Region): Region {
  if (fields.pops.length === 0) {
    throw new Error(`Region ${fields.id} must have at least one pop`);
  }
  return { id: fields.id, type: fields.type, pops: [...fields.pops] };
}
