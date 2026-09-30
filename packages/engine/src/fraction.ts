// True for values in (0.0, 1.0].
export function isFraction(value: number): boolean {
  return value > 0 && value <= 1;
}
