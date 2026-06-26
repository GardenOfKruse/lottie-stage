export type LottieMeta = {
  fps: number | null;
  totalFrames: number | null;
  durationSec: number | null;
  layerCount: number | null;
};

const EMPTY: LottieMeta = { fps: null, totalFrames: null, durationSec: null, layerCount: null };

export function lottieMeta(data: unknown): LottieMeta {
  if (typeof data !== 'object' || data === null) return EMPTY;
  const o = data as Record<string, unknown>;
  const fr = typeof o.fr === 'number' ? o.fr : null;
  const op = typeof o.op === 'number' ? o.op : null;
  const ip = typeof o.ip === 'number' ? o.ip : 0;
  const layers = Array.isArray(o.layers) ? o.layers : null;
  const totalFrames = op !== null && ip !== null ? op - ip : null;
  const durationSec = totalFrames !== null && fr && fr > 0 ? totalFrames / fr : null;
  return {
    fps: fr,
    totalFrames,
    durationSec,
    layerCount: layers === null ? null : layers.length,
  };
}