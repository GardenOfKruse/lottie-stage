import type { useCarousel } from '../hooks/useCarousel';
import styles from './Controls.module.css';

type Props = {
  carousel: ReturnType<typeof useCarousel>;
  count: number;
  onDeleteCurrent: () => void;
};

/**
 * Prev/Next arrows + a destructive Delete button for the centered card.
 * Arrow buttons disable at the ends so the user always sees the true
 * bounds of the carousel (which is intentionally non-circular).
 */
export function Controls({ carousel, count, onDeleteCurrent }: Props) {
  const { activeIndex, next, prev } = carousel;
  return (
    <div className={styles.bar}>
      <button className={styles.btn} onClick={prev} disabled={activeIndex <= 0}>
        ← Prev
      </button>
      <button className={`${styles.btn} ${styles.del}`} onClick={onDeleteCurrent}>
        Delete
      </button>
      <button
        className={styles.btn}
        onClick={next}
        disabled={activeIndex >= count - 1}
      >
        Next →
      </button>
    </div>
  );
}