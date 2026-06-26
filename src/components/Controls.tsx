import type { useCarousel } from '../hooks/useCarousel';
import type { LottieClip } from '../types';
import { downloadLottie } from '../lib/download';
import styles from './Controls.module.css';

export function Controls({
  carousel,
  clips,
  onDeleteCurrent,
}: {
  carousel: ReturnType<typeof useCarousel>;
  clips: LottieClip[];
  onDeleteCurrent: () => void;
}) {
  const { activeIndex, next, prev, random } = carousel;
  const current = clips[activeIndex];
  const count = clips.length;
  const hasSource = !!current?.sourceUrl;

  return (
    <div className={styles.bar}>
      <button className={styles.btn} onClick={prev} disabled={activeIndex <= 0} aria-label="Previous">
        ← Prev
      </button>

      <button
        className={styles.btn}
        onClick={() => current && downloadLottie(current.name, current.data)}
        disabled={!current}
        aria-label="Download current Lottie JSON"
      >
        ⬇ JSON
      </button>

      <button className={styles.btn} onClick={random} disabled={count <= 1} aria-label="Jump to random clip">
        🎲 Random
      </button>

      <button
        className={`${styles.btn} ${styles.del}`}
        onClick={onDeleteCurrent}
        disabled={!current}
        aria-label="Delete current clip"
      >
        Delete
      </button>

      <button className={styles.btn} onClick={next} disabled={activeIndex >= count - 1} aria-label="Next">
        Next →
      </button>

      {hasSource && current?.sourceUrl && (
        <a
          className={`${styles.btn} ${styles.link}`}
          href={current.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open original asset page"
        >
          🔗 Source
        </a>
      )}
    </div>
  );
}