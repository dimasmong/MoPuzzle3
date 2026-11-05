import { BoxPusherEngine } from './engine';
import { Direction } from './types';
import { AudioEngine } from '../../core/audio';
import { ProgressionManager } from '../../core/progression';
import { Persistence } from '../../core/persistence';
import { Toast } from '../../ui/components';
import { I18n } from '../../core/i18n';
import { Icons } from '../../ui/icons';

export class BoxPusherView {
  private container: HTMLElement;
  private engine: BoxPusherEngine;
  private progression: ProgressionManager;
  private timerInterval: number | null = null;
  private elapsedSeconds: number = 0;
  private isPaused: boolean = false;
  private boundKeyDown: (e: KeyboardEvent) => void;

  constructor(
    container: HTMLElement,
    engine: BoxPusherEngine,
    progression: ProgressionManager,
    initialElapsed: number = 0
  ) {
    this.container = container;
    this.engine = engine;
    this.progression = progression;
    this.elapsedSeconds = initialElapsed;

    this.boundKeyDown = this.handleKeyDown.bind(this);
    window.addEventListener('keydown', this.boundKeyDown);

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
    const dims = this.engine.getGridDimensions();

    this.container.innerHTML = `
      <div class="gameplay-wrapper">
        <div class="game-top-bar">
          <button class="action-btn" id="box-back-btn" title="Back">
            ${Icons.chevronLeft}
            <span>${I18n.t('levelSelect')}</span>
          </button>
          <div class="game-title-group">
            <span class="game-title-text">${I18n.t('game.box-pusher.title')}</span>
            <span class="game-mode-badge">${I18n.t('level')} ${level.level} • ${dims.rows}×${dims.cols}</span>
          </div>
          <button class="icon-btn" id="box-pause-btn" title="${I18n.t('pause')}" aria-label="${I18n.t('pause')}">
            ${Icons.pause}
          </button>
        </div>

        <div class="game-hud">
          <div class="hud-item">
            <span class="hud-label">${I18n.t('time')}</span>
            <span class="hud-value" id="box-timer-val">${this.formatTime(this.elapsedSeconds)}</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">${I18n.t('steps')}</span>
            <span class="hud-value" id="box-steps-val">${this.engine.getStepsCount()}</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">${I18n.t('pushes')}</span>
            <span class="hud-value" id="box-pushes-val" style="color: #F59E0B;">${this.engine.getPushesCount()}</span>
          </div>
        </div>

        <div class="game-arena-container">
          <div class="boxpusher-board-container">
            <div class="boxpusher-grid" id="box-grid" style="grid-template-columns: repeat(${dims.cols}, clamp(28px, 6vw, 42px));">
              ${this.renderTiles()}
            </div>

            <!-- Mobile Touch D-Pad -->
            <div class="dpad-controls" id="box-dpad">
              <div></div>
              <button class="dpad-btn" data-dir="up" aria-label="Move Up">⬆️</button>
              <div></div>
              <button class="dpad-btn" data-dir="left" aria-label="Move Left">⬅️</button>
              <div></div>
              <button class="dpad-btn" data-dir="right" aria-label="Move Right">➡️</button>
              <div></div>
              <button class="dpad-btn" data-dir="down" aria-label="Move Down">⬇️</button>
              <div></div>
            </div>
          </div>
        </div>

        <!-- Controls Toolbar -->
        <div class="game-controls-bar">
          <button class="action-btn" id="box-undo-btn" title="${I18n.t('undo')}">
            ${Icons.undo}
            <span>${I18n.t('undo')}</span>
          </button>
          <button class="action-btn" id="box-hint-btn" title="${I18n.t('hint')}">
            ${Icons.hint}
            <span>${I18n.t('hint')}</span>
          </button>
          <button class="action-btn" id="box-restart-btn" title="${I18n.t('restart')}">
            ${Icons.restart}
            <span>${I18n.t('restart')}</span>
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private renderTiles(): string {
    const dims = this.engine.getGridDimensions();
    const walls = this.engine.getWalls();
    const targets = this.engine.getTargets();
    const player = this.engine.getPlayerPos();
    const boxes = this.engine.getBoxes();

    let html = '';
    for (let r = 0; r < dims.rows; r++) {
      for (let c = 0; c < dims.cols; c++) {
        const isWall = walls[r][c];
        const isTgt = targets.has(`${r},${c}`);
        const isPly = player[0] === r && player[1] === c;
        const isBx = boxes.some((b) => b[0] === r && b[1] === c);

        const classes = ['box-tile'];
        let content = '';

        if (isWall) {
          classes.push('wall');
        } else {
          classes.push('floor');
          if (isTgt) classes.push('target');

          if (isBx) {
            if (isTgt) {
              classes.push('crate-on-target');
              content = '📦';
            } else {
              classes.push('crate');
              content = '📦';
            }
          } else if (isPly) {
            classes.push('player');
            content = '🤖';
          }
        }

        html += `<div class="${classes.join(' ')}" data-row="${r}" data-col="${c}">${content}</div>`;
      }
    }
    return html;
  }

  private updateBoardDOM(): void {
    const gridEl = this.container.querySelector('#box-grid');
    if (gridEl) {
      gridEl.innerHTML = this.renderTiles();
    }
    this.updateHUD();
  }

  private updateHUD(): void {
    const timerEl = this.container.querySelector('#box-timer-val');
    if (timerEl) timerEl.textContent = this.formatTime(this.elapsedSeconds);

    const stepsEl = this.container.querySelector('#box-steps-val');
    if (stepsEl) stepsEl.textContent = String(this.engine.getStepsCount());

    const pushesEl = this.container.querySelector('#box-pushes-val');
    if (pushesEl) pushesEl.textContent = String(this.engine.getPushesCount());
  }

  private bindEvents(): void {
    // D-Pad buttons
    this.container.querySelectorAll('.dpad-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dir = btn.getAttribute('data-dir') as Direction;
        if (dir) this.handleMove(dir);
      });
    });

    this.container.querySelector('#box-undo-btn')?.addEventListener('click', () => {
      if (this.engine.undo()) {
        AudioEngine.getInstance().playUndo();
        this.updateBoardDOM();
        this.autosave();
      }
    });

    this.container.querySelector('#box-hint-btn')?.addEventListener('click', () => {
      const dir = this.engine.applyHint();
      if (dir) {
        AudioEngine.getInstance().playHint();
        Persistence.getInstance().recordHintUsed();
        Toast.show(`Pushed or stepped ${dir}!`);
        this.updateBoardDOM();
        this.autosave();
        if (this.engine.isWon()) {
          this.handleWin();
        }
      } else {
        Toast.show('No simple path found from current deadlock position. Try Undo!');
      }
    });

    this.container.querySelector('#box-restart-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      this.progression.replayCurrentLevel();
    });

    this.container.querySelector('#box-back-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      window.location.hash = '#levelselect?game=box-pusher';
    });

    this.container.querySelector('#box-pause-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      window.dispatchEvent(new CustomEvent('request-pause-modal'));
    });
  }

  private handleMove(dir: Direction): void {
    const res = this.engine.move(dir);
    if (res.success) {
      if (res.wasPush) {
        AudioEngine.getInstance().playBoxPush();
      } else {
        AudioEngine.getInstance().playBoxStep();
      }
      Persistence.getInstance().recordMoveMade();
      this.updateBoardDOM();
      this.autosave();

      if (res.isComplete) {
        this.handleWin();
      }
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.isPaused || this.engine.isWon()) return;

    if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
      e.preventDefault();
      this.handleMove('up');
    } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
      e.preventDefault();
      this.handleMove('down');
    } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
      e.preventDefault();
      this.handleMove('left');
    } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
      e.preventDefault();
      this.handleMove('right');
    } else if (e.key.toLowerCase() === 'z' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (this.engine.undo()) {
        AudioEngine.getInstance().playUndo();
        this.updateBoardDOM();
        this.autosave();
      }
    }
  }

  private handleWin(): void {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    let stars = 3;
    const pushes = this.engine.getPushesCount();
    if (pushes > 30) stars = 2;
    if (pushes > 60) stars = 1;

    AudioEngine.getInstance().playVictory();
    this.progression.triggerCompletion(
      this.engine.getStepsCount(),
      this.elapsedSeconds,
      stars
    );
  }

  private autosave(): void {
    Persistence.getInstance().saveActiveGame({
      gameId: 'box-pusher',
      level: this.engine.getLevel().level,
      moves: this.engine.getStepsCount(),
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
    window.removeEventListener('keydown', this.boundKeyDown);
    this.container.innerHTML = '';
  }
}
