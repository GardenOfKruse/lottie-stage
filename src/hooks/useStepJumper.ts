import { useCallback, useEffect, useRef, useState } from 'react';

type Options = {
  /** Total number of steps to walk. */
  steps: number;
  /** How many ms to wait between steps. */
  intervalMs: number;
  /**
   * Optional per-step interval override. Return the desired delay (ms)
   * before the NEXT step after the one just fired. The `nextWillWrap`
   * flag tells you whether the upcoming step will cross the end-of-list
   * seam, which is the natural place to insert a longer pause.
   */
  intervalAfter?: (info: { index: number; wrapped: boolean; nextWillWrap: boolean }) => number;
  /**
   * Called once for each step with the new index AND whether this step
   * just wrapped around the end of the carousel (the index is small
   * while the previous step was near the end). Consumers can use this
   * to pause longer at the seam.
   */
  onStep: (index: number, info: { wrapped: boolean }) => void;
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
    let prev = opts.start;
    const tick = () => {
      i += 1;
      if (i > opts.steps) {
        timerRef.current = null;
        setIsRunning(false);
        return;
      }
      const next = (opts.start + i) % opts.count;
      // Wrap detected when we cross from the last card (or beyond) back
      // to the first card. Use the count boundary, not the start index,
      // so a multi-lap roll reports each seam.
      const wrapped = prev >= opts.count - 1 && next === 0;
      opts.onStep(next, { wrapped });
      prev = next;
      // Choose the wait for the NEXT tick. If the next tick would be a
      // wrap step, give the user a longer beat so they notice the seam.
      const nextNext = (opts.start + i + 1) % opts.count;
      const nextWillWrap = next >= opts.count - 1 && nextNext === 0;
      const wait = opts.intervalAfter
        ? opts.intervalAfter({ index: next, wrapped, nextWillWrap })
        : opts.intervalMs;
      timerRef.current = window.setTimeout(tick, wait);
    };
    // Fire the first step after one interval (so the user sees the dice
    // settle before the carousel starts moving).
    timerRef.current = window.setTimeout(tick, opts.intervalMs);
  }, [cancel]);

  // Clean up on unmount.
  useEffect(() => () => cancel(), [cancel]);

  return { isRunning, start, cancel };
}