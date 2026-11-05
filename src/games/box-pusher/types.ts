export interface BoxPusherLevel {
  level: number;
  rows: number;
  cols: number;
  map: string[]; // standard Sokoban ASCII representation
  author?: string;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface BoxMoveRecord {
  playerBefore: [number, number];
  playerAfter: [number, number];
  boxBefore?: [number, number];
  boxAfter?: [number, number];
  wasPush: boolean;
}
