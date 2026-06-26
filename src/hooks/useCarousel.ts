import { useCallback, useEffect, useRef, useState } from 'react';
import { animate, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { CARD_SPACING } from '../lib/geometry';

/**
 * Cover Flow carousel state.
 *
 * `scrollValue` is a continuous framer-motion value that drives every
 * card's 3D transform. Integer values correspond to a card being exactly
 * centered; non-integer values produce the smooth in-between fan that
 * makes drag feel like real glass.
 *
 * Drag uses Pointer Events so mouse and touch share one code path. On
 * release we spring back to the nearest integer and convert the release
 * velocity into a "flick" so a fast swipe crosses multiple cards.
 */

const SPRING = { type: 'spring' as const, stiffness: 260, damping: 30 };

export function useCarousel(count: number) {
  const scrollValue = useMotionValue(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const maxIndex = Math.max(0, count - 1);

  const clamp = useCallback(
    (v: number) => Math.min(maxIndex, Math.max(0, v)),
    [maxIndex],
  );

  // Mirror the rounded scrollValue into React state for components that
  // re-render on activeIndex (controls, windowing logic).
  useMotionValueEvent(scrollValue, 'change', (v) => {
    const rounded = Math.round(v);
    setActiveIndex((prev) => (prev === rounded ? prev : rounded));
  });

  // If clips were removed and the active index is now out of range,
  // spring back inside the valid range.
  useEffect(() => {
    if (scrollValue.get() > maxIndex) {
      animate(scrollValue, maxIndex, SPRING);
    }
  }, [maxIndex, scrollValue]);

  const goTo = useCallback(
    (index: number) => {
      animate(scrollValue, clamp(index), SPRING);
    },
    [clamp, scrollValue],
  );

  const next = useCallback(
    () => goTo(Math.round(scrollValue.get()) + 1),
    [goTo, scrollValue],
  );

  const prev = useCallback(
    () => goTo(Math.round(scrollValue.get()) - 1),
    [goTo, scrollValue],
  );

  /**
   * Spring to a random index. Avoids picking the currently-centered card
   * so each press actually moves somewhere — feels alive on a 3-card stage.
   */
  const random = useCallback(() => {
    if (maxIndex <= 0) return;
    const current = Math.round(scrollValue.get());
    let target = Math.floor(Math.random() * (maxIndex + 1));
    if (target === current) target = (target + 1) % (maxIndex + 1);
    goTo(target);
  }, [goTo, maxIndex, scrollValue]);

  // Drag state lives in a ref so a pointer move doesn't trigger a render.
  const drag = useRef({
    startX: 0,
    startValue: 0,
    lastX: 0,
    lastT: 0,
    velocity: 0,
  });

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      scrollValue.stop();
      const now = Date.now();
      drag.current = {
        startX: e.clientX,
        startValue: scrollValue.get(),
        lastX: e.clientX,
        lastT: now,
        velocity: 0,
      };
      (e.target as Element).setPointerCapture(e.pointerId);

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - drag.current.startX;
        let raw = drag.current.startValue - dx / CARD_SPACING;
        // Over-drag damping past the ends so the stage feels springy.
        if (raw < 0) raw = raw * 0.35;
        else if (raw > maxIndex) raw = maxIndex + (raw - maxIndex) * 0.35;
        scrollValue.set(raw);

        const t = Date.now();
        const dt = t - drag.current.lastT;
        if (dt > 0) {
          drag.current.velocity = (ev.clientX - drag.current.lastX) / dt; // px/ms
          drag.current.lastX = ev.clientX;
          drag.current.lastT = t;
        }
      };

      const onUp = (ev: PointerEvent) => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        try {
          (e.target as Element).releasePointerCapture(ev.pointerId);
        } catch {
          /* pointer already released */
        }
        // Convert release velocity into a multi-card flick target.
        // drag.current.velocity is px/ms; multiplying gives a rough
        // "cards crossed" estimate that the spring then smooths out.
        const flick = -drag.current.velocity * 6;
        const target = clamp(Math.round(scrollValue.get() + flick));
        animate(scrollValue, target, {
          ...SPRING,
          velocity: -drag.current.velocity / CARD_SPACING,
        });
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [clamp, maxIndex, scrollValue],
  );

  return { scrollValue, activeIndex, goTo, next, prev, random, onPointerDown };
}