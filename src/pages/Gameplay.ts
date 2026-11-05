import confetti from 'canvas-confetti';
import { GameId } from '../core/types';
import { ProgressionManager, VictorySummary } from '../core/progression';
import { Persistence } from '../core/persistence';
import { AudioEngine } from '../core/audio';
import { AchievementManager } from '../core/achievements';
import { Modal, Toast } from '../ui/components';
import { Router } from '../ui/router';
import { I18n } from '../core/i18n';
import { Icons } from '../ui/icons';

// Game views
import { SudokuEngine } from '../games/sudoku/engine';
import { SudokuView } from '../games/sudoku/view';
import { MinesweeperEngine } from '../games/minesweeper/engine';
import { MinesweeperView } from '../games/minesweeper/view';
import { PipeEngine } from '../games/pipe-connect/engine';
import { PipeView } from '../games/pipe-connect/view';
import { BoxPusherEngine } from '../games/box-pusher/engine';
import { BoxPusherView } from '../games/box-pusher/view';
import { MemoryEngine } from '../games/memory-flip/engine';
import { MemoryView } from '../games/memory-flip/view';
import { LightsOutEngine } from '../games/lights-out/engine';
import { LightsOutView } from '../games/lights-out/view';

export class GameplayPage {
  private container: HTMLElement;
  private gameId: GameId;
  private currentLevelNum: number;
  private progression: ProgressionManager | null = null;
  private activeView: any = null;
  private boundPauseListener: () => void;

  constructor(container: HTMLElement, gameId: GameId, levelNum: number) {
    this.container = container;
    this.gameId = gameId;
    this.currentLevelNum = levelNum;

    this.boundPauseListener = this.handlePauseModalRequest.bind(this);
    window.addEventListener('request-pause-modal', this.boundPauseListener);

    this.initLifecycle();
  }

  private initLifecycle(): void {
    // Clean up existing view if any
    if (this.activeView && typeof this.activeView.dispose === 'function') {
      this.activeView.dispose();
      this.activeView = null;
    }

    this.progression = new ProgressionManager(
      this.gameId,
      this.currentLevelNum,
      20,
      {
        onLevelStart: (newLevel) => {
          this.currentLevelNum = newLevel;
          this.loadGameView(newLevel);
        },
        onVictory: (summary) => {
          this.handleVictory(summary);
        },
        onCampaignComplete: () => {
          this.handleCampaignComplete();
        },
        onDisposePreviousLevel: () => {
          if (this.activeView && typeof this.activeView.dispose === 'function') {
            this.activeView.dispose();
            this.activeView = null;
          }
        },
      }
    );

    this.loadGameView(this.currentLevelNum);
  }

  private loadGameView(levelNum: number): void {
    if (this.activeView && typeof this.activeView.dispose === 'function') {
      this.activeView.dispose();
      this.activeView = null;
    }

    const saved = Persistence.getInstance().getActiveGame(this.gameId);
    const hasSavedState = saved && saved.level === levelNum;
    const initialElapsed = hasSavedState ? saved.timeSeconds : 0;
    const stateData = hasSavedState ? saved.state : undefined;

    switch (this.gameId) {
      case 'sudoku': {
        const engine = new SudokuEngine(levelNum, stateData);
        this.activeView = new SudokuView(
          this.container,
          engine,
          this.progression!,
          initialElapsed
        );
        break;
      }
      case 'minesweeper': {
        const engine = new MinesweeperEngine(levelNum, stateData);
        this.activeView = new MinesweeperView(
          this.container,
          engine,
          this.progression!,
          initialElapsed
        );
        break;
      }
      case 'pipe-connect': {
        const engine = new PipeEngine(levelNum, stateData);
        this.activeView = new PipeView(
          this.container,
          engine,
          this.progression!,
          initialElapsed
        );
        break;
      }
      case 'box-pusher': {
        const engine = new BoxPusherEngine(levelNum, stateData);
        this.activeView = new BoxPusherView(
          this.container,
          engine,
          this.progression!,
          initialElapsed
        );
        break;
      }
      case 'memory-flip': {
        const engine = new MemoryEngine(levelNum, stateData);
        this.activeView = new MemoryView(
          this.container,
          engine,
          this.progression!,
          initialElapsed
        );
        break;
      }
      case 'lights-out': {
        const engine = new LightsOutEngine(levelNum, stateData);
        this.activeView = new LightsOutView(
          this.container,
          engine,
          this.progression!,
          initialElapsed
        );
        break;
      }
    }
  }

  private handleVictory(summary: VictorySummary): void {
    // 1. Fire celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
      });
    } catch {}

    // 2. Evaluate achievements
    const unlockedAchs = AchievementManager.getInstance().evaluate({
      gameId: summary.gameId,
      level: summary.level,
      timeSeconds: summary.timeSeconds,
      moves: summary.moves,
    });
    for (const ach of unlockedAchs) {
      Toast.show(`🏆 ${I18n.t(ach.nameKey)}: ${I18n.t(ach.descKey)}`);
    }

    // 3. Format star graphics
    let starsHtml = '';
    for (let s = 1; s <= 3; s++) {
      starsHtml += `<span style="font-size: 32px; color: ${
        s <= summary.stars ? '#F59E0B' : 'rgba(0,0,0,0.15)'
      };">★</span>`;
    }

    const mins = Math.floor(summary.timeSeconds / 60);
    const secs = summary.timeSeconds % 60;
    const timeFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    // If final level, show campaign victory modal!
    if (summary.isMaxLevel) {
      Modal.open(
        I18n.t('campaignCompleteTitle'),
        `
        <div class="result-banner">
          <div class="result-icon">👑</div>
          <div class="result-title" style="color: #10B981;">${I18n.t('campaignCompleteTitle')}</div>
          <div class="result-desc">${I18n.t('campaignCompleteSub')}</div>
          <div style="margin-bottom: 16px;">${starsHtml}</div>
          <div class="result-stats-grid">
            <div class="result-stat-box">
              <div class="result-stat-title">${I18n.t('moves')}</div>
              <div class="result-stat-value">${summary.moves}</div>
            </div>
            <div class="result-stat-box">
              <div class="result-stat-title">${I18n.t('time')}</div>
              <div class="result-stat-value">${timeFormatted}</div>
            </div>
          </div>
        </div>
        `,
        `
        <button class="btn btn-secondary" id="modal-menu-btn">${I18n.t('levelSelect')}</button>
        <button class="btn btn-primary" id="modal-replay-btn">${I18n.t('replay')}</button>
        `
      );

      document.getElementById('modal-menu-btn')?.addEventListener('click', () => {
        Modal.close();
        Router.navigate('levelselect', { gameId: this.gameId });
      });

      document.getElementById('modal-replay-btn')?.addEventListener('click', () => {
        Modal.close();
        this.progression?.replayCurrentLevel();
      });
      return;
    }

    // Standard Next Level Victory Modal
    Modal.open(
      I18n.t('victory'),
      `
      <div class="result-banner">
        <div class="result-icon">🎉</div>
        <div class="result-title" style="color: #10B981;">${I18n.t('victory')}</div>
        <div class="result-desc">${I18n.t('victorySub')}</div>
        <div style="margin-bottom: 16px;">${starsHtml}</div>
        <div class="result-stats-grid">
          <div class="result-stat-box">
            <div class="result-stat-title">${I18n.t('moves')}</div>
            <div class="result-stat-value">${summary.moves}</div>
          </div>
          <div class="result-stat-box">
            <div class="result-stat-title">${I18n.t('time')}</div>
            <div class="result-stat-value">${timeFormatted}</div>
          </div>
        </div>
      </div>
      `,
      `
      <button class="btn btn-secondary" id="modal-replay-btn">${I18n.t('replay')}</button>
      <button class="btn btn-primary" id="modal-next-btn">
        <span>${I18n.t('nextLevel')}</span>
        ${Icons.chevronRight}
      </button>
      `
    );

    document.getElementById('modal-next-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      Modal.close();
      this.progression?.advanceToNextLevel();
    });

    document.getElementById('modal-replay-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      Modal.close();
      this.progression?.replayCurrentLevel();
    });
  }

  private handleCampaignComplete(): void {
    AudioEngine.getInstance().playCampaignComplete();
    Modal.open(
      I18n.t('campaignCompleteTitle'),
      `
      <div class="result-banner">
        <div class="result-icon">🏆</div>
        <div class="result-title" style="color: #10B981;">${I18n.t('campaignCompleteTitle')}</div>
        <div class="result-desc">${I18n.t('campaignCompleteSub')}</div>
      </div>
      `,
      `
      <button class="btn btn-primary" id="campaign-menu-btn">${I18n.t('levelSelect')}</button>
      `
    );
    document.getElementById('campaign-menu-btn')?.addEventListener('click', () => {
      Modal.close();
      Router.navigate('levelselect', { gameId: this.gameId });
    });
  }

  private handlePauseModalRequest(): void {
    if (this.activeView && typeof this.activeView.setPaused === 'function') {
      this.activeView.setPaused(true);
    }

    const soundEnabled = AudioEngine.getInstance().isSFXEnabled();
    const musicEnabled = AudioEngine.getInstance().isBGMEnabled();

    Modal.open(
      I18n.t('paused'),
      `
      <div style="display: flex; flex-direction: column; gap: 14px; padding: 10px 0;">
        <button class="btn btn-secondary btn-block" id="pause-resume-btn" style="padding: 12px;">
          ${Icons.play}
          <span>${I18n.t('resumeGame')}</span>
        </button>
        <button class="btn btn-secondary btn-block" id="pause-restart-btn" style="padding: 12px;">
          ${Icons.restart}
          <span>${I18n.t('restart')}</span>
        </button>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-top: 1px solid var(--card-border);">
          <span style="font-size: 14px; font-weight: 600;">${I18n.t('soundEffects')}</span>
          <button class="action-btn" id="pause-sound-toggle" style="min-height: 38px;">
            ${soundEnabled ? '🔊 ON' : '🔇 OFF'}
          </button>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-top: 1px solid var(--card-border);">
          <span style="font-size: 14px; font-weight: 600;">${I18n.t('backgroundMusic')}</span>
          <button class="action-btn" id="pause-music-toggle" style="min-height: 38px;">
            ${musicEnabled ? '🎵 ON' : '🔇 OFF'}
          </button>
        </div>
        <button class="btn btn-danger btn-block" id="pause-quit-btn" style="padding: 12px; margin-top: 6px;">
          ${I18n.t('quitGame')}
        </button>
      </div>
      `,
      ''
    );

    document.getElementById('pause-resume-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      Modal.close();
      if (this.activeView && typeof this.activeView.setPaused === 'function') {
        this.activeView.setPaused(false);
      }
    });

    document.getElementById('pause-restart-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      Modal.close();
      this.progression?.replayCurrentLevel();
    });

    document.getElementById('pause-sound-toggle')?.addEventListener('click', (e) => {
      const btn = e.currentTarget as HTMLElement;
      const nowEnabled = !AudioEngine.getInstance().isSFXEnabled();
      AudioEngine.getInstance().setSoundEnabled(nowEnabled);
      btn.textContent = nowEnabled ? '🔊 ON' : '🔇 OFF';
      AudioEngine.getInstance().playClick();
    });

    document.getElementById('pause-music-toggle')?.addEventListener('click', (e) => {
      const btn = e.currentTarget as HTMLElement;
      const nowEnabled = !AudioEngine.getInstance().isBGMEnabled();
      AudioEngine.getInstance().setMusicEnabled(nowEnabled);
      btn.textContent = nowEnabled ? '🎵 ON' : '🔇 OFF';
      AudioEngine.getInstance().playClick();
    });

    document.getElementById('pause-quit-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      Modal.close();
      Router.navigate('levelselect', { gameId: this.gameId });
    });
  }

  public dispose(): void {
    window.removeEventListener('request-pause-modal', this.boundPauseListener);
    if (this.progression) {
      this.progression.dispose();
      this.progression = null;
    }
    if (this.activeView && typeof this.activeView.dispose === 'function') {
      this.activeView.dispose();
      this.activeView = null;
    }
    this.container.innerHTML = '';
  }
}
