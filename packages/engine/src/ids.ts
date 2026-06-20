declare const brand: unique symbol;

/** A number branded as a specific id kind, so ids of different entity types can't be mixed up. */
export type Branded<B extends string> = number & { readonly [brand]: B };

/**
 * Pop is the only entity with a real backing store in this package, so PopId
 * is a real generational id (see storage/generational-id.ts) produced by
 * entities/pop.ts's collection.
 */
export type PopId = Branded<"PopId">;

/**
 * Planet/Culture/Religion/Faction have no backing entity yet — these are
 * opaque placeholder ids, freely constructible (not allocated from a real
 * store), just so Pop's fields and relation tables can reference them with
 * type safety ahead of those entities being modeled.
 */
export type PlanetId = Branded<"PlanetId">;
export type CultureId = Branded<"CultureId">;
export type ReligionId = Branded<"ReligionId">;
export type FactionId = Branded<"FactionId">;

export function asPopId(id: number): PopId {
  return id as PopId;
}
export function asPlanetId(id: number): PlanetId {
  return id as PlanetId;
}
export function asCultureId(id: number): CultureId {
  return id as CultureId;
}
export function asReligionId(id: number): ReligionId {
  return id as ReligionId;
}
export function asFactionId(id: number): FactionId {
  return id as FactionId;
}

/** Religion is the one identity property the design doc marks as "may be empty." */
export const NO_RELIGION: ReligionId = asReligionId(-1);
