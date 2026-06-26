import type { KeyboardEvent } from 'react';
import type { LottieClip } from '../types';
import type { useCarousel } from '../hooks/useCarousel';
import { LottieCard } from './LottieCard';
import styles from './Stage.module.css';

type Props = {
  clips: LottieClip[];
  /**
   * Carousel state lives in the parent so `Controls` can drive the same
   * motion value. `App` is responsible for calling `useCarousel` once.
   */
  carousel: ReturnType<typeof useCarousel>;
  /** Fullscreen enlarges the stage and tightens perspective for an "immersive" feel. */
  fullscreen?: boolean;
  /** Called on double-click — typically toggles fullscreen mode. */
  onToggleFullscreen?: () => void;
};

/**
 * The 3D Cover Flow stage.
 *
 * All clips are mounted as real Lottie players. Windowed mounting was
 * removed in v0.6.1 because re-mounting an animation can crash lottie-web
 * on certain JSON shapes (e.g. gradients with missing `s` stops) — the
 * browser throws on the second mount even though the first render works.
 * For the expected demo scale (≤ a few dozen clips) the extra canvases
 * cost less than the previous bug.
 */
export function Stage({ clips, carousel, fullscreen = false, onToggleFullscreen }: Props) {
  const { scrollValue, activeIndex, goTo, next, prev, onPointerDown } = carousel;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    } else if (e.key === 'Escape' && fullscreen) {
      e.preventDefault();
      onToggleFullscreen?.();
    }
  };

  const className = fullscreen ? `${styles.stage} ${styles.fullscreen}` : styles.stage;

  return (
    <div
      className={className}
      role="listbox"
      aria-label="Lottie stage"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      onDoubleClick={onToggleFullscreen}
    >
      {clips.map((clip, index) => (
        <LottieCard
          key={clip.id}
          clip={clip}
          index={index}
          scrollValue={scrollValue}
          isCenter={index === activeIndex}
          onClick={() => goTo(index)}
        />
      ))}
    </div>
  );
}