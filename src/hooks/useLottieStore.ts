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

/**
 * The bundled samples. `sourceUrl` is the LottieFiles page for the asset
 * — the 🔗 button in the controls bar jumps there in a new tab.
 *
 * Stable IDs (`builtin-*`) make first-visit seeding idempotent: if you
 * ever blow away IndexedDB but the localStorage flag still says "seeded",
 * you don't get duplicates on next reload.
 */
const BUILTIN_SAMPLES: { name: string; data: object; sourceUrl: string }[] = [
  {
    name: 'cat-playing.json',
    data: catPlaying,
    sourceUrl: 'https://lottiefiles.com/animations/cat-playing-cat-cat-with-cats-cat-cat-7W7tFoqJYY',
  },
  {
    name: 'doggie-walk.json',
    data: doggieWalk,
    sourceUrl: 'https://lottiefiles.com/animations/doggie-walk-dog-walk-Y0VYvZKs47',
  },
  {
    name: 'totoro-walk.json',
    data: totoroWalk,
    sourceUrl: 'https://lottiefiles.com/animations/totoro-walk-totoro-walk-cute-totoro-walk-AFaMQq6pqD',
  },
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
            sourceUrl: s.sourceUrl,
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