import { describe, it, expect } from 'vitest';
import { cardStyle, CARD_SPACING } from './geometry';

describe('cardStyle', () => {
  it('center card is upright, full scale and opacity', () => {
    const s = cardStyle(0);
    expect(s.translateX).toBe(0);
    expect(s.rotateY).toBe(0);
    expect(s.scale).toBe(1);
    expect(s.opacity).toBe(1);
  });

  it('right neighbor tilts negative, shifts right, shrinks', () => {
    const s = cardStyle(1);
    expect(s.translateX).toBeCloseTo(CARD_SPACING);
    expect(s.rotateY).toBeCloseTo(-45);
    expect(s.scale).toBeCloseTo(0.8);
    expect(s.opacity).toBeCloseTo(0.6);
  });

  it('left neighbor is mirror of right', () => {
    const s = cardStyle(-1);
    expect(s.translateX).toBeCloseTo(-CARD_SPACING);
    expect(s.rotateY).toBeCloseTo(45);
  });

  it('half offset interpolates smoothly (no jump)', () => {
    const s = cardStyle(0.5);
    expect(s.rotateY).toBeCloseTo(-22.5);
    expect(s.scale).toBeGreaterThan(0.8);
    expect(s.scale).toBeLessThan(1);
  });

  it('far cards are fully transparent', () => {
    expect(cardStyle(3).opacity).toBe(0);
    expect(cardStyle(-4).opacity).toBe(0);
  });

  it('center has highest zIndex', () => {
    expect(cardStyle(0).zIndex).toBeGreaterThan(cardStyle(1).zIndex);
    expect(cardStyle(1).zIndex).toBe(cardStyle(-1).zIndex);
  });
});