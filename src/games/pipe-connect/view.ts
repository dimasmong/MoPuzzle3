import { PipeEngine } from './engine';
import { PipeType } from './types';
import { AudioEngine } from '../../core/audio';
import { ProgressionManager } from '../../core/progression';
import { Persistence } from '../../core/persistence';
import { Toast } from '../../ui/components';
import { I18n } from '../../core/i18n';
import { Icons } from '../../ui/icons';

export class PipeView {
  private container: HTMLElement;
  private engine: PipeEngine;
  private progression: ProgressionManager;
  private timerInterval: number | null = null;
  private elapsedSeconds: number = 0;
  private isPaused: boolean = false;

  constructor(
    container: HTMLElement,
    engine: PipeEngine,
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

    this.container.innerHTML = `
      <div class="gameplay-wrapper">
        <div class="game-top-bar">
          <button class="action-btn" id="pipe-back-btn" title="Back">
            ${Icons.chevronLeft}
            <span>${I18n.t('levelSelect')}</span>
          </button>
          <div class="game-title-group">
            <span class="game-title-text">${I18n.t('game.pipe-connect.title')}</span>
            <span class="game-mode-badge">${I18n.t('level')} ${level.level} • ${level.rows}×${level.cols}</span>
          </div>
          <button class="icon-btn" id="pipe-pause-btn" title="${I18n.t('pause')}" aria-label="${I18n.t('pause')}">
            ${Icons.pause}
          </button>
        </div>

        <div class="game-hud">
          <div class="hud-item">
            <span class="hud-label">${I18n.t('time')}</span>
            <span class="hud-value" id="pipe-timer-val">${this.formatTime(this.elapsedSeconds)}</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">${I18n.t('moves')}</span>
            <span class="hud-value" id="pipe-moves-val">${this.engine.getMovesCount()}</span>
          </div>
        </div>

        <div class="game-arena-container">
          <div class="pipe-board-container">
            <div class="pipe-grid" id="pipe-grid" style="grid-template-columns: repeat(${level.cols}, 1fr);">
              ${this.renderCells()}
            </div>
          </div>
        </div>

        <!-- Controls Toolbar -->
        <div class="game-controls-bar">
          <button class="action-btn" id="pipe-undo-btn" title="${I18n.t('undo')}">
            ${Icons.undo}
            <span>${I18n.t('undo')}</span>
          </button>
          <button class="action-btn" id="pipe-hint-btn" title="${I18n.t('hint')}">
            ${Icons.hint}
            <span>${I18n.t('hint')}</span>
          </button>
          <button class="action-btn" id="pipe-restart-btn" title="${I18n.t('restart')}">
            ${Icons.restart}
            <span>${I18n.t('restart')}</span>
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private renderCells(): string {
    const cells = this.engine.getCells();
    let html = '';

    for (let r = 0; r < cells.length; r++) {
      for (let c = 0; c < cells[r].length; c++) {
        const cell = cells[r][c];
        const isWatered = cell.isWatered;
        const deg = cell.rotation * 90;
        const svg = this.getPipeSvg(cell.type, isWatered);

        html += `
          <div class="pipe-cell ${isWatered ? 'connected' : ''}" data-row="${r}" data-col="${c}" style="transform: rotate(${deg}deg);">
            ${svg}
          </div>
        `;
      }
    }
    return html;
  }

  private getPipeSvg(type: PipeType, isWatered: boolean): string {
    const pipeColor = isWatered ? '#0284C7' : '#64748B';
    const flowColor = isWatered ? '#38BDF8' : '#94A3B8';
    const glow = isWatered ? 'filter="drop-shadow(0 0 5px #38BDF8)"' : '';

    switch (type) {
      case 'straight':
        return `<svg viewBox="0 0 100 100" width="100%" height="100%" ${glow}>
          <line x1="50" y1="0" x2="50" y2="100" stroke="${pipeColor}" stroke-width="26" stroke-linecap="butt"/>
          <line class="flow" x1="50" y1="0" x2="50" y2="100" stroke="${flowColor}" stroke-width="12" stroke-linecap="butt"/>
        </svg>`;
      case 'corner':
        return `<svg viewBox="0 0 100 100" width="100%" height="100%" ${glow}>
          <path d="M 50 0 L 50 50 L 100 50" fill="none" stroke="${pipeColor}" stroke-width="26" stroke-linecap="butt"/>
          <path class="flow" d="M 50 0 L 50 50 L 100 50" fill="none" stroke="${flowColor}" stroke-width="12" stroke-linecap="butt"/>
        </svg>`;
      case 'tee':
        return `<svg viewBox="0 0 100 100" width="100%" height="100%" ${glow}>
          <line x1="0" y1="50" x2="100" y2="50" stroke="${pipeColor}" stroke-width="26"/>
          <line x1="50" y1="0" x2="50" y2="50" stroke="${pipeColor}" stroke-width="26"/>
          <line class="flow" x1="0" y1="50" x2="100" y2="50" stroke="${flowColor}" stroke-width="12"/>
          <line class="flow" x1="50" y1="0" x2="50" y2="50" stroke="${flowColor}" stroke-width="12"/>
        </svg>`;
      case 'cross':
        return `<svg viewBox="0 0 100 100" width="100%" height="100%" ${glow}>
          <line x1="0" y1="50" x2="100" y2="50" stroke="${pipeColor}" stroke-width="26"/>
          <line x1="50" y1="0" x2="50" y2="100" stroke="${pipeColor}" stroke-width="26"/>
          <line class="flow" x1="0" y1="50" x2="100" y2="50" stroke="${flowColor}" stroke-width="12"/>
          <line class="flow" x1="50" y1="0" x2="50" y2="100" stroke="${flowColor}" stroke-width="12"/>
        </svg>`;
      case 'source':
        return `<svg viewBox="0 0 100 100" width="100%" height="100%" filter="drop-shadow(0 0 8px #0284C7)">
          <line x1="50" y1="0" x2="50" y2="50" stroke="#0284C7" stroke-width="26"/>
          <circle cx="50" cy="50" r="30" fill="#0284C7" stroke="#38BDF8" stroke-width="4"/>
          <circle cx="50" cy="50" r="14" fill="#FFFFFF"/>
          <line class="flow" x1="50" y1="0" x2="50" y2="50" stroke="#38BDF8" stroke-width="12"/>
        </svg>`;
      case 'destination':
        return `<svg viewBox="0 0 100 100" width="100%" height="100%" ${glow}>
          <line x1="50" y1="0" x2="50" y2="50" stroke="${pipeColor}" stroke-width="26"/>
          <circle cx="50" cy="50" r="28" fill="${isWatered ? '#10B981' : '#64748B'}" stroke="#FFFFFF" stroke-width="3"/>
          <circle cx="50" cy="50" r="12" fill="${isWatered ? '#A7F3D0' : '#94A3B8'}"/>
          <line class="flow" x1="50" y1="0" x2="50" y2="50" stroke="${flowColor}" stroke-width="12"/>
        </svg>`;
      case 'cap':
        return `<svg viewBox="0 0 100 100" width="100%" height="100%" ${glow}>
          <line x1="50" y1="0" x2="50" y2="50" stroke="${pipeColor}" stroke-width="26"/>
          <circle cx="50" cy="50" r="13" fill="${pipeColor}"/>
          <line class="flow" x1="50" y1="0" x2="50" y2="50" stroke="${flowColor}" stroke-width="12"/>
        </svg>`;
      default:
        return '';
    }
  }

  private updateBoardDOM(): void {
    const gridEl = this.container.querySelector('#pipe-grid');
    if (gridEl) {
      gridEl.innerHTML = this.renderCells();
    }
    this.updateHUD();
  }

  private updateHUD(): void {
    const timerEl = this.container.querySelector('#pipe-timer-val');
    if (timerEl) timerEl.textContent = this.formatTime(this.elapsedSeconds);

    const movesEl = this.container.querySelector('#pipe-moves-val');
    if (movesEl) movesEl.textContent = String(this.engine.getMovesCount());
  }

  private bindEvents(): void {
    const grid = this.container.querySelector('#pipe-grid');
    if (!grid) return;

    grid.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('.pipe-cell');
      if (target) {
        const r = parseInt(target.getAttribute('data-row')!, 10);
        const c = parseInt(target.getAttribute('data-col')!, 10);
        this.handleCellRotate(r, c);
      }
    });

    this.container.querySelector('#pipe-undo-btn')?.addEventListener('click', () => {
      if (this.engine.undo()) {
        AudioEngine.getInstance().playUndo();
        this.updateBoardDOM();
        this.autosave();
      }
    });

    this.container.querySelector('#pipe-hint-btn')?.addEventListener('click', () => {
      const hint = this.engine.applyHint();
      if (hint) {
        AudioEngine.getInstance().playHint();
        Persistence.getInstance().recordHintUsed();
        Toast.show('Adjusted a pipe to the correct alignment!');
        this.updateBoardDOM();
        this.autosave();
        if (this.engine.isWon()) {
          this.handleWin();
        }
      }
    });

    this.container.querySelector('#pipe-restart-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      this.progression.replayCurrentLevel();
    });

    this.container.querySelector('#pipe-back-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      window.location.hash = '#levelselect?game=pipe-connect';
    });

    this.container.querySelector('#pipe-pause-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      window.dispatchEvent(new CustomEvent('request-pause-modal'));
    });
  }

  private handleCellRotate(r: number, c: number): void {
    const res = this.engine.rotateCell(r, c);
    if (res.success) {
      AudioEngine.getInstance().playPipeRotate();
      Persistence.getInstance().recordMoveMade();
      this.updateBoardDOM();
      this.autosave();

      if (res.isComplete) {
        AudioEngine.getInstance().playPipeFlow();
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
    if (moves > 25) stars = 2;
    if (moves > 50) stars = 1;

    AudioEngine.getInstance().playVictory();
    this.progression.triggerCompletion(moves, this.elapsedSeconds, stars);
  }

  private autosave(): void {
    Persistence.getInstance().saveActiveGame({
      gameId: 'pipe-connect',
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
