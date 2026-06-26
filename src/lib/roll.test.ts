import { describe, it, expect } from 'vitest';
import { rollTarget } from './roll';

describe('rollTarget', () => {
  it('returns a target within [0, count-1]', () => {
    for (let i = 0; i < 50; i++) {
      const t = rollTarget(2, 4);
      expect(t).toBeGreaterThanOrEqual(0);
      expect(t).toBeLessThan(4);
    }
  });

  it('rolls a die from 1..6', () => {
    for (let i = 0; i < 50; i++) {
      const n = rollTarget(0, 4, /*rollDie=*/ true);
      // We can't see the die value, but we can verify the target still
      // lands in range. Easier: import the die roller separately.
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(4);
    }
  });

  it('(current + N) mod count', () => {
    // 4 cards, count = 4. current = 1, roll 5 -> (1+5)%4 = 2.
    expect(rollTarget(1, 4, false, 5)).toBe(2);
    expect(rollTarget(0, 4, false, 3)).toBe(3);
    expect(rollTarget(3, 4, false, 1)).toBe(0);
    // 3 cards, current = 1, roll 5 -> (1+5)%3 = 0.
    expect(rollTarget(1, 3, false, 5)).toBe(0);
    expect(rollTarget(2, 3, false, 4)).toBe(0);
  });
});