import type { Pop } from "./pop";

export type RegionType = "rural" | "urban";

export interface Region {
  readonly id: string;
  readonly type: RegionType;
  // The region's carrying capacity: the most units of production it
  // produces per tick, however many pops work it.
  readonly productionCap: number;
  readonly pops: readonly Pop[];
}

export function createRegion(fields: Region): Region {
  const { id, type, productionCap } = fields;
  if (!(productionCap > 0) || !Number.isFinite(productionCap)) {
    throw new Error(
      `Region ${id} production cap must be a positive number, got ${productionCap}`,
    );
  }
  return { id, type, productionCap, pops: [...fields.pops] };
}
