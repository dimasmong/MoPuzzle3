import { GameId, ProgressionState } from './types';
import { Persistence } from './persistence';

export interface VictorySummary {
  gameId: GameId;
  level: number;
  moves: number;
  timeSeconds: number;
  stars: number;
  isMaxLevel: boolean;
  bestMoves: number;
  bestTime: number;
}

export interface LevelProgressionCallbacks {
  onLevelStart: (level: number) => void;
  onVictory: (summary: VictorySummary) => void;
  onCampaignComplete?: () => void;
  onDisposePreviousLevel?: () => void;
}

export class ProgressionManager {
  private gameId: GameId;
  private currentLevel: number;
  private maxLevels: number;
  private state: ProgressionState = 'PLAYING';
  private callbacks: LevelProgressionCallbacks;
  private persistence: Persistence;
  private isProcessingTransition = false;

  constructor(
    gameId: GameId,
    initialLevel: number,
    maxLevels: number = 20,
    callbacks: LevelProgressionCallbacks
  ) {
    this.gameId = gameId;
    this.currentLevel = Math.max(1, Math.min(initialLevel, maxLevels));
    this.maxLevels = maxLevels;
    this.callbacks = callbacks;
    this.persistence = Persistence.getInstance();
  }

  public getState(): ProgressionState {
    return this.state;
  }

  public getCurrentLevel(): number {
    return this.currentLevel;
  }

  public getMaxLevels(): number {
    return this.maxLevels;
  }

  public getGameId(): GameId {
    return this.gameId;
  }

  /**
   * Called when the puzzle logic engine confirms a complete, valid win.
   * State transitions: PLAYING -> COMPLETING -> COMPLETED.
   */
  public triggerCompletion(moves: number, timeSeconds: number, stars: number = 3): boolean {
    if (this.state !== 'PLAYING') {
      console.warn(`[Progression] Ignored completion event in state ${this.state}`);
      return false;
    }

    this.state = 'COMPLETING';

    try {
      // 1. Store completion record exactly once
      this.persistence.recordLevelCompletion(
        this.gameId,
        this.currentLevel,
        moves,
        timeSeconds,
        stars
      );

      const progress = this.persistence.getLevelProgress(this.gameId, this.currentLevel);
      const isMaxLevel = this.currentLevel >= this.maxLevels;

      this.state = 'COMPLETED';

      // 2. Fire victory callback
      this.callbacks.onVictory({
        gameId: this.gameId,
        level: this.currentLevel,
        moves,
        timeSeconds,
        stars,
        isMaxLevel,
        bestMoves: progress?.bestMoves ?? moves,
        bestTime: progress?.bestTime ?? timeSeconds,
      });

      return true;
    } catch (err) {
      console.error('[Progression] Error during level completion', err);
      this.state = 'PLAYING';
      return false;
    }
  }

  /**
   * Advance to the next level.
   * Debounced and state-checked to guarantee single execution.
   */
  public advanceToNextLevel(): boolean {
    if (this.isProcessingTransition) {
      return false;
    }

    if (this.state !== 'COMPLETED') {
      console.warn(`[Progression] advanceToNextLevel called in invalid state: ${this.state}`);
      return false;
    }

    if (this.currentLevel >= this.maxLevels) {
      if (this.callbacks.onCampaignComplete) {
        this.callbacks.onCampaignComplete();
      }
      return false;
    }

    this.isProcessingTransition = true;
    this.state = 'LOADING_NEXT';

    try {
      // Clean up old level listeners/views
      if (this.callbacks.onDisposePreviousLevel) {
        this.callbacks.onDisposePreviousLevel();
      }

      this.currentLevel += 1;
      this.persistence.setLastPlayed(this.gameId, this.currentLevel);
      this.persistence.clearActiveGame(this.gameId);

      this.state = 'PLAYING';
      this.callbacks.onLevelStart(this.currentLevel);
      return true;
    } finally {
      this.isProcessingTransition = false;
    }
  }

  /**
   * Replay current level cleanly.
   */
  public replayCurrentLevel(): void {
    if (this.isProcessingTransition) return;
    this.isProcessingTransition = true;
    this.state = 'LOADING_NEXT';

    try {
      if (this.callbacks.onDisposePreviousLevel) {
        this.callbacks.onDisposePreviousLevel();
      }
      this.persistence.clearActiveGame(this.gameId);
      this.state = 'PLAYING';
      this.callbacks.onLevelStart(this.currentLevel);
    } finally {
      this.isProcessingTransition = false;
    }
  }

  /**
   * Load specific level (e.g., from Level Select).
   */
  public loadLevel(level: number): void {
    if (this.isProcessingTransition) return;
    this.isProcessingTransition = true;
    this.state = 'LOADING_NEXT';

    try {
      if (this.callbacks.onDisposePreviousLevel) {
        this.callbacks.onDisposePreviousLevel();
      }
      this.currentLevel = Math.max(1, Math.min(level, this.maxLevels));
      this.persistence.setLastPlayed(this.gameId, this.currentLevel);
      this.state = 'PLAYING';
      this.callbacks.onLevelStart(this.currentLevel);
    } finally {
      this.isProcessingTransition = false;
    }
  }

  public dispose(): void {
    this.state = 'IDLE';
    if (this.callbacks.onDisposePreviousLevel) {
      this.callbacks.onDisposePreviousLevel();
    }
  }
}
