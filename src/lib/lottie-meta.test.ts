import { describe, it, expect } from 'vitest';
import { lottieMeta } from './lottie-meta';

const sample = {
  v: '5.7.0',
  fr: 30,
  ip: 0,
  op: 90,
  layers: [{}, {}, {}],
};

describe('lottieMeta', () => {
  it('returns fps, totalFrames, durationSec, layerCount', () => {
    const m = lottieMeta(sample);
    expect(m.fps).toBe(30);
    expect(m.totalFrames).toBe(90);
    expect(m.durationSec).toBeCloseTo(3.0);
    expect(m.layerCount).toBe(3);
  });

  it('handles non-integer durations without crashing', () => {
    const m = lottieMeta({ ...sample, fr: 24, op: 100 });
    expect(m.fps).toBe(24);
    expect(m.durationSec).toBeCloseTo(100 / 24);
  });

  it('returns nulls for invalid input', () => {
    expect(lottieMeta(null)).toEqual({ fps: null, totalFrames: null, durationSec: null, layerCount: null });
    expect(lottieMeta({})).toEqual({ fps: null, totalFrames: null, durationSec: null, layerCount: null });
  });
});