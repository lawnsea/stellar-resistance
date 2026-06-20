import type { FromSchema } from "json-schema-to-ts";
import { createObjectImpl } from "../entity-schema.js";

/** How a pop came to be where it is. Matches design/entities.md's Pop identity. */
export enum Origin {
  Native = 0,
  Settler = 1,
  Conquered = 2,
}

const AttitudeSchema = {
  type: "object",
  properties: {
    fear: { type: "number" },
    fearTarget: { type: "number" },
    militancy: { type: "number" },
    militancyTarget: { type: "number" },
    loyalty: { type: "number" },
    loyaltyTarget: { type: "number" },
  },
  required: ["fear", "fearTarget", "militancy", "militancyTarget", "loyalty", "loyaltyTarget"],
  additionalProperties: false,
} as const;

/**
 * Faction/culture/religion attitudes are inlined directly as maps from
 * (stringified) target id to an attitude object, rather than referencing
 * rows in a separate AttitudeVector schema/store by id — that extraction
 * is future work, once sub-entities get their own ids.
 */
const PopSchema = {
  type: "object",
  properties: {
    size: { type: "integer", minimum: 0 },
    planet: { type: "integer" },
    culture: { type: "integer" },
    religion: { type: ["integer", "null"] },
    origin: { enum: [0, 1, 2] },
    standardOfLiving: { type: "number" },
    expectedStandardOfLiving: { type: "number" },
    tradecraft: { type: "number" },
    discipline: { type: "number" },
    factionAttitudes: { type: "object", additionalProperties: AttitudeSchema },
    culturalAttitudes: { type: "object", additionalProperties: AttitudeSchema },
    religiousAttitudes: { type: "object", additionalProperties: AttitudeSchema },
  },
  required: [
    "size",
    "planet",
    "culture",
    "religion",
    "origin",
    "standardOfLiving",
    "expectedStandardOfLiving",
    "tradecraft",
    "discipline",
    "factionAttitudes",
    "culturalAttitudes",
    "religiousAttitudes",
  ],
  additionalProperties: false,
} as const;

export interface Pop extends FromSchema<typeof PopSchema> {}

const PopObjectImplBase = createObjectImpl(PopSchema) as unknown as {
  new (values: FromSchema<typeof PopSchema>): FromSchema<typeof PopSchema>;
};

export class PopObjectImpl extends PopObjectImplBase implements Pop {}
