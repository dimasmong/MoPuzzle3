export type MinesweeperDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface MinesweeperLevel {
  level: number;
  difficulty: MinesweeperDifficulty;
  rows: number;
  cols: number;
  mines: number;
  isNoGuess?: boolean;
}

export interface MinesweeperCellState {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
  isExploded?: boolean;
}
