import { Component, useEffect, useState, type ReactNode } from 'react';
import { useLottieStore } from './hooks/useLottieStore';
import { useCarousel } from './hooks/useCarousel';
import { Stage } from './components/Stage';
import { Uploader } from './components/Uploader';
import { EmptyState } from './components/EmptyState';
import { Controls } from './components/Controls';
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
            carousel={carousel}
            clips={clips}
            onDeleteCurrent={onDeleteCurrent}
          />
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