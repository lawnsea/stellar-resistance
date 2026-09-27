export interface Region {
  readonly id: string;
  readonly name: string;
}

export interface Planet {
  readonly id: string;
  readonly name: string;
  readonly regions: readonly Region[];
}

export function createRegion(fields: Region): Region {
  return { id: fields.id, name: fields.name };
}

export function createPlanet(fields: Planet): Planet {
  if (fields.regions.length === 0) {
    throw new Error(`Planet ${fields.id} must have at least one region`);
  }
  return { id: fields.id, name: fields.name, regions: [...fields.regions] };
}
