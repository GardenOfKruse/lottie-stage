/**
 * Cover Flow geometry mapping.
 *
 * Given a single card's offset from the active index (where 0 means the
 * card is centered and integer ±1 means it is the immediate neighbor),
 * return the CSS transform values that make the stage feel 3D.
 *
 * The mapping is continuous so that during a drag the cards fan out
 * smoothly without any discrete jumps.
 */

export type CardStyle = {
  translateX: number;
  rotateY: number;
  scale: number;
  opacity: number;
  zIndex: number;
};

/** Pixels between adjacent card centers. */
export const CARD_SPACING = 240;

/** Maximum rotateY (degrees) reached when |offset| >= 1. */
export const MAX_ROTATE = 45;

/** Minimum scale reached when |offset| >= 1. */
export const MIN_SCALE = 0.8;

/** Minimum opacity reached when |offset| == 1. */
export const MIN_OPACITY = 0.6;

/**
 * Cards within this many positions of the active index mount a real
 * Lottie instance; anything further is rendered as a placeholder.
 */
export const VISIBLE_RANGE = 2;

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export function cardStyle(offset: number): CardStyle {
  const abs = Math.abs(offset);
  const dir = Math.sign(offset); // +1 right, -1 left, 0 center

  // Interpolation factor for the first unit of distance (clamped to [0,1]).
  const t = clamp(abs, 0, 1);

  // Beyond the first unit, push cards further out so they fan along the stage.
  const lateral = abs <= 1 ? abs : 1 + (abs - 1) * 0.6;

  const translateX = dir * lateral * CARD_SPACING;
  // dir is -1, 0, or 1. -0 * 0 = -0 which fails a strict `=== 0` check,
  // so we add 0 to normalize signed zero back to +0 at the center.
  const rotateY = -dir * lerp(0, MAX_ROTATE, t) + 0;
  const scale = lerp(1, MIN_SCALE, t);

  // Fade cards past the visible range so windowed placeholders are invisible.
  const opacity = abs >= VISIBLE_RANGE + 1 ? 0 : lerp(1, MIN_OPACITY, t);

  // Center stays on top; ties broken by index position.
  const zIndex = 1000 - Math.round(abs * 10);

  return { translateX, rotateY, scale, opacity, zIndex };
}