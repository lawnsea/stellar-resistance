import { createPopStore, type PopStore } from "../entities/pop.js";
import { createPopFactionAttitudeTable, type PopFactionAttitudeTable } from "../relations/pop-faction-attitude.js";
import { createPopCultureAttitudeTable, type PopCultureAttitudeTable } from "../relations/pop-culture-attitude.js";
import { createPopReligionAttitudeTable, type PopReligionAttitudeTable } from "../relations/pop-religion-attitude.js";

export interface GameState {
  readonly pops: PopStore;
  readonly popFactionAttitudes: PopFactionAttitudeTable;
  readonly popCultureAttitudes: PopCultureAttitudeTable;
  readonly popReligionAttitudes: PopReligionAttitudeTable;
  tick: number;
}

export function createGameState(): GameState {
  return {
    pops: createPopStore(),
    popFactionAttitudes: createPopFactionAttitudeTable(),
    popCultureAttitudes: createPopCultureAttitudeTable(),
    popReligionAttitudes: createPopReligionAttitudeTable(),
    tick: 0,
  };
}
