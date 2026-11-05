import { Achievement, GameId, ALL_GAMES } from './types';
import { Persistence } from './persistence';

export const ACHIEVEMENTS_DEF: Omit<Achievement, 'unlocked' | 'progress' | 'unlockedAt'>[] = [
  {
    id: 'first_win',
    nameKey: 'ach.first_win.name',
    descKey: 'ach.first_win.desc',
    icon: '🌟',
    maxProgress: 1,
  },
  // Sudoku
  {
    id: 'sudoku_5',
    nameKey: 'ach.sudoku_5.name',
    descKey: 'ach.sudoku_5.desc',
    icon: '🔢',
    maxProgress: 5,
  },
  {
    id: 'sudoku_10',
    nameKey: 'ach.sudoku_10.name',
    descKey: 'ach.sudoku_10.desc',
    icon: '🧩',
    maxProgress: 10,
  },
  {
    id: 'sudoku_all',
    nameKey: 'ach.sudoku_all.name',
    descKey: 'ach.sudoku_all.desc',
    icon: '👑',
    maxProgress: 20,
  },
  // Minesweeper
  {
    id: 'mines_5',
    nameKey: 'ach.mines_5.name',
    descKey: 'ach.mines_5.desc',
    icon: '🚩',
    maxProgress: 5,
  },
  {
    id: 'mines_10',
    nameKey: 'ach.mines_10.name',
    descKey: 'ach.mines_10.desc',
    icon: '💣',
    maxProgress: 10,
  },
  {
    id: 'mines_all',
    nameKey: 'ach.mines_all.name',
    descKey: 'ach.mines_all.desc',
    icon: '🛡️',
    maxProgress: 20,
  },
  // Pipe Connect
  {
    id: 'pipe_5',
    nameKey: 'ach.pipe_5.name',
    descKey: 'ach.pipe_5.desc',
    icon: '💧',
    maxProgress: 5,
  },
  {
    id: 'pipe_10',
    nameKey: 'ach.pipe_10.name',
    descKey: 'ach.pipe_10.desc',
    icon: '🌊',
    maxProgress: 10,
  },
  {
    id: 'pipe_all',
    nameKey: 'ach.pipe_all.name',
    descKey: 'ach.pipe_all.desc',
    icon: '🚰',
    maxProgress: 20,
  },
  // Box Pusher
  {
    id: 'box_5',
    nameKey: 'ach.box_5.name',
    descKey: 'ach.box_5.desc',
    icon: '📦',
    maxProgress: 5,
  },
  {
    id: 'box_10',
    nameKey: 'ach.box_10.name',
    descKey: 'ach.box_10.desc',
    icon: '🚚',
    maxProgress: 10,
  },
  {
    id: 'box_all',
    nameKey: 'ach.box_all.name',
    descKey: 'ach.box_all.desc',
    icon: '🏭',
    maxProgress: 20,
  },
  // Memory Flip
  {
    id: 'mem_5',
    nameKey: 'ach.mem_5.name',
    descKey: 'ach.mem_5.desc',
    icon: '🃏',
    maxProgress: 5,
  },
  {
    id: 'mem_10',
    nameKey: 'ach.mem_10.name',
    descKey: 'ach.mem_10.desc',
    icon: '🧠',
    maxProgress: 10,
  },
  {
    id: 'mem_all',
    nameKey: 'ach.mem_all.name',
    descKey: 'ach.mem_all.desc',
    icon: '🔮',
    maxProgress: 20,
  },
  // Lights Out
  {
    id: 'light_5',
    nameKey: 'ach.light_5.name',
    descKey: 'ach.light_5.desc',
    icon: '💡',
    maxProgress: 5,
  },
  {
    id: 'light_10',
    nameKey: 'ach.light_10.name',
    descKey: 'ach.light_10.desc',
    icon: '⚡',
    maxProgress: 10,
  },
  {
    id: 'light_all',
    nameKey: 'ach.light_all.name',
    descKey: 'ach.light_all.desc',
    icon: '✨',
    maxProgress: 20,
  },
  // Universal Challenges
  {
    id: 'hint_free_10',
    nameKey: 'ach.hint_free_10.name',
    descKey: 'ach.hint_free_10.desc',
    icon: '🎯',
    maxProgress: 10,
  },
  {
    id: 'speed_demon',
    nameKey: 'ach.speed_demon.name',
    descKey: 'ach.speed_demon.desc',
    icon: '⚡',
    maxProgress: 1,
  },
  {
    id: 'centurion_moves',
    nameKey: 'ach.centurion_moves.name',
    descKey: 'ach.centurion_moves.desc',
    icon: '🎖️',
    maxProgress: 500,
  },
  {
    id: 'puzzle_connoisseur',
    nameKey: 'ach.puzzle_connoisseur.name',
    descKey: 'ach.puzzle_connoisseur.desc',
    icon: '🌐',
    maxProgress: 6,
  },
  {
    id: 'grandmaster',
    nameKey: 'ach.grandmaster.name',
    descKey: 'ach.grandmaster.desc',
    icon: '🏆',
    maxProgress: 120,
  },
];

export class AchievementManager {
  private static instance: AchievementManager;
  private persistence: Persistence;

  private constructor() {
    this.persistence = Persistence.getInstance();
  }

  public static getInstance(): AchievementManager {
    if (!AchievementManager.instance) {
      AchievementManager.instance = new AchievementManager();
    }
    return AchievementManager.instance;
  }

  public getAll(): Achievement[] {
    return ACHIEVEMENTS_DEF.map((def) => {
      const state = this.persistence.getAchievementState(def.id);
      return {
        ...def,
        unlocked: state.unlocked,
        progress: Math.min(def.maxProgress, state.progress),
        unlockedAt: state.unlockedAt,
      };
    });
  }

  /**
   * Check and update achievements after a game completes or a move occurs.
   * Returns newly unlocked achievements if any.
   */
  public evaluate(context?: {
    gameId?: GameId;
    level?: number;
    timeSeconds?: number;
    usedHint?: boolean;
    moves?: number;
  }): Achievement[] {
    const stats = this.persistence.getStats();
    const newlyUnlocked: Achievement[] = [];

    const tryUnlock = (id: string, progress: number, maxProgress: number) => {
      const isComplete = progress >= maxProgress;
      const wasUnlocked = this.persistence.setAchievementState(id, progress, isComplete);
      if (wasUnlocked) {
        const full = this.getAll().find((a) => a.id === id);
        if (full) newlyUnlocked.push(full);
      }
    };

    // 1. First Win
    tryUnlock('first_win', stats.puzzlesCompleted > 0 ? 1 : 0, 1);

    // 2. Per-Game Milestones
    for (const g of ALL_GAMES) {
      const count = stats.gamesCompleted[g] || 0;
      let prefix = '';
      if (g === 'sudoku') prefix = 'sudoku';
      else if (g === 'minesweeper') prefix = 'mines';
      else if (g === 'pipe-connect') prefix = 'pipe';
      else if (g === 'box-pusher') prefix = 'box';
      else if (g === 'memory-flip') prefix = 'mem';
      else if (g === 'lights-out') prefix = 'light';

      tryUnlock(`${prefix}_5`, count, 5);
      tryUnlock(`${prefix}_10`, count, 10);
      tryUnlock(`${prefix}_all`, count, 20);
    }

    // 3. Speed Demon (under 20 seconds)
    if (context?.timeSeconds !== undefined && context.timeSeconds < 20) {
      tryUnlock('speed_demon', 1, 1);
    }

    // 4. Centurion Moves (500 total moves)
    tryUnlock('centurion_moves', stats.movesMade, 500);

    // 5. Hint Free 10
    // Estimate hint-free wins: puzzles completed minus hints used
    const hintFreeCount = Math.max(0, stats.puzzlesCompleted - stats.hintsUsed);
    tryUnlock('hint_free_10', hintFreeCount, 10);

    // 6. Puzzle Connoisseur (at least 5 completed in each of all 6 games)
    let gamesWith5 = 0;
    for (const g of ALL_GAMES) {
      if ((stats.gamesCompleted[g] || 0) >= 5) {
        gamesWith5++;
      }
    }
    tryUnlock('puzzle_connoisseur', gamesWith5, 6);

    // 7. Grandmaster (all 120 completed)
    tryUnlock('grandmaster', stats.puzzlesCompleted, 120);

    return newlyUnlocked;
  }
}
