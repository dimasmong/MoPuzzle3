import { MinesweeperLevel } from './types';

export const MINESWEEPER_LEVELS: MinesweeperLevel[] = [
  // Beginner (Levels 1-6)
  { level: 1, difficulty: 'beginner', rows: 8, cols: 8, mines: 8, isNoGuess: true },
  { level: 2, difficulty: 'beginner', rows: 8, cols: 8, mines: 9, isNoGuess: true },
  { level: 3, difficulty: 'beginner', rows: 8, cols: 8, mines: 10, isNoGuess: true },
  { level: 4, difficulty: 'beginner', rows: 9, cols: 9, mines: 10, isNoGuess: true },
  { level: 5, difficulty: 'beginner', rows: 9, cols: 9, mines: 11, isNoGuess: true },
  { level: 6, difficulty: 'beginner', rows: 9, cols: 9, mines: 12, isNoGuess: true },

  // Intermediate (Levels 7-13)
  { level: 7, difficulty: 'intermediate', rows: 10, cols: 10, mines: 14 },
  { level: 8, difficulty: 'intermediate', rows: 10, cols: 10, mines: 16 },
  { level: 9, difficulty: 'intermediate', rows: 11, cols: 11, mines: 18 },
  { level: 10, difficulty: 'intermediate', rows: 11, cols: 11, mines: 20 },
  { level: 11, difficulty: 'intermediate', rows: 12, cols: 12, mines: 22 },
  { level: 12, difficulty: 'intermediate', rows: 12, cols: 12, mines: 24 },
  { level: 13, difficulty: 'intermediate', rows: 12, cols: 12, mines: 26 },

  // Advanced (Levels 14-20)
  { level: 14, difficulty: 'advanced', rows: 13, cols: 13, mines: 28 },
  { level: 15, difficulty: 'advanced', rows: 13, cols: 13, mines: 30 },
  { level: 16, difficulty: 'advanced', rows: 13, cols: 13, mines: 32 },
  { level: 17, difficulty: 'advanced', rows: 14, cols: 14, mines: 34 },
  { level: 18, difficulty: 'advanced', rows: 14, cols: 14, mines: 36 },
  { level: 19, difficulty: 'advanced', rows: 14, cols: 14, mines: 38 },
  { level: 20, difficulty: 'advanced', rows: 14, cols: 14, mines: 40 },
];

export function getMinesweeperLevel(level: number): MinesweeperLevel {
  const safe = Math.max(1, Math.min(level, MINESWEEPER_LEVELS.length));
  return MINESWEEPER_LEVELS[safe - 1];
}
