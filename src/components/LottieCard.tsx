import { useEffect, useRef } from 'react';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { LottieClip } from '../types';
import { cardStyle } from '../lib/geometry';
import styles from './LottieCard.module.css';

type Props = {
  clip: LottieClip;
  index: number;
  scrollValue: MotionValue<number>;
  isCenter: boolean;
  /** True when this card is within the windowed mount range. */
  mounted: boolean;
};

/**
 * A single Cover Flow card.
 *
 * `scrollValue` is the continuous motion value driving the whole stage;
 * we derive `offset = index - scrollValue` reactively and feed it into
 * the pure `cardStyle()` mapping to obtain the 3D transform values.
 * When `isCenter` flips we play or freeze the animation.
 */
export function LottieCard({ clip, index, scrollValue, isCenter, mounted }: Props) {
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
    if (!api || !mounted) return;
    if (isCenter) {
      api.play();
    } else {
      api.goToAndStop(0, true);
    }
  }, [isCenter, mounted]);

  return (
    <motion.div
      className={styles.card}
      style={{ x, rotateY, scale, opacity, zIndex }}
      data-index={index}
    >
      {mounted ? (
        <Lottie
          lottieRef={lottieRef}
          animationData={clip.data}
          loop
          autoplay={isCenter}
          className={styles.lottie}
        />
      ) : (
        <span className={styles.placeholder}>{clip.name}</span>
      )}
    </motion.div>
  );
}