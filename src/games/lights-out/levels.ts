import { LightsOutLevel } from './types';
import levelsData from './levels.data.json';

export const LIGHTS_OUT_LEVELS: LightsOutLevel[] = levelsData as LightsOutLevel[];

export function getLightsOutLevel(level: number): LightsOutLevel {
  const safe = Math.max(1, Math.min(level, LIGHTS_OUT_LEVELS.length));
  return LIGHTS_OUT_LEVELS[safe - 1];
}
