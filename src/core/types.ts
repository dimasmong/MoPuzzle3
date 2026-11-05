export type GameId =
  | 'sudoku'
  | 'minesweeper'
  | 'pipe-connect'
  | 'box-pusher'
  | 'memory-flip'
  | 'lights-out';

export const ALL_GAMES: GameId[] = [
  'sudoku',
  'minesweeper',
  'pipe-connect',
  'box-pusher',
  'memory-flip',
  'lights-out',
];

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'id';

export type ProgressionState =
  | 'IDLE'
  | 'PLAYING'
  | 'COMPLETING'
  | 'COMPLETED'
  | 'LOADING_NEXT';

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  sfxVolume: number;
  musicVolume: number;
  theme: Theme;
  language: Language;
  reducedMotion: boolean;
  highContrast: boolean;
}

export interface LevelProgress {
  level: number;
  moves: number;
  timeSeconds: number;
  stars: number;
  completedAt: number;
  bestMoves: number;
  bestTime: number;
}

export interface ActiveGameData {
  gameId: GameId;
  level: number;
  moves: number;
  timeSeconds: number;
  state: any;
  updatedAt: number;
}

export interface GameStats {
  puzzlesCompleted: number;
  totalTimePlayed: number;
  movesMade: number;
  hintsUsed: number;
  gamesCompleted: Record<GameId, number>;
  bestTimes: Record<GameId, Record<number, number>>;
  bestMoves: Record<GameId, Record<number, number>>;
}

export interface Achievement {
  id: string;
  nameKey: string;
  descKey: string;
  icon: string;
  maxProgress: number;
  unlocked: boolean;
  progress: number;
  unlockedAt?: number;
}

export interface RouteParams {
  gameId?: GameId;
  level?: number;
  difficulty?: string;
}

export type RouteName =
  | 'home'
  | 'details'
  | 'levelselect'
  | 'play'
  | 'stats'
  | 'achievements'
  | 'settings'
  | 'about'
  | 'faq';
