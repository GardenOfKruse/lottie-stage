import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { animate } from 'framer-motion';
import { useLottieStore } from './hooks/useLottieStore';
import { useCarousel } from './hooks/useCarousel';
import { useStepJumper } from './hooks/useStepJumper';
import { Stage } from './components/Stage';
import { Uploader } from './components/Uploader';
import { EmptyState } from './components/EmptyState';
import { Controls } from './components/Controls';
import { Dice } from './components/Dice';
import { rollDie } from './lib/roll';
import styles from './App.module.css';

class ErrorBoundary extends Component<{ children: ReactNode }, { err: Error | null }> {
  state = { err: null as Error | null };
  static getDerivedStateFromError(err: Error) { return { err }; }
  componentDidCatch(err: Error) { console.error('App crashed:', err); }
  render() {
    if (this.state.err) {
      return (
        <div style={{ padding: 24, color: '#f88', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
          <h2>App crashed</h2>
          <pre>{String(this.state.err.stack || this.state.err.message)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * App composition root.
 *
 * Wires the persistent store (`useLottieStore`) and the carousel state
 * (`useCarousel`) to the UI tree. The carousel hook is called once at
 * the top so `Stage` and `Controls` share the same motion value and
 * active-index state.
 */
export default function App() {
  const { clips, loading, addClips, removeClip } = useLottieStore();
  const carousel = useCarousel(clips.length);
  const [toast, setToast] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [dice, setDice] = useState<{ value: number; active: boolean }>({
    value: 1,
    active: false,
  });
  // Hold the last completed roll so the user sees the result briefly after
  // the overlay fades out.
  const [lastResult, setLastResult] = useState<number | null>(null);

  const jumper = useStepJumper();
  // Track pending phase timers so we can cancel them if the user clicks
  // Roll again before the previous animation finishes.
  const pendingTimers = useRef<number[]>([]);
  const clearPending = () => {
    for (const t of pendingTimers.current) window.clearTimeout(t);
    pendingTimers.current = [];
  };
  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      pendingTimers.current = pendingTimers.current.filter((t) => t !== id);
      fn();
    }, ms);
    pendingTimers.current.push(id);
    return id;
  };
  // Keep a stable handle to the carousel so the timeouts we schedule
  // below always call the latest `goTo` even if the carousel re-inits.
  const carouselRef = useRef(carousel);
  carouselRef.current = carousel;

  // Drop any pending timers if the app unmounts.
  useEffect(() => () => clearPending(), []);

  // Auto-dismiss the toast after a short window.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Global Escape exits fullscreen — much friendlier than requiring the
  // user to focus the stage first.
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  const onDeleteCurrent = () => {
    const clip = clips[carousel.activeIndex];
    if (clip) removeClip(clip.id);
  };

  /**
   * Roll the dice in three phases:
   *   1. shake   — overlay shows, dice ticks random faces (650 ms)
   *   2. settle  — overlay hides, dice value is locked in
   *   3. step    — one card swap per step, every STEP_MS, wrapping with mod
   *
   * Each step uses a snappy tween (not a soft spring) so the cards visibly
   * click from position to position instead of gliding — that's what makes
   * the dice roll feel like a board-game die across the stage.
   *
   * Each phase uses window.setTimeout so they queue even while a previous
   * animation is still in flight.
   */
  const STEP_MS = 250;
  const SHAKE_MS = 650; // phase 1: dice ticks random faces
  const RESULT_HOLD_MS = 800; // phase 2a: lock in the result; overlay hides immediately
  const RESULT_PAUSE_MS = 500; // phase 2b: a beat of silence after overlay fades
  const WRAP_PAUSE_MS = 800; // inserted between steps when the carousel wraps from last → first

  /**
   * Snap the carousel to a specific index without the soft spring —
   * used by the dice step jumper so each step is a discrete click.
   */
  const snapTo = (i: number) => {
    carousel.scrollValue.stop();
    animate(carousel.scrollValue, i, { type: 'tween', duration: 0.18, ease: 'easeOut' });
  };

  const onRoll = () => {
    if (clips.length <= 1) return;
    jumper.cancel();
    clearPending();
    const start = Math.round(carousel.scrollValue.get());
    const value = rollDie();
    setDice({ value, active: true });
    setLastResult(null);

    // Phase 1: shake. At the end of the shake, lock the dice on the final
    // face and immediately start fading out the overlay (CSS does the fade).
    schedule(() => {
      setDice((d) => ({ ...d, active: false }));
      // Phase 2a: hold RESULT_HOLD_MS so the user reads the final face
      // even while the overlay is still mid-fade-out.
      // Phase 2b: then RESULT_PAUSE_MS more silence, then walk.
      schedule(() => {
        jumper.start({
          start,
          steps: value,
          intervalMs: STEP_MS,
          count: clips.length,
          // Pause longer BEFORE a wrap step so the user notices the
          // "looping back to the beginning" beat. 800ms matches the
          // post-shake hold so the rhythm is consistent.
          intervalAfter: ({ nextWillWrap }) => (nextWillWrap ? WRAP_PAUSE_MS : STEP_MS),
          onStep: (i) => snapTo(i),
        });
        // Stash the final result so the user sees it after the last step.
        schedule(() => setLastResult(value), value * STEP_MS + 200);
      }, RESULT_PAUSE_MS);
    }, SHAKE_MS + RESULT_HOLD_MS);
  };

  return (
    <ErrorBoundary>
    <div className={styles.app}>
      <div className={styles.header}>
        <h1>Lottie Stage</h1>
        <Uploader onAdd={addClips} onError={setToast} />
      </div>
      {loading ? null : clips.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <Stage
            clips={clips}
            carousel={carousel}
            fullscreen={fullscreen}
            onToggleFullscreen={() => setFullscreen((v) => !v)}
          />
          <Controls
            clips={clips}
            activeIndex={carousel.activeIndex}
            onDeleteCurrent={onDeleteCurrent}
            onRoll={onRoll}
          />
          <div className={styles.diceRow}>
            {lastResult !== null && !dice.active && (
              <span className={styles.diceLabel}>Last roll: {lastResult}</span>
            )}
          </div>
          <Dice value={dice.value} active={dice.active} />
          {fullscreen && (
            <div style={{ textAlign: 'center', fontSize: 12, color: '#888', marginTop: -4 }}>
              Fullscreen — double-click the stage or press Esc to exit
            </div>
          )}
        </>
      )}
      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
    </ErrorBoundary>
  );
}