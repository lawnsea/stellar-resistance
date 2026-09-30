import type { Pop } from "./pop";

export type RegionType = "rural" | "urban";

export interface Region {
  readonly id: string;
  readonly type: RegionType;
  readonly pops: readonly Pop[];
}

export function createRegion(fields: Region): Region {
  return { id: fields.id, type: fields.type, pops: [...fields.pops] };
}
