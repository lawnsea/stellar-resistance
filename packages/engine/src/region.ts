export type RegionType = "rural" | "urban";

export interface Region {
  readonly id: string;
  readonly type: RegionType;
}

export function createRegion(fields: Region): Region {
  return { id: fields.id, type: fields.type };
}
