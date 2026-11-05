export type PipeType =
  | 'straight'
  | 'corner'
  | 'tee'
  | 'cross'
  | 'cap'
  | 'source'
  | 'destination'
  | 'empty';

// Directions: 0 = Up, 1 = Right, 2 = Down, 3 = Left
export type Direction = 0 | 1 | 2 | 3;

export interface PipeCellDef {
  type: PipeType;
  rotation: number; // 0, 1, 2, 3
  isFixed?: boolean;
}

export interface PipeLevel {
  level: number;
  rows: number;
  cols: number;
  cells: PipeCellDef[][];
  solutionRotations: number[][];
}

export interface PipeCellState {
  row: number;
  col: number;
  type: PipeType;
  rotation: number; // 0, 1, 2, 3 (each * 90 deg)
  openings: boolean[]; // [Up, Right, Down, Left]
  isWatered: boolean;
  isFixed: boolean;
}
