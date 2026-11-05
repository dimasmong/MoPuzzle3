import { SudokuEngine } from './engine';
import { AudioEngine } from '../../core/audio';
import { ProgressionManager } from '../../core/progression';
import { Persistence } from '../../core/persistence';
import { Toast } from '../../ui/components';
import { I18n } from '../../core/i18n';
import { Icons } from '../../ui/icons';

export class SudokuView {
  private container: HTMLElement;
  private engine: SudokuEngine;
  private progression: ProgressionManager;
  private timerInterval: number | null = null;
  private elapsedSeconds: number = 0;
  private isPaused: boolean = false;
  private boundKeyDown: (e: KeyboardEvent) => void;

  constructor(
    container: HTMLElement,
    engine: SudokuEngine,
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

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
  }

  private formatTime(totalSec: number): string {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  private render(): void {
    const level = this.engine.getLevel();
    const diffKey = `game.sudoku.difficulty.${level.difficulty}`;

    this.container.innerHTML = `
      <div class="gameplay-wrapper">
        <div class="game-top-bar">
          <button class="action-btn" id="sudoku-back-btn" title="Back">
            ${Icons.chevronLeft}
            <span>${I18n.t('levelSelect')}</span>
          </button>
          <div class="game-title-group">
            <span class="game-title-text">${I18n.t('game.sudoku.title')}</span>
            <span class="game-mode-badge">${I18n.t('level')} ${level.level} • ${I18n.t(diffKey)}</span>
          </div>
          <button class="icon-btn" id="sudoku-pause-btn" title="${I18n.t('pause')}" aria-label="${I18n.t('pause')}">
            ${Icons.pause}
          </button>
        </div>

        <div class="game-hud">
          <div class="hud-item">
            <span class="hud-label">${I18n.t('time')}</span>
            <span class="hud-value" id="sudoku-timer-val">${this.formatTime(this.elapsedSeconds)}</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">${I18n.t('moves')}</span>
            <span class="hud-value" id="sudoku-moves-val">${this.engine.getMovesCount()}</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">Mistakes</span>
            <span class="hud-value" id="sudoku-mistakes-val" style="color: #EF4444;">${this.engine.getMistakesCount()}</span>
          </div>
        </div>

        <div class="game-arena-container">
          <div class="sudoku-board-container">
            <div class="sudoku-grid" id="sudoku-grid">
              ${this.renderCells()}
            </div>

            <!-- Number Keypad -->
            <div class="sudoku-keypad">
              ${[1, 2, 3, 4, 5, 6, 7, 8, 9]
                .map(
                  (n) => `
                <button class="keypad-btn" data-num="${n}" aria-label="Enter ${n}">
                  ${n}
                </button>
              `
                )
                .join('')}
            </div>
          </div>
        </div>

        <!-- Controls Toolbar -->
        <div class="game-controls-bar">
          <button class="action-btn" id="sudoku-undo-btn" title="${I18n.t('undo')}">
            ${Icons.undo}
            <span>${I18n.t('undo')}</span>
          </button>
          <button class="action-btn ${this.engine.getIsNotesMode() ? 'active' : ''}" id="sudoku-notes-btn" title="${I18n.t('notes')}">
            ${Icons.notes}
            <span>${I18n.t('notes')}</span>
          </button>
          <button class="action-btn" id="sudoku-erase-btn" title="${I18n.t('erase')}">
            <span>🧹</span>
            <span>${I18n.t('erase')}</span>
          </button>
          <button class="action-btn" id="sudoku-hint-btn" title="${I18n.t('hint')}">
            ${Icons.hint}
            <span>${I18n.t('hint')}</span>
          </button>
          <button class="action-btn" id="sudoku-restart-btn" title="${I18n.t('restart')}">
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
    const sel = this.engine.getSelectedPos();
    const selCell = cells[sel.row][sel.col];
    const selVal = selCell.value;

    let html = '';
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = cells[r][c];
        const isSelected = r === sel.row && c === sel.col;
        const isSameNumber = selVal !== 0 && cell.value === selVal;
        const isRowColBox =
          r === sel.row ||
          c === sel.col ||
          (Math.floor(r / 3) === Math.floor(sel.row / 3) &&
            Math.floor(c / 3) === Math.floor(sel.col / 3));

        const classes = ['sudoku-cell'];
        if (cell.isClue) {
          classes.push('clue');
        } else if (cell.value !== 0) {
          classes.push('player-entered');
        }
        if (isSelected) classes.push('selected');
        else if (isSameNumber) classes.push('same-number');
        else if (isRowColBox) classes.push('highlighted');
        if (cell.isError) classes.push('error');

        let innerContent = '';
        if (cell.value !== 0) {
          innerContent = `<span>${cell.value}</span>`;
        } else if (cell.notes.length > 0) {
          innerContent = `<div class="sudoku-notes-grid">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9]
              .map(
                (n) => `
              <div class="sudoku-note-cell">
                ${cell.notes.includes(n) ? n : ''}
              </div>
            `
              )
              .join('')}
          </div>`;
        }

        html += `
          <div class="${classes.join(' ')}" data-row="${r}" data-col="${c}">
            ${innerContent}
          </div>
        `;
      }
    }
    return html;
  }

  private updateBoardDOM(): void {
    const gridEl = this.container.querySelector('#sudoku-grid');
    if (gridEl) {
      gridEl.innerHTML = this.renderCells();
    }
    this.updateHUD();
  }

  private updateHUD(): void {
    const timerEl = this.container.querySelector('#sudoku-timer-val');
    if (timerEl) timerEl.textContent = this.formatTime(this.elapsedSeconds);

    const movesEl = this.container.querySelector('#sudoku-moves-val');
    if (movesEl) movesEl.textContent = String(this.engine.getMovesCount());

    const mistakesEl = this.container.querySelector('#sudoku-mistakes-val');
    if (mistakesEl) mistakesEl.textContent = String(this.engine.getMistakesCount());

    const notesBtn = this.container.querySelector('#sudoku-notes-btn');
    if (notesBtn) {
      if (this.engine.getIsNotesMode()) {
        notesBtn.classList.add('active');
      } else {
        notesBtn.classList.remove('active');
      }
    }
  }

  private bindEvents(): void {
    // Cell clicks
    this.container.querySelector('#sudoku-grid')?.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('.sudoku-cell');
      if (target) {
        const r = parseInt(target.getAttribute('data-row')!, 10);
        const c = parseInt(target.getAttribute('data-col')!, 10);
        this.engine.setSelectedPos(r, c);
        AudioEngine.getInstance().playClick();
        this.updateBoardDOM();
      }
    });

    // Keypad number clicks
    this.container.querySelectorAll('.keypad-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const num = parseInt(btn.getAttribute('data-num')!, 10);
        this.handleInputNumber(num);
      });
    });

    // Toolbar buttons
    this.container.querySelector('#sudoku-notes-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      this.engine.toggleNotesMode();
      this.updateHUD();
    });

    this.container.querySelector('#sudoku-erase-btn')?.addEventListener('click', () => {
      if (this.engine.erase()) {
        AudioEngine.getInstance().playSudokuErase();
        this.updateBoardDOM();
        this.autosave();
      }
    });

    this.container.querySelector('#sudoku-undo-btn')?.addEventListener('click', () => {
      if (this.engine.undo()) {
        AudioEngine.getInstance().playUndo();
        this.updateBoardDOM();
        this.autosave();
      }
    });

    this.container.querySelector('#sudoku-hint-btn')?.addEventListener('click', () => {
      const hint = this.engine.applyHint();
      if (hint) {
        AudioEngine.getInstance().playHint();
        Persistence.getInstance().recordHintUsed();
        Toast.show(hint.reason);
        this.updateBoardDOM();
        this.autosave();
        if (this.engine.isWon()) {
          this.handleWin();
        }
      }
    });

    this.container.querySelector('#sudoku-restart-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      this.progression.replayCurrentLevel();
    });

    this.container.querySelector('#sudoku-back-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      window.location.hash = '#levelselect?game=sudoku';
    });

    this.container.querySelector('#sudoku-pause-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      window.dispatchEvent(new CustomEvent('request-pause-modal'));
    });
  }

  private handleInputNumber(num: number): void {
    const res = this.engine.enterNumber(num);
    if (res.success) {
      if (this.engine.getIsNotesMode()) {
        AudioEngine.getInstance().playSudokuNote();
      } else if (res.isError) {
        AudioEngine.getInstance().playError();
      } else {
        AudioEngine.getInstance().playSudokuNumber();
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

    const sel = this.engine.getSelectedPos();
    if (e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      this.handleInputNumber(parseInt(e.key, 10));
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      if (this.engine.erase()) {
        AudioEngine.getInstance().playSudokuErase();
        this.updateBoardDOM();
        this.autosave();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.engine.setSelectedPos(Math.max(0, sel.row - 1), sel.col);
      this.updateBoardDOM();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.engine.setSelectedPos(Math.min(8, sel.row + 1), sel.col);
      this.updateBoardDOM();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.engine.setSelectedPos(sel.row, Math.max(0, sel.col - 1));
      this.updateBoardDOM();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.engine.setSelectedPos(sel.row, Math.min(8, sel.col + 1));
      this.updateBoardDOM();
    } else if (e.key.toLowerCase() === 'n') {
      e.preventDefault();
      this.engine.toggleNotesMode();
      this.updateHUD();
    } else if (e.key.toLowerCase() === 'z' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (this.engine.undo()) {
        AudioEngine.getInstance().playUndo();
        this.updateBoardDOM();
        this.autosave();
      }
    }
  }

  private autosave(): void {
    Persistence.getInstance().saveActiveGame({
      gameId: 'sudoku',
      level: this.engine.getLevel().level,
      moves: this.engine.getMovesCount(),
      timeSeconds: this.elapsedSeconds,
      state: this.engine.serialize(),
      updatedAt: Date.now(),
    });
  }

  private handleWin(): void {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    const mistakes = this.engine.getMistakesCount();
    const hints = this.engine.getHintsCount();
    let stars = 3;
    if (mistakes > 2 || hints > 2) stars = 2;
    if (mistakes > 5 || hints > 5) stars = 1;

    AudioEngine.getInstance().playVictory();
    this.progression.triggerCompletion(
      this.engine.getMovesCount(),
      this.elapsedSeconds,
      stars
    );
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
