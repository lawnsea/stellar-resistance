export { createGameState, type GameState } from "./state/game-state.js";
export { tick } from "./tick/tick.js";
export { relax } from "./tick/relax.js";

export { Pop, Origin, createPopStore, type PopStore } from "./entities/pop.js";

export {
  asPopId,
  asPlanetId,
  asCultureId,
  asReligionId,
  asFactionId,
  NO_RELIGION,
  type PopId,
  type PlanetId,
  type CultureId,
  type ReligionId,
  type FactionId,
} from "./ids.js";

export {
  createPopFactionAttitudeTable,
  type PopFactionAttitudeTable,
} from "./relations/pop-faction-attitude.js";
export {
  createPopCultureAttitudeTable,
  type PopCultureAttitudeTable,
} from "./relations/pop-culture-attitude.js";
export {
  createPopReligionAttitudeTable,
  type PopReligionAttitudeTable,
} from "./relations/pop-religion-attitude.js";
export type { AttitudeTable, AttitudeRow } from "./relations/attitude-relation.js";
