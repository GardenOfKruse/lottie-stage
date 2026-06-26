import { useEffect, useRef } from 'react';
// lottie-react publishes the player as the module's `default` export; under
// Vite's CJS interop the bare import can resolve to the namespace object.
// Pick whichever shape we got so the JSX below always sees the component.
import LottieModule, { type LottieRefCurrentProps } from 'lottie-react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { LottieClip } from '../types';
import { cardStyle } from '../lib/geometry';
import { lottieMeta } from '../lib/lottie-meta';
import styles from './LottieCard.module.css';

const LottiePlayer =
  (LottieModule as unknown as { default?: typeof LottieModule }).default ?? LottieModule;

type Props = {
  clip: LottieClip;
  index: number;
  scrollValue: MotionValue<number>;
  isCenter: boolean;
  /** Click handler from the stage: smooth-spring to this card. */
  onClick: () => void;
};

/**
 * A single Cover Flow card.
 *
 * `scrollValue` is the continuous motion value driving the whole stage;
 * we derive `offset = index - scrollValue` reactively and feed it into
 * the pure `cardStyle()` mapping to obtain the 3D transform values.
 * When `isCenter` flips we play or freeze the animation.
 */
export function LottieCard({ clip, index, scrollValue, isCenter, onClick }: Props) {
  const offset = useTransform(scrollValue, (v) => index - v);
  const x = useTransform(offset, (o) => cardStyle(o).translateX);
  const rotateY = useTransform(offset, (o) => cardStyle(o).rotateY);
  const scale = useTransform(offset, (o) => cardStyle(o).scale);
  const opacity = useTransform(offset, (o) => cardStyle(o).opacity);
  const zIndex = useTransform(offset, (o) => cardStyle(o).zIndex);

  const lottieRef = useRef<LottieRefCurrentProps>(null);

  // Play only the centered card; everyone else shows frame 0.
  useEffect(() => {
    const api = lottieRef.current;
    if (!api) return;
    if (isCenter) {
      api.play();
    } else {
      api.goToAndStop(0, true);
    }
  }, [isCenter]);

  // Compute metadata once per clip — it's cheap, and memoizing isn't worth
  // the hook overhead for four numbers.
  const meta = lottieMeta(clip.data);
  const metaLine =
    meta.fps !== null
      ? `${meta.fps}fps · ${meta.totalFrames}f · ${meta.durationSec?.toFixed(1)}s · ${meta.layerCount} layers`
      : '';

  return (
    <motion.div
      className={styles.card}
      style={{ x, rotateY, scale, opacity, zIndex }}
      data-index={index}
      onClick={onClick}
    >
      <div className={styles.inner}>
        <LottiePlayer
          lottieRef={lottieRef}
          animationData={clip.data}
          loop
          autoplay={isCenter}
          className={styles.lottie}
        />
        {metaLine && <div className={styles.meta}>{metaLine}</div>}
      </div>
    </motion.div>
  );
}