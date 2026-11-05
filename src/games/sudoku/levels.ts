import { SudokuLevel } from './types';
import levelsData from './levels.data.json';

export const SUDOKU_LEVELS: SudokuLevel[] = levelsData as SudokuLevel[];

export function getSudokuLevel(level: number): SudokuLevel {
  const safeLevel = Math.max(1, Math.min(level, SUDOKU_LEVELS.length));
  return SUDOKU_LEVELS[safeLevel - 1];
}
