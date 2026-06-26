import { useEffect, useState } from 'react';
import { rollDie } from '../lib/roll';
import styles from './Dice.module.css';

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
  /** When true the overlay is shown AND the dice shakes. */
  active: boolean;
};

/**
 * Full-screen dice overlay. Renders only while `active` is true; fades in
 * via a CSS transition. While active it shakes and ticks through random
 * faces; when it goes inactive it freezes on `value`.
 *
 * The overlay sits above every card (z-index 9999) and dims the rest of
 * the page so the dice is unmistakably the focus.
 */
export function Dice({ value, active }: Props) {
  const [ticker, setTicker] = useState(value);

  useEffect(() => {
    if (!active) {
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
  }, [active, value]);

  // Always render so the CSS transition runs both directions cleanly.
  // Hide it via `visible` class — `display: none` would skip the fade.
  const face = active ? ticker : value;
  const pips = PIP_GRID[face] ?? [];

  return (
    <div
      className={`${styles.overlay} ${active ? styles.visible : ''}`}
      aria-hidden={!active}
      data-testid="dice-overlay"
    >
      <div
        className={`${styles.dice} ${active ? styles.shake : ''}`}
        role="img"
        aria-label={active ? 'Rolling' : `Rolled ${face}`}
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
    </div>
  );
}