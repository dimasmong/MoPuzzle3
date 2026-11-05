import { MemoryEngine } from './engine';
import { AudioEngine } from '../../core/audio';
import { ProgressionManager } from '../../core/progression';
import { Persistence } from '../../core/persistence';
import { I18n } from '../../core/i18n';
import { Icons } from '../../ui/icons';

export class MemoryView {
  private container: HTMLElement;
  private engine: MemoryEngine;
  private progression: ProgressionManager;
  private timerInterval: number | null = null;
  private elapsedSeconds: number = 0;
  private isPaused: boolean = false;

  constructor(
    container: HTMLElement,
    engine: MemoryEngine,
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
          <button class="action-btn" id="mem-back-btn" title="Back">
            ${Icons.chevronLeft}
            <span>${I18n.t('levelSelect')}</span>
          </button>
          <div class="game-title-group">
            <span class="game-title-text">${I18n.t('game.memory-flip.title')}</span>
            <span class="game-mode-badge">${I18n.t('level')} ${level.level} • ${level.pairs} ${I18n.t('score')}</span>
          </div>
          <button class="icon-btn" id="mem-pause-btn" title="${I18n.t('pause')}" aria-label="${I18n.t('pause')}">
            ${Icons.pause}
          </button>
        </div>

        <div class="game-hud">
          <div class="hud-item">
            <span class="hud-label">${I18n.t('time')}</span>
            <span class="hud-value" id="mem-timer-val">${this.formatTime(this.elapsedSeconds)}</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">${I18n.t('moves')}</span>
            <span class="hud-value" id="mem-moves-val">${this.engine.getMovesCount()}</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">${I18n.t('score')}</span>
            <span class="hud-value" id="mem-score-val" style="color: #10B981;">${this.engine.getScore()}</span>
          </div>
          <div class="hud-item" id="mem-combo-box" style="display: ${this.engine.getComboCount() > 1 ? 'flex' : 'none'};">
            <span class="hud-label">${I18n.t('combo')}</span>
            <span class="hud-value" id="mem-combo-val" style="color: #F59E0B;">x${this.engine.getComboCount()}</span>
          </div>
        </div>

        <div class="game-arena-container">
          <div class="memory-board-container">
            <div class="memory-grid" id="mem-grid" style="grid-template-columns: repeat(${level.cols}, clamp(46px, 16vw, 76px));">
              ${this.renderCards()}
            </div>
          </div>
        </div>

        <!-- Controls Toolbar -->
        <div class="game-controls-bar">
          <button class="action-btn" id="mem-restart-btn" title="${I18n.t('restart')}">
            ${Icons.restart}
            <span>${I18n.t('restart')}</span>
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private renderCards(): string {
    const cards = this.engine.getCards();
    return cards
      .map((c) => {
        const classes = ['memory-card'];
        if (c.isFlipped) classes.push('flipped');
        if (c.isMatched) classes.push('matched');

        return `
          <div class="${classes.join(' ')}" data-id="${c.id}" aria-label="Card ${c.id}">
            <div class="card-face card-back">
              <span>🎴</span>
            </div>
            <div class="card-face card-front">
              <span>${c.symbol}</span>
            </div>
          </div>
        `;
      })
      .join('');
  }

  private updateBoardDOM(): void {
    const gridEl = this.container.querySelector('#mem-grid');
    if (gridEl) {
      gridEl.innerHTML = this.renderCards();
    }
    this.updateHUD();
  }

  private updateHUD(): void {
    const timerEl = this.container.querySelector('#mem-timer-val');
    if (timerEl) timerEl.textContent = this.formatTime(this.elapsedSeconds);

    const movesEl = this.container.querySelector('#mem-moves-val');
    if (movesEl) movesEl.textContent = String(this.engine.getMovesCount());

    const scoreEl = this.container.querySelector('#mem-score-val');
    if (scoreEl) scoreEl.textContent = String(this.engine.getScore());

    const comboBox = this.container.querySelector('#mem-combo-box') as HTMLElement;
    const comboVal = this.container.querySelector('#mem-combo-val');
    if (comboBox && comboVal) {
      const combo = this.engine.getComboCount();
      if (combo > 1) {
        comboBox.style.display = 'flex';
        comboVal.textContent = `x${combo}`;
      } else {
        comboBox.style.display = 'none';
      }
    }
  }

  private bindEvents(): void {
    const grid = this.container.querySelector('#mem-grid');
    if (!grid) return;

    grid.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('.memory-card');
      if (target) {
        const id = parseInt(target.getAttribute('data-id')!, 10);
        this.handleCardClick(id);
      }
    });

    this.container.querySelector('#mem-restart-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      this.progression.replayCurrentLevel();
    });

    this.container.querySelector('#mem-back-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      window.location.hash = '#levelselect?game=memory-flip';
    });

    this.container.querySelector('#mem-pause-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      window.dispatchEvent(new CustomEvent('request-pause-modal'));
    });
  }

  private handleCardClick(id: number): void {
    if (this.engine.isAnimationLocked() || this.engine.isWon()) return;

    const res = this.engine.flipCard(id, () => {
      // Mismatch flip-back animation finished
      AudioEngine.getInstance().playCardMismatch();
      this.updateBoardDOM();
      this.autosave();
    });

    if (res.flipped) {
      AudioEngine.getInstance().playCardFlip();
      this.updateBoardDOM();
      this.autosave();

      if (res.isMatch) {
        AudioEngine.getInstance().playCardMatch();
        Persistence.getInstance().recordMoveMade();
        this.updateBoardDOM();
        this.autosave();

        if (res.isComplete) {
          this.handleWin();
        }
      }
    }
  }

  private handleWin(): void {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    const stars = this.engine.getStarRating();
    AudioEngine.getInstance().playVictory();
    this.progression.triggerCompletion(
      this.engine.getMovesCount(),
      this.elapsedSeconds,
      stars
    );
  }

  private autosave(): void {
    Persistence.getInstance().saveActiveGame({
      gameId: 'memory-flip',
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
