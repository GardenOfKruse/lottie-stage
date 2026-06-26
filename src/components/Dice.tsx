import { useEffect, useState } from 'react';
import { rollDie } from '../lib/roll';
import styles from './Dice.module.css';

/**
 * Positions of the 9 cells on a 3x3 pip grid (0..8).
 * Layout:
 *   0 1 2
 *   3 4 5
 *   6 7 8
 */
const PIP_GRID: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

type Props = {
  /** Final value to display when the roll finishes (1..6). */
  value: number;
  /** When true, the die shakes and cycles through random values. */
  rolling: boolean;
};

/**
 * A small dice overlay. Driven by two props:
 * - `rolling=true`  → the dice shakes and ticks through pseudo-random faces
 *                     every ~60ms.
 * - `rolling=false` → freezes on `value`.
 *
 * We deliberately keep the shake short (≤ 800ms) so the perceived lag
 * between click and arrival is small. The actual target-jump animation
 * is handled by `useCarousel` after `rollDie()` resolves.
 */
export function Dice({ value, rolling }: Props) {
  // While rolling we ignore `value` and show our own ticker.
  const [ticker, setTicker] = useState(value);

  useEffect(() => {
    if (!rolling) {
      setTicker(value);
      return;
    }
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      setTicker(rollDie());
    };
    tick();
    const id = setInterval(tick, 60);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [rolling, value]);

  const face = rolling ? ticker : value;
  const pips = PIP_GRID[face] ?? [];

  return (
    <div
      className={`${styles.dice} ${rolling ? styles.shake : ''}`}
      role="img"
      aria-label={rolling ? 'Rolling' : `Rolled ${face}`}
      data-face={face}
    >
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className={styles.cell}
          data-on={pips.includes(i) ? '1' : '0'}
        />
      ))}
    </div>
  );
}