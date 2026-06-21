import { defineEntitySchema, type EntityView } from "../storage/schema.js";
import {
  fieldsFromJsonSchema,
  type BinaryFieldSchema,
  type EntityJsonSchema,
} from "../storage/json-schema-fields.js";
import {
  asPopId,
  asPlanetId,
  asCultureId,
  asReligionId,
  NO_RELIGION,
  type PopId,
  type PlanetId,
  type CultureId,
  type ReligionId,
} from "../ids.js";

/** How a pop came to be where it is. Matches design/entities.md's Pop identity. */
export enum Origin {
  Native = 0,
  Settler = 1,
  Conquered = 2,
}

const PopSchema = {
  type: "object",
  properties: {
    size: { type: "integer", minimum: 0, "x-binary": "u32" },
    planet: { type: "integer", "x-binary": "u32" },
    culture: { type: "integer", "x-binary": "u32" },
    religion: { type: "integer", "x-binary": "i32" },
    origin: { enum: [0, 1, 2], "x-binary": "u8" },
    standardOfLiving: { type: "number", "x-binary": "f64" },
    expectedStandardOfLiving: { type: "number", "x-binary": "f64" },
    tradecraft: { type: "number", "x-binary": "f32" },
    discipline: { type: "number", "x-binary": "f32" },
  },
} as const satisfies EntityJsonSchema<Record<string, BinaryFieldSchema>>;

const POP_FIELDS = fieldsFromJsonSchema(PopSchema);

type PopRawView = EntityView<typeof POP_FIELDS>;

/** Typed accessor over a Pop's raw buffer-backed fields. */
export class Pop {
  readonly #raw: PopRawView;

  constructor(raw: PopRawView) {
    this.#raw = raw;
  }

  get id(): PopId {
    return asPopId(this.#raw.id);
  }

  get size(): number {
    return this.#raw.size;
  }
  set size(value: number) {
    this.#raw.size = value;
  }

  get planet(): PlanetId {
    return asPlanetId(this.#raw.planet);
  }
  set planet(value: PlanetId) {
    this.#raw.planet = value;
  }

  get culture(): CultureId {
    return asCultureId(this.#raw.culture);
  }
  set culture(value: CultureId) {
    this.#raw.culture = value;
  }

  /** NO_RELIGION if this pop has no religion. */
  get religion(): ReligionId {
    return asReligionId(this.#raw.religion);
  }
  set religion(value: ReligionId) {
    this.#raw.religion = value;
  }

  get origin(): Origin {
    return this.#raw.origin as Origin;
  }
  set origin(value: Origin) {
    this.#raw.origin = value;
  }

  /** Raw stored input for v1 — not yet derived from production/acceptance. */
  get standardOfLiving(): number {
    return this.#raw.standardOfLiving;
  }
  set standardOfLiving(value: number) {
    this.#raw.standardOfLiving = value;
  }

  /** Relaxes toward standardOfLiving each tick (see tick/tick.ts). */
  get expectedStandardOfLiving(): number {
    return this.#raw.expectedStandardOfLiving;
  }
  set expectedStandardOfLiving(value: number) {
    this.#raw.expectedStandardOfLiving = value;
  }

  get tradecraft(): number {
    return this.#raw.tradecraft;
  }
  set tradecraft(value: number) {
    this.#raw.tradecraft = value;
  }

  get discipline(): number {
    return this.#raw.discipline;
  }
  set discipline(value: number) {
    this.#raw.discipline = value;
  }
}

export interface PopStore {
  alloc(): PopId;
  free(id: PopId): void;
  get(id: PopId): Pop | undefined;
  ids(): PopId[];
  readonly length: number;
  readonly capacity: number;
}

export function createPopStore(initialCapacity?: number): PopStore {
  const raw = defineEntitySchema({ fields: POP_FIELDS, initialCapacity });

  return {
    alloc(): PopId {
      const id = raw.alloc();
      // Override the generic zero-default: 0 is a real ReligionId, so the
      // "no religion" case needs its own sentinel rather than relying on
      // zero-initialization.
      raw.get(id)!.religion = NO_RELIGION;
      return asPopId(id);
    },
    free(id: PopId): void {
      raw.free(id);
    },
    get(id: PopId): Pop | undefined {
      const view = raw.get(id);
      return view ? new Pop(view) : undefined;
    },
    ids(): PopId[] {
      return raw.ids().map(asPopId);
    },
    get length(): number {
      return raw.length;
    },
    get capacity(): number {
      return raw.capacity;
    },
  };
}
