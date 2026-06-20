/**
 * Moves a leaky value toward a condition-derived target by a fraction of the
 * remaining gap — see design/mechanics.md's "Core architecture" tick model.
 * `rate` is the fraction of the gap closed per tick (0 = no movement, 1 =
 * snaps fully to target); fast/slow axes are expressed as different rates.
 */
export function relax(current: number, target: number, rate: number): number {
  return current + (target - current) * rate;
}
