import { describe, it, expect } from 'vitest';
import { isLottieData } from './lottie-validate';

const valid = { v: '5.7.0', fr: 30, ip: 0, op: 60, layers: [] };

describe('isLottieData', () => {
  it('accepts an object with all required keys', () => {
    expect(isLottieData(valid)).toBe(true);
  });

  it('rejects when a required key is missing', () => {
    const { op, ...missing } = valid;
    expect(isLottieData(missing)).toBe(false);
  });

  it('rejects when layers is not an array', () => {
    expect(isLottieData({ ...valid, layers: {} })).toBe(false);
  });

  it('rejects non-objects', () => {
    expect(isLottieData(null)).toBe(false);
    expect(isLottieData('x')).toBe(false);
    expect(isLottieData(42)).toBe(false);
  });
});