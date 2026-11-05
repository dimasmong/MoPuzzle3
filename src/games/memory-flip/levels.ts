import { MemoryLevel } from './types';

export const MEMORY_LEVELS: MemoryLevel[] = [
  // Introductory 2x2 (Levels 1-3)
  { level: 1, rows: 2, cols: 2, pairs: 2 },
  { level: 2, rows: 2, cols: 2, pairs: 2 },
  { level: 3, rows: 2, cols: 2, pairs: 2 },

  // Intermediate 3x4 (Levels 4-8)
  { level: 4, rows: 3, cols: 4, pairs: 6 },
  { level: 5, rows: 3, cols: 4, pairs: 6 },
  { level: 6, rows: 3, cols: 4, pairs: 6 },
  { level: 7, rows: 3, cols: 4, pairs: 6 },
  { level: 8, rows: 3, cols: 4, pairs: 6 },

  // Challenging 4x4 (Levels 9-14)
  { level: 9, rows: 4, cols: 4, pairs: 8 },
  { level: 10, rows: 4, cols: 4, pairs: 8 },
  { level: 11, rows: 4, cols: 4, pairs: 8 },
  { level: 12, rows: 4, cols: 4, pairs: 8 },
  { level: 13, rows: 4, cols: 4, pairs: 8 },
  { level: 14, rows: 4, cols: 4, pairs: 8 },

  // Expert 4x5 (Levels 15-20)
  { level: 15, rows: 4, cols: 5, pairs: 10 },
  { level: 16, rows: 4, cols: 5, pairs: 10 },
  { level: 17, rows: 4, cols: 5, pairs: 10 },
  { level: 18, rows: 4, cols: 5, pairs: 10 },
  { level: 19, rows: 4, cols: 5, pairs: 10 },
  { level: 20, rows: 4, cols: 5, pairs: 10 },
];

export function getMemoryLevel(level: number): MemoryLevel {
  const safe = Math.max(1, Math.min(level, MEMORY_LEVELS.length));
  return MEMORY_LEVELS[safe - 1];
}
