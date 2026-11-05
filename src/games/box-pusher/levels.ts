import { BoxPusherLevel } from './types';
import levelsData from './levels.data.json';

export const BOX_PUSHER_LEVELS: BoxPusherLevel[] = levelsData as BoxPusherLevel[];

export function getBoxPusherLevel(level: number): BoxPusherLevel {
  const safe = Math.max(1, Math.min(level, BOX_PUSHER_LEVELS.length));
  return BOX_PUSHER_LEVELS[safe - 1];
}
