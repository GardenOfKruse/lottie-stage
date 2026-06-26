import type { KeyboardEvent } from 'react';
import type { LottieClip } from '../types';
import type { useCarousel } from '../hooks/useCarousel';
import { LottieCard } from './LottieCard';
import { VISIBLE_RANGE } from '../lib/geometry';
import styles from './Stage.module.css';

type Props = {
  clips: LottieClip[];
  /**
   * Carousel state lives in the parent so `Controls` can drive the same
   * motion value. `App` is responsible for calling `useCarousel` once.
   */
  carousel: ReturnType<typeof useCarousel>;
};

/**
 * The 3D Cover Flow stage.
 *
 * Renders every clip with a real `LottieCard`, but only mounts the Lottie
 * renderer (an expensive `<canvas>`) for cards within `VISIBLE_RANGE` of
 * the active index. Far cards show their filename as a placeholder, which
 * keeps memory bounded when the user has uploaded dozens of animations.
 */
export function Stage({ clips, carousel }: Props) {
  const { scrollValue, activeIndex, goTo, next, prev, onPointerDown } = carousel;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    }
  };

  return (
    <div
      className={styles.stage}
      role="listbox"
      aria-label="Lottie stage"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
    >
      {clips.map((clip, index) => {
        const mounted = Math.abs(index - activeIndex) <= VISIBLE_RANGE;
        return (
          <LottieCard
            key={clip.id}
            clip={clip}
            index={index}
            scrollValue={scrollValue}
            isCenter={index === activeIndex}
            mounted={mounted}
            onClick={() => goTo(index)}
          />
        );
      })}
    </div>
  );
}