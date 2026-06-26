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
  /** When true the overlay is shown. */
  active: boolean;
  /**
   * When true (default) the dice shakes and ticks through random faces.
   * Set false to freeze the dice on the final value while keeping the
   * overlay visible — gives the user a beat to read the result.
   */
  shaking?: boolean;
};

/**
 * Full-screen dice overlay. Renders only while `active` is true; fades in
 * via a CSS transition. While `shaking` is true the dice ticks random faces;
 * when `shaking` goes false the dice freezes on `value` but stays on screen
 * for as long as `active` remains true.
 *
 * The overlay sits above every card (z-index 9999) and dims the rest of
 * the page so the dice is unmistakably the focus.
 */
export function Dice({ value, active, shaking = active }: Props) {
  const [ticker, setTicker] = useState(value);

  useEffect(() => {
    if (!shaking) {
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
  }, [shaking, value]);

  // Always render so the CSS transition runs both directions cleanly.
  // Hide it via `visible` class — `display: none` would skip the fade.
  const face = shaking ? ticker : value;
  const pips = PIP_GRID[face] ?? [];

  return (
    <div
      className={`${styles.overlay} ${active ? styles.visible : ''}`}
      aria-hidden={!active}
      data-testid="dice-overlay"
    >
      <div
        className={`${styles.dice} ${shaking ? styles.shake : ''}`}
        role="img"
        aria-label={shaking ? 'Rolling' : `Rolled ${face}`}
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