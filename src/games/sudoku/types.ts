export type SudokuDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface SudokuLevel {
  level: number;
  difficulty: SudokuDifficulty;
  grid: number[][]; // 9x9 matrix, 0 means blank
  solution: number[][]; // 9x9 complete matrix
}

export interface SudokuCellState {
  row: number;
  col: number;
  value: number;
  isClue: boolean;
  notes: number[];
  isError: boolean;
}

export interface SudokuMoveHistory {
  row: number;
  col: number;
  prevValue: number;
  newValue: number;
  prevNotes: number[];
  newNotes: number[];
}
