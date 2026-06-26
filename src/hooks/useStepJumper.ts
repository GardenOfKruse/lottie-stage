import { useCallback, useEffect, useRef, useState } from 'react';

type Options = {
  /** Total number of cards to visit. */
  steps: number;
  /** How many ms to wait between steps. */
  intervalMs: number;
  /**
   * Called once for each step with the new index. Implementations
   * typically wrap `carousel.goTo(i)` or `animate(scrollValue, i, …)`.
   */
  onStep: (index: number) => void;
  /** Starting index — the first onStep fires for `start + 1` after one tick. */
  start: number;
  /** Total cards (used for mod-wrap). */
  count: number;
};

/**
 * Sequentially walk through N steps, calling `onStep` every `intervalMs`.
 * Wraps around with `(current + 1) % count`.
 *
 * Returns:
 * - `isRunning` — true while steps are still being scheduled.
 * - `cancel()`  — stop early (e.g. if the user manually navigates).
 *
 * Internal timer is held in a ref so re-renders don't reset it.
 */
export function useStepJumper() {
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const start = useCallback((opts: Options) => {
    cancel();
    if (opts.steps <= 0 || opts.count <= 1) return;

    setIsRunning(true);
    let i = 0;
    const tick = () => {
      i += 1;
      if (i > opts.steps) {
        timerRef.current = null;
        setIsRunning(false);
        return;
      }
      const next = (opts.start + i) % opts.count;
      opts.onStep(next);
      timerRef.current = window.setTimeout(tick, opts.intervalMs);
    };
    // Fire the first step after one interval (so the user sees the dice
    // settle before the carousel starts moving).
    timerRef.current = window.setTimeout(tick, opts.intervalMs);
  }, [cancel]);

  // Clean up on unmount.
  useEffect(() => () => cancel(), [cancel]);

  return { isRunning, start, cancel };
}