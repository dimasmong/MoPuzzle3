import { PipeLevel } from './types';
import levelsData from './levels.data.json';

export const PIPE_LEVELS: PipeLevel[] = levelsData as PipeLevel[];

export function getPipeLevel(level: number): PipeLevel {
  const safe = Math.max(1, Math.min(level, PIPE_LEVELS.length));
  return PIPE_LEVELS[safe - 1];
}
