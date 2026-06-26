import { useEffect, useState } from 'react';
import { useLottieStore } from './hooks/useLottieStore';
import { useCarousel } from './hooks/useCarousel';
import { Stage } from './components/Stage';
import { Uploader } from './components/Uploader';
import { EmptyState } from './components/EmptyState';
import { Controls } from './components/Controls';
import styles from './App.module.css';

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

  // Auto-dismiss the toast after a short window.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const onDeleteCurrent = () => {
    const clip = clips[carousel.activeIndex];
    if (clip) removeClip(clip.id);
  };

  return (
    <div className={styles.app}>
      <div className={styles.header}>
        <h1>Lottie Stage</h1>
        <Uploader onAdd={addClips} onError={setToast} />
      </div>
      {loading ? null : clips.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <Stage clips={clips} carousel={carousel} />
          <Controls
            carousel={carousel}
            count={clips.length}
            onDeleteCurrent={onDeleteCurrent}
          />
        </>
      )}
      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}