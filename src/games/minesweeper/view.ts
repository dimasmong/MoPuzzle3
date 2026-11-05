import { MinesweeperEngine } from './engine';
import { AudioEngine } from '../../core/audio';
import { ProgressionManager } from '../../core/progression';
import { Persistence } from '../../core/persistence';
import { Modal } from '../../ui/components';
import { I18n } from '../../core/i18n';
import { Icons } from '../../ui/icons';

export class MinesweeperView {
  private container: HTMLElement;
  private engine: MinesweeperEngine;
  private progression: ProgressionManager;
  private timerInterval: number | null = null;
  private elapsedSeconds: number = 0;
  private isPaused: boolean = false;
  private isFlagModeMobile: boolean = false;

  constructor(
    container: HTMLElement,
    engine: MinesweeperEngine,
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
      if (!this.isPaused && !this.engine.isWon() && !this.engine.isLost()) {
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
    const diffKey = `game.minesweeper.difficulty.${level.difficulty}`;

    this.container.innerHTML = `
      <div class="gameplay-wrapper">
        <div class="game-top-bar">
          <button class="action-btn" id="mines-back-btn" title="Back">
            ${Icons.chevronLeft}
            <span>${I18n.t('levelSelect')}</span>
          </button>
          <div class="game-title-group">
            <span class="game-title-text">${I18n.t('game.minesweeper.title')}</span>
            <span class="game-mode-badge">${I18n.t('level')} ${level.level} • ${I18n.t(diffKey)}</span>
          </div>
          <button class="icon-btn" id="mines-pause-btn" title="${I18n.t('pause')}" aria-label="${I18n.t('pause')}">
            ${Icons.pause}
          </button>
        </div>

        <div class="game-hud">
          <div class="hud-item">
            <span class="hud-label">${I18n.t('time')}</span>
            <span class="hud-value" id="mines-timer-val">${this.formatTime(this.elapsedSeconds)}</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">${I18n.t('game.minesweeper.minesLeft')}</span>
            <span class="hud-value" id="mines-count-val" style="color: #EF4444;">${this.engine.getMinesRemaining()}</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">${I18n.t('moves')}</span>
            <span class="hud-value" id="mines-moves-val">${this.engine.getMovesCount()}</span>
          </div>
        </div>

        <div class="game-arena-container">
          <div class="minesweeper-board-container">
            <div class="minesweeper-grid" id="mines-grid" style="grid-template-columns: repeat(${level.cols}, clamp(26px, 6vw, 36px));">
              ${this.renderCells()}
            </div>
          </div>
        </div>

        <!-- Controls Toolbar -->
        <div class="game-controls-bar">
          <button class="action-btn ${this.isFlagModeMobile ? 'active' : ''}" id="mines-flag-toggle-btn" title="${I18n.t('flag')}">
            ${Icons.flag}
            <span>${I18n.t('flag')}</span>
          </button>
          <button class="action-btn" id="mines-restart-btn" title="${I18n.t('restart')}">
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
        const classes = ['mine-cell'];

        if (!cell.isRevealed) {
          classes.push('unrevealed');
        } else {
          classes.push('revealed');
          if (cell.isMine) {
            classes.push('mine');
            if (cell.isExploded) classes.push('exploded');
          }
        }

        let content = '';
        if (cell.isFlagged && !cell.isRevealed) {
          content = '🚩';
        } else if (cell.isRevealed) {
          if (cell.isMine) {
            content = '💣';
          } else if (cell.adjacentMines > 0) {
            content = String(cell.adjacentMines);
          }
        }

        const countAttr = cell.isRevealed && cell.adjacentMines > 0 ? `data-count="${cell.adjacentMines}"` : '';

        html += `
          <div class="${classes.join(' ')}" data-row="${r}" data-col="${c}" ${countAttr}>
            ${content}
          </div>
        `;
      }
    }
    return html;
  }

  private updateBoardDOM(): void {
    const gridEl = this.container.querySelector('#mines-grid');
    if (gridEl) {
      gridEl.innerHTML = this.renderCells();
    }
    this.updateHUD();
  }

  private updateHUD(): void {
    const timerEl = this.container.querySelector('#mines-timer-val');
    if (timerEl) timerEl.textContent = this.formatTime(this.elapsedSeconds);

    const minesEl = this.container.querySelector('#mines-count-val');
    if (minesEl) minesEl.textContent = String(this.engine.getMinesRemaining());

    const movesEl = this.container.querySelector('#mines-moves-val');
    if (movesEl) movesEl.textContent = String(this.engine.getMovesCount());

    const flagBtn = this.container.querySelector('#mines-flag-toggle-btn');
    if (flagBtn) {
      if (this.isFlagModeMobile) flagBtn.classList.add('active');
      else flagBtn.classList.remove('active');
    }
  }

  private bindEvents(): void {
    const grid = this.container.querySelector('#mines-grid');
    if (!grid) return;

    // Prevent context menu for right-click flagging
    grid.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const target = (e.target as HTMLElement).closest('.mine-cell');
      if (target) {
        const r = parseInt(target.getAttribute('data-row')!, 10);
        const c = parseInt(target.getAttribute('data-col')!, 10);
        this.handleRightClick(r, c);
      }
    });

    // Left click / tap
    grid.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('.mine-cell');
      if (target) {
        const r = parseInt(target.getAttribute('data-row')!, 10);
        const c = parseInt(target.getAttribute('data-col')!, 10);
        this.handleCellClick(r, c);
      }
    });

    // Mobile Flag toggle
    this.container.querySelector('#mines-flag-toggle-btn')?.addEventListener('click', () => {
      this.isFlagModeMobile = !this.isFlagModeMobile;
      AudioEngine.getInstance().playClick();
      this.updateHUD();
    });

    // Restart
    this.container.querySelector('#mines-restart-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      this.progression.replayCurrentLevel();
    });

    // Back to level selection
    this.container.querySelector('#mines-back-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      window.location.hash = '#levelselect?game=minesweeper';
    });

    // Pause
    this.container.querySelector('#mines-pause-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      window.dispatchEvent(new CustomEvent('request-pause-modal'));
    });
  }

  private handleCellClick(r: number, c: number): void {
    if (this.engine.isLost() || this.engine.isWon()) return;

    if (this.isFlagModeMobile) {
      this.handleRightClick(r, c);
      return;
    }

    const cell = this.engine.getCells()[r][c];
    if (cell.isRevealed) {
      // Trigger chord if satisfied
      const res = this.engine.chord(r, c);
      if (res.hitMine) {
        AudioEngine.getInstance().playMineExplode();
        this.updateBoardDOM();
        this.showGameOverModal();
      } else {
        AudioEngine.getInstance().playMineChord();
        Persistence.getInstance().recordMoveMade();
        this.updateBoardDOM();
        this.autosave();
        if (res.isComplete) {
          this.handleWin();
        }
      }
      return;
    }

    const res = this.engine.reveal(r, c);
    if (res.hitMine) {
      AudioEngine.getInstance().playMineExplode();
      this.updateBoardDOM();
      this.showGameOverModal();
    } else {
      AudioEngine.getInstance().playMineReveal();
      Persistence.getInstance().recordMoveMade();
      this.updateBoardDOM();
      this.autosave();
      if (res.isComplete) {
        this.handleWin();
      }
    }
  }

  private handleRightClick(r: number, c: number): void {
    if (this.engine.isLost() || this.engine.isWon()) return;
    if (this.engine.toggleFlag(r, c)) {
      AudioEngine.getInstance().playMineFlag();
      this.updateBoardDOM();
      this.autosave();
    }
  }

  private showGameOverModal(): void {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    Modal.open(
      I18n.t('gameOver'),
      `
      <div class="result-banner">
        <div class="result-icon">💥</div>
        <div class="result-title" style="color: #EF4444;">${I18n.t('gameOver')}</div>
        <div class="result-desc">${I18n.t('mineExploded')}</div>
      </div>
      `,
      `
      <button class="btn btn-secondary" id="defeat-menu-btn">${I18n.t('quitGame')}</button>
      <button class="btn btn-danger" id="defeat-retry-btn">${I18n.t('replay')}</button>
      `
    );

    document.getElementById('defeat-retry-btn')?.addEventListener('click', () => {
      Modal.close();
      this.progression.replayCurrentLevel();
    });

    document.getElementById('defeat-menu-btn')?.addEventListener('click', () => {
      Modal.close();
      window.location.hash = '#levelselect?game=minesweeper';
    });
  }

  private handleWin(): void {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    let stars = 3;
    if (this.elapsedSeconds > 120) stars = 2;
    if (this.elapsedSeconds > 300) stars = 1;

    AudioEngine.getInstance().playVictory();
    this.progression.triggerCompletion(
      this.engine.getMovesCount(),
      this.elapsedSeconds,
      stars
    );
  }

  private autosave(): void {
    Persistence.getInstance().saveActiveGame({
      gameId: 'minesweeper',
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
