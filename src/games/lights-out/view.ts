import { LightsOutEngine } from './engine';
import { AudioEngine } from '../../core/audio';
import { ProgressionManager } from '../../core/progression';
import { Persistence } from '../../core/persistence';
import { Toast } from '../../ui/components';
import { I18n } from '../../core/i18n';
import { Icons } from '../../ui/icons';

export class LightsOutView {
  private container: HTMLElement;
  private engine: LightsOutEngine;
  private progression: ProgressionManager;
  private timerInterval: number | null = null;
  private elapsedSeconds: number = 0;
  private isPaused: boolean = false;

  constructor(
    container: HTMLElement,
    engine: LightsOutEngine,
    progression: ProgressionManager,
    initialElapsed: number = 0
  ) {
    this.container = container;
    this.engine = engine;
    this.progression = progression;
    this.elapsedSeconds = initialElapsed;

    this.render();
    this.startTimer();
  }

  private startTimer(): void {
    if (this.timerInterval !== null) clearInterval(this.timerInterval);
    this.timerInterval = window.setInterval(() => {
      if (!this.isPaused && !this.engine.isWon()) {
        this.elapsedSeconds++;
        this.updateHUD();
        this.autosave();
      }
    }, 1000);
  }

  private formatTime(totalSec: number): string {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
  }

  private render(): void {
    const level = this.engine.getLevel();
    const size = this.engine.getSize();

    this.container.innerHTML = `
      <div class="gameplay-wrapper">
        <div class="game-top-bar">
          <button class="action-btn" id="light-back-btn" title="Back">
            ${Icons.chevronLeft}
            <span>${I18n.t('levelSelect')}</span>
          </button>
          <div class="game-title-group">
            <span class="game-title-text">${I18n.t('game.lights-out.title')}</span>
            <span class="game-mode-badge">${I18n.t('level')} ${level.level} • ${size}×${size}</span>
          </div>
          <button class="icon-btn" id="light-pause-btn" title="${I18n.t('pause')}" aria-label="${I18n.t('pause')}">
            ${Icons.pause}
          </button>
        </div>

        <div class="game-hud">
          <div class="hud-item">
            <span class="hud-label">${I18n.t('time')}</span>
            <span class="hud-value" id="light-timer-val">${this.formatTime(this.elapsedSeconds)}</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">${I18n.t('moves')}</span>
            <span class="hud-value" id="light-moves-val">${this.engine.getMovesCount()}</span>
          </div>
        </div>

        <div class="game-arena-container">
          <div class="lightsout-board-container">
            <div class="lightsout-grid" id="light-grid" style="grid-template-columns: repeat(${size}, clamp(46px, 16vw, 76px));">
              ${this.renderTiles()}
            </div>
          </div>
        </div>

        <!-- Controls Toolbar -->
        <div class="game-controls-bar">
          <button class="action-btn" id="light-undo-btn" title="${I18n.t('undo')}">
            ${Icons.undo}
            <span>${I18n.t('undo')}</span>
          </button>
          <button class="action-btn" id="light-hint-btn" title="${I18n.t('hint')}">
            ${Icons.hint}
            <span>${I18n.t('hint')}</span>
          </button>
          <button class="action-btn" id="light-restart-btn" title="${I18n.t('restart')}">
            ${Icons.restart}
            <span>${I18n.t('restart')}</span>
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private renderTiles(): string {
    const grid = this.engine.getGrid();
    const size = this.engine.getSize();
    let html = '';

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const isOn = grid[r][c];
        html += `
          <div class="light-tile ${isOn ? 'on' : 'off'}" data-row="${r}" data-col="${c}" aria-label="Tile ${r},${c} ${isOn ? 'On' : 'Off'}">
            <span>${isOn ? '💡' : ''}</span>
          </div>
        `;
      }
    }
    return html;
  }

  private updateBoardDOM(): void {
    const gridEl = this.container.querySelector('#light-grid');
    if (gridEl) {
      gridEl.innerHTML = this.renderTiles();
    }
    this.updateHUD();
  }

  private updateHUD(): void {
    const timerEl = this.container.querySelector('#light-timer-val');
    if (timerEl) timerEl.textContent = this.formatTime(this.elapsedSeconds);

    const movesEl = this.container.querySelector('#light-moves-val');
    if (movesEl) movesEl.textContent = String(this.engine.getMovesCount());
  }

  private bindEvents(): void {
    const grid = this.container.querySelector('#light-grid');
    if (!grid) return;

    grid.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('.light-tile');
      if (target) {
        const r = parseInt(target.getAttribute('data-row')!, 10);
        const c = parseInt(target.getAttribute('data-col')!, 10);
        this.handleTileClick(r, c);
      }
    });

    this.container.querySelector('#light-undo-btn')?.addEventListener('click', () => {
      if (this.engine.undo()) {
        AudioEngine.getInstance().playUndo();
        this.updateBoardDOM();
        this.autosave();
      }
    });

    this.container.querySelector('#light-hint-btn')?.addEventListener('click', () => {
      const hint = this.engine.applyHint();
      if (hint) {
        AudioEngine.getInstance().playHint();
        Persistence.getInstance().recordHintUsed();
        Toast.show(`Toggled optimal tile at row ${hint[0] + 1}, col ${hint[1] + 1}!`);
        this.updateBoardDOM();
        this.autosave();
        if (this.engine.isWon()) {
          this.handleWin();
        }
      }
    });

    this.container.querySelector('#light-restart-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      this.progression.replayCurrentLevel();
    });

    this.container.querySelector('#light-back-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      window.location.hash = '#levelselect?game=lights-out';
    });

    this.container.querySelector('#light-pause-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      window.dispatchEvent(new CustomEvent('request-pause-modal'));
    });
  }

  private handleTileClick(r: number, c: number): void {
    const res = this.engine.toggle(r, c);
    if (res.success) {
      AudioEngine.getInstance().playLightToggle();
      Persistence.getInstance().recordMoveMade();
      this.updateBoardDOM();
      this.autosave();

      if (res.isComplete) {
        this.handleWin();
      }
    }
  }

  private handleWin(): void {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    let stars = 3;
    const moves = this.engine.getMovesCount();
    if (moves > 18) stars = 2;
    if (moves > 35) stars = 1;

    AudioEngine.getInstance().playVictory();
    this.progression.triggerCompletion(moves, this.elapsedSeconds, stars);
  }

  private autosave(): void {
    Persistence.getInstance().saveActiveGame({
      gameId: 'lights-out',
      level: this.engine.getLevel().level,
      moves: this.engine.getMovesCount(),
      timeSeconds: this.elapsedSeconds,
      state: this.engine.serialize(),
      updatedAt: Date.now(),
    });
  }

  public dispose(): void {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.container.innerHTML = '';
  }
}
