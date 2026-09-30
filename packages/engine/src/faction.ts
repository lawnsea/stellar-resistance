export interface Faction {
  readonly id: string;
  readonly name: string;
}

export function createFaction(fields: Faction): Faction {
  return { id: fields.id, name: fields.name };
}
