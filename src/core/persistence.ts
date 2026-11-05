import {
  ActiveGameData,
  ALL_GAMES,
  GameId,
  GameSettings,
  GameStats,
  LevelProgress,
} from './types';

const STORAGE_KEY = 'mopuzzle3_save_data';
const SCHEMA_VERSION = 1;

export interface StorageSchema {
  version: number;
  settings: GameSettings;
  unlockedLevels: Record<GameId, number>;
  levelProgress: Record<GameId, Record<number, LevelProgress>>;
  activeGames: Partial<Record<GameId, ActiveGameData>>;
  stats: GameStats;
  achievements: Record<string, { unlocked: boolean; progress: number; unlockedAt?: number }>;
  lastPlayedGame: GameId | null;
  lastPlayedLevel: Record<GameId, number>;
}

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  sfxVolume: 0.8,
  musicVolume: 0.4,
  theme: 'light',
  language: 'en',
  reducedMotion: false,
  highContrast: false,
};

function createDefaultUnlocked(): Record<GameId, number> {
  const record = {} as Record<GameId, number>;
  for (const g of ALL_GAMES) {
    record[g] = 1;
  }
  return record;
}

function createDefaultProgress(): Record<GameId, Record<number, LevelProgress>> {
  const record = {} as Record<GameId, Record<number, LevelProgress>>;
  for (const g of ALL_GAMES) {
    record[g] = {};
  }
  return record;
}

function createDefaultStats(): GameStats {
  const gamesCompleted = {} as Record<GameId, number>;
  const bestTimes = {} as Record<GameId, Record<number, number>>;
  const bestMoves = {} as Record<GameId, Record<number, number>>;
  for (const g of ALL_GAMES) {
    gamesCompleted[g] = 0;
    bestTimes[g] = {};
    bestMoves[g] = {};
  }
  return {
    puzzlesCompleted: 0,
    totalTimePlayed: 0,
    movesMade: 0,
    hintsUsed: 0,
    gamesCompleted,
    bestTimes,
    bestMoves,
  };
}

export class Persistence {
  private static instance: Persistence;
  private data: StorageSchema;

  private constructor() {
    this.data = this.loadData();
  }

  public static getInstance(): Persistence {
    if (!Persistence.instance) {
      Persistence.instance = new Persistence();
    }
    return Persistence.instance;
  }

  public getDefaultData(): StorageSchema {
    return {
      version: SCHEMA_VERSION,
      settings: { ...DEFAULT_SETTINGS },
      unlockedLevels: createDefaultUnlocked(),
      levelProgress: createDefaultProgress(),
      activeGames: {},
      stats: createDefaultStats(),
      achievements: {},
      lastPlayedGame: null,
      lastPlayedLevel: createDefaultUnlocked(),
    };
  }

  private loadData(): StorageSchema {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return this.getDefaultData();
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const defaults = this.getDefaultData();
        this.saveData(defaults);
        return defaults;
      }
      const parsed = JSON.parse(raw);
      return this.migrate(parsed);
    } catch (err) {
      console.warn('[Persistence] Corrupt save data recovered with defaults', err);
      const defaults = this.getDefaultData();
      this.saveData(defaults);
      return defaults;
    }
  }

  private migrate(parsed: any): StorageSchema {
    const defaults = this.getDefaultData();
    if (!parsed || typeof parsed !== 'object') {
      return defaults;
    }

    const migrated: StorageSchema = {
      version: SCHEMA_VERSION,
      settings: {
        ...defaults.settings,
        ...(parsed.settings || {}),
      },
      unlockedLevels: {
        ...defaults.unlockedLevels,
        ...(parsed.unlockedLevels || {}),
      },
      levelProgress: {
        ...defaults.levelProgress,
        ...(parsed.levelProgress || {}),
      },
      activeGames: {
        ...(parsed.activeGames || {}),
      },
      stats: {
        ...defaults.stats,
        ...(parsed.stats || {}),
        gamesCompleted: {
          ...defaults.stats.gamesCompleted,
          ...(parsed.stats?.gamesCompleted || {}),
        },
        bestTimes: {
          ...defaults.stats.bestTimes,
          ...(parsed.stats?.bestTimes || {}),
        },
        bestMoves: {
          ...defaults.stats.bestMoves,
          ...(parsed.stats?.bestMoves || {}),
        },
      },
      achievements: {
        ...(parsed.achievements || {}),
      },
      lastPlayedGame: parsed.lastPlayedGame ?? null,
      lastPlayedLevel: {
        ...defaults.lastPlayedLevel,
        ...(parsed.lastPlayedLevel || {}),
      },
    };

    // Ensure all 6 games are present in unlockedLevels and stats
    for (const g of ALL_GAMES) {
      if (!migrated.unlockedLevels[g] || migrated.unlockedLevels[g] < 1) {
        migrated.unlockedLevels[g] = 1;
      }
      if (!migrated.lastPlayedLevel[g] || migrated.lastPlayedLevel[g] < 1) {
        migrated.lastPlayedLevel[g] = 1;
      }
      if (!migrated.levelProgress[g]) {
        migrated.levelProgress[g] = {};
      }
      if (typeof migrated.stats.gamesCompleted[g] !== 'number') {
        migrated.stats.gamesCompleted[g] = 0;
      }
      if (!migrated.stats.bestTimes[g]) {
        migrated.stats.bestTimes[g] = {};
      }
      if (!migrated.stats.bestMoves[g]) {
        migrated.stats.bestMoves[g] = {};
      }
    }

    return migrated;
  }

  private saveData(data: StorageSchema): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
      this.data = data;
    } catch (err) {
      console.error('[Persistence] Failed to write to localStorage', err);
    }
  }

  // --- Settings ---
  public getSettings(): GameSettings {
    return { ...this.data.settings };
  }

  public updateSettings(partial: Partial<GameSettings>): void {
    this.data.settings = { ...this.data.settings, ...partial };
    this.saveData(this.data);
  }

  // --- Progression ---
  public getUnlockedLevel(gameId: GameId): number {
    return this.data.unlockedLevels[gameId] ?? 1;
  }

  public unlockLevel(gameId: GameId, level: number): void {
    const current = this.getUnlockedLevel(gameId);
    if (level > current) {
      this.data.unlockedLevels[gameId] = level;
      this.saveData(this.data);
    }
  }

  public getLastPlayedLevel(gameId: GameId): number {
    return this.data.lastPlayedLevel[gameId] ?? 1;
  }

  public setLastPlayed(gameId: GameId, level: number): void {
    this.data.lastPlayedGame = gameId;
    this.data.lastPlayedLevel[gameId] = level;
    this.saveData(this.data);
  }

  public getLastPlayedGame(): GameId | null {
    return this.data.lastPlayedGame;
  }

  public getLevelProgress(gameId: GameId, level: number): LevelProgress | null {
    return this.data.levelProgress[gameId]?.[level] ?? null;
  }

  public recordLevelCompletion(
    gameId: GameId,
    level: number,
    moves: number,
    timeSeconds: number,
    stars: number = 3
  ): void {
    const existing = this.getLevelProgress(gameId, level);
    const isFirstTimeCompletion = !existing;

    const bestMoves = existing ? Math.min(existing.bestMoves, moves) : moves;
    const bestTime = existing ? Math.min(existing.bestTime, timeSeconds) : timeSeconds;
    const bestStars = existing ? Math.max(existing.stars, stars) : stars;

    if (!this.data.levelProgress[gameId]) {
      this.data.levelProgress[gameId] = {};
    }

    this.data.levelProgress[gameId][level] = {
      level,
      moves,
      timeSeconds,
      stars: bestStars,
      completedAt: Date.now(),
      bestMoves,
      bestTime,
    };

    // Unlock next level (up to 20)
    if (level < 20) {
      this.unlockLevel(gameId, level + 1);
    }

    // Stats updates
    if (isFirstTimeCompletion) {
      this.data.stats.puzzlesCompleted += 1;
      this.data.stats.gamesCompleted[gameId] = (this.data.stats.gamesCompleted[gameId] || 0) + 1;
    }

    this.data.stats.totalTimePlayed += timeSeconds;
    this.data.stats.movesMade += moves;

    if (!this.data.stats.bestTimes[gameId]) this.data.stats.bestTimes[gameId] = {};
    if (!this.data.stats.bestMoves[gameId]) this.data.stats.bestMoves[gameId] = {};

    this.data.stats.bestTimes[gameId][level] = bestTime;
    this.data.stats.bestMoves[gameId][level] = bestMoves;

    this.saveData(this.data);
  }

  // --- Active Games (Autosave/Resume) ---
  public getActiveGame(gameId: GameId): ActiveGameData | null {
    return this.data.activeGames[gameId] ?? null;
  }

  public saveActiveGame(data: ActiveGameData): void {
    this.data.activeGames[data.gameId] = data;
    this.saveData(this.data);
  }

  public clearActiveGame(gameId: GameId): void {
    if (this.data.activeGames[gameId]) {
      delete this.data.activeGames[gameId];
      this.saveData(this.data);
    }
  }

  // --- Lifetime Stats ---
  public getStats(): GameStats {
    return JSON.parse(JSON.stringify(this.data.stats));
  }

  public recordHintUsed(): void {
    this.data.stats.hintsUsed += 1;
    this.saveData(this.data);
  }

  public recordMoveMade(): void {
    this.data.stats.movesMade += 1;
    this.saveData(this.data);
  }

  public recordTimePlayed(seconds: number): void {
    this.data.stats.totalTimePlayed += Math.max(0, seconds);
    this.saveData(this.data);
  }

  // --- Achievements ---
  public getAchievementState(id: string): { unlocked: boolean; progress: number; unlockedAt?: number } {
    return this.data.achievements[id] || { unlocked: false, progress: 0 };
  }

  public setAchievementState(id: string, progress: number, unlocked: boolean): boolean {
    const prev = this.getAchievementState(id);
    const newlyUnlocked = !prev.unlocked && unlocked;

    this.data.achievements[id] = {
      progress,
      unlocked,
      unlockedAt: newlyUnlocked ? Date.now() : prev.unlockedAt,
    };
    this.saveData(this.data);
    return newlyUnlocked;
  }

  // --- Reset All ---
  public resetAllProgress(): void {
    const fresh = this.getDefaultData();
    // preserve theme/language preferences
    fresh.settings.theme = this.data.settings.theme;
    fresh.settings.language = this.data.settings.language;
    this.saveData(fresh);
  }
}
