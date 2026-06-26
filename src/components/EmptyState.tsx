import styles from './Uploader.module.css';

/**
 * Shown when there are zero clips in the store. The `<Uploader>` above
 * is always present, so users already have a place to drop files; this
 * just makes the empty canvas explicit so the page doesn't look broken.
 */
export function EmptyState() {
  return (
    <div className={styles.empty}>
      <h2>No animations yet</h2>
      <p>Drag &amp; drop Lottie JSON files anywhere, or use the upload box above.</p>
    </div>
  );
}