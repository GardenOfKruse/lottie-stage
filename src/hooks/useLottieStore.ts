import { useCallback, useEffect, useState } from 'react';
import type { LottieClip } from '../types';
import { addClip, deleteClip, getAllClips } from '../lib/db';

/**
 * Single source of truth for the user's uploaded clips.
 *
 * On mount we hydrate from IndexedDB. `addClips` writes new entries to
 * the store then merges them into local state; `removeClip` deletes and
 * filters. State lives in React; IndexedDB is the durable mirror.
 */
export function useLottieStore() {
  const [clips, setClips] = useState<LottieClip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllClips()
      .then(setClips)
      .finally(() => setLoading(false));
  }, []);

  const addClips = useCallback(
    async (files: { name: string; data: object }[]) => {
      const created: LottieClip[] = files.map((f) => ({
        id: crypto.randomUUID(),
        name: f.name,
        data: f.data,
        createdAt: Date.now(),
      }));
      for (const clip of created) {
        await addClip(clip);
      }
      setClips((prev) => [...prev, ...created]);
    },
    [],
  );

  const removeClip = useCallback(async (id: string) => {
    await deleteClip(id);
    setClips((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { clips, loading, addClips, removeClip };
}