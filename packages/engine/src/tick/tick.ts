import type { GameState } from "../state/game-state.js";
import type { AttitudeTable } from "../relations/attitude-relation.js";
import { relax } from "./relax.js";

/**
 * Per-axis relaxation rates (fraction of gap closed per tick). Fear decays
 * fast, militancy slow, loyalty inertial (slowest) — see design/mechanics.md
 * "Attitudes: Decay". Expected SoL "adapts slowly". Values are provisional
 * and tunable; the design doc doesn't specify exact numbers.
 */
const FEAR_RELAX_RATE = 0.5;
const MILITANCY_RELAX_RATE = 0.05;
const LOYALTY_RELAX_RATE = 0.01;
const EXPECTED_STANDARD_OF_LIVING_RELAX_RATE = 0.1;

function relaxExpectedStandardOfLiving(state: GameState): void {
  for (const id of state.pops.ids()) {
    const pop = state.pops.get(id)!;
    pop.expectedStandardOfLiving = relax(
      pop.expectedStandardOfLiving,
      pop.standardOfLiving,
      EXPECTED_STANDARD_OF_LIVING_RELAX_RATE,
    );
  }
}

function relaxAttitudeTable(table: AttitudeTable<number>): void {
  for (const row of table.all()) {
    row.fear = relax(row.fear, row.fearTarget, FEAR_RELAX_RATE);
    row.militancy = relax(row.militancy, row.militancyTarget, MILITANCY_RELAX_RATE);
    row.loyalty = relax(row.loyalty, row.loyaltyTarget, LOYALTY_RELAX_RATE);
  }
}

/**
 * Advances the simulation by one tick. Only the "Core architecture"
 * relaxation model is implemented for real (expected SoL toward SoL,
 * attitudes toward their per-row targets) — every other system from
 * mechanics.md (acceptance, propagation of violence, control & territory,
 * faction lifecycle, recruitment, etc.) is out of scope for this package's
 * current entity coverage (Pop only) and has no phase here yet.
 */
export function tick(state: GameState): GameState {
  relaxExpectedStandardOfLiving(state);
  relaxAttitudeTable(state.popFactionAttitudes);
  relaxAttitudeTable(state.popCultureAttitudes);
  relaxAttitudeTable(state.popReligionAttitudes);
  state.tick += 1;
  return state;
}
