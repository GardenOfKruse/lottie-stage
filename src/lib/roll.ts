/**
 * Dice-roll target computation.
 *
 * The Random button rolls a real 6-sided die and then walks that many
 * cards forward, wrapping around with `(current + N) % count`. So with 4
 * clips and `current = 1`, a roll of 5 lands on `(1+5) % 4 = 2`.
 *
 * Pure function so it can be unit-tested without touching the DOM.
 */

/** Uniform random integer in [1, 6]. */
export function rollDie(rng: () => number = Math.random): number {
  return Math.floor(rng() * 6) + 1;
}

/**
 * Compute the target index for a dice roll.
 *
 * @param current   index of the centered card right now
 * @param count     total number of clips (must be >= 1)
 * @param _unused   kept for symmetry with future variants; ignore
 * @param forced    pass a specific die value 1..6 to make tests deterministic
 */
export function rollTarget(current: number, count: number, _unused?: boolean, forced?: number): number {
  if (count <= 0) return 0;
  const n = forced ?? rollDie();
  // ((current % count) + (n % count)) % count keeps every operand in range.
  return ((current % count) + (n % count)) % count;
}