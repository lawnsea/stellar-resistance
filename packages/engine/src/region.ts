import { isFraction } from "./fraction";
import type { Pop } from "./pop";

export type RegionType = "rural" | "urban";

export interface Region {
  readonly id: string;
  readonly type: RegionType;
  readonly productivity: number;
  readonly pops: readonly Pop[];
}

export function createRegion(fields: Region): Region {
  if (!isFraction(fields.productivity)) {
    throw new Error(
      `Region ${fields.id} productivity must be in (0, 1], got ${fields.productivity}`,
    );
  }
  return {
    id: fields.id,
    type: fields.type,
    productivity: fields.productivity,
    pops: [...fields.pops],
  };
}
