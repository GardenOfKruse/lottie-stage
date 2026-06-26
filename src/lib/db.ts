/**
 * IndexedDB persistence layer for Lottie clips.
 *
 * A single `clips` object store keyed by `LottieClip.id`. Clips are
 * returned sorted by `createdAt` ascending so the stage always shows
 * uploads in the order they were added.
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { LottieClip } from '../types';

interface LottieDB extends DBSchema {
  clips: { key: string; value: LottieClip };
}

let dbPromise: Promise<IDBPDatabase<LottieDB>> | null = null;

function getDB(): Promise<IDBPDatabase<LottieDB>> {
  if (!dbPromise) {
    dbPromise = openDB<LottieDB>('lottie-stage', 1, {
      upgrade(db) {
        db.createObjectStore('clips', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}

export async function getAllClips(): Promise<LottieClip[]> {
  const db = await getDB();
  const all = await db.getAll('clips');
  return all.sort((a, b) => a.createdAt - b.createdAt);
}

export async function addClip(clip: LottieClip): Promise<void> {
  const db = await getDB();
  await db.put('clips', clip);
}

export async function deleteClip(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('clips', id);
}