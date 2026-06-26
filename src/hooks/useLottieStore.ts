import { useCallback, useEffect, useState } from 'react';
import type { LottieClip } from '../types';
import { addClip, deleteClip, getAllClips } from '../lib/db';
import catPlaying from '../samples/cat-playing.json';
import doggieWalk from '../samples/doggie-walk.json';
import totoroWalk from '../samples/totoro-walk.json';

/**
 * Single source of truth for the user's uploaded clips.
 *
 * On mount we hydrate from IndexedDB. The very first time (detected
 * via a localStorage flag, so it survives even after the user empties
 * the database) we seed three bundled samples so the stage is never
 * empty by default. After seeding the flag is set and we never seed
 * again — deleting a sample is a real delete, it won't come back on
 * reload.
 */

const SEED_FLAG = 'lottie-stage.seeded.v1';

const BUILTIN_SAMPLES: { name: string; data: object }[] = [
  { name: 'cat-playing.json', data: catPlaying },
  { name: 'doggie-walk.json', data: doggieWalk },
  { name: 'totoro-walk.json', data: totoroWalk },
];

export function useLottieStore() {
  const [clips, setClips] = useState<LottieClip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const existing = await getAllClips();
        if (existing.length === 0 && !localStorage.getItem(SEED_FLAG)) {
          // First-ever visit: write the bundled samples once so the
          // stage has something to show. After this, the flag is set
          // and any delete is permanent.
          const seeded: LottieClip[] = BUILTIN_SAMPLES.map((s, i) => ({
            id: 'builtin-' + s.name,
            name: s.name,
            data: s.data,
            createdAt: Date.now() + i,
          }));
          for (const clip of seeded) await addClip(clip);
          localStorage.setItem(SEED_FLAG, '1');
          setClips(seeded);
        } else {
          setClips(existing);
        }
      } finally {
        setLoading(false);
      }
    })();
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