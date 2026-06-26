/**
 * Lottie JSON validation.
 *
 * A file is treated as Lottie when it is a plain object containing every
 * key the bodymovin/lottie format guarantees: a schema version (`v`),
 * the frame rate (`fr`), the in/out frames (`ip` / `op`), and a `layers`
 * array. Anything else is rejected before we put it in IndexedDB.
 */

const REQUIRED_KEYS = ['v', 'layers', 'fr', 'ip', 'op'] as const;

export function isLottieData(data: unknown): data is Record<string, unknown> {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  for (const key of REQUIRED_KEYS) {
    if (!(key in obj)) return false;
  }
  return Array.isArray(obj.layers);
}