import { I18n } from '../core/i18n';
import { Persistence } from '../core/persistence';
import { AudioEngine } from '../core/audio';
import { Router } from '../ui/router';
import { Icons } from '../ui/icons';
import { GameId } from '../core/types';

export function renderDetailsPage(gameId: GameId): string {
  const persistence = Persistence.getInstance();
  const unlocked = persistence.getUnlockedLevel(gameId);
  const stats = persistence.getStats();
  const completed = stats.gamesCompleted[gameId] || 0;

  const icons: Record<GameId, string> = {
    sudoku: '🔢',
    minesweeper: '💣',
    'pipe-connect': '🚰',
    'box-pusher': '📦',
    'memory-flip': '🃏',
    'lights-out': '💡',
  };

  return `
    <div class="page-details">
      <div style="margin-bottom: 16px;">
        <button class="action-btn" id="details-back-btn" title="Back">
          ${Icons.chevronLeft}
          <span>${I18n.t('home')}</span>
        </button>
      </div>

      <div class="card" style="text-align: center; padding: 28px 20px;">
        <div style="font-size: 56px; margin-bottom: 12px;">${icons[gameId]}</div>
        <h2 style="font-size: 24px; font-weight: 800; margin-bottom: 6px;">${I18n.t(`game.${gameId}.title`)}</h2>
        <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 20px;">${I18n.t(`game.${gameId}.subtitle`)}</p>

        <div style="display: flex; justify-content: center; gap: 16px; margin-bottom: 24px;">
          <div class="hud-item" style="padding: 10px 18px;">
            <span class="hud-label">${I18n.t('level')}</span>
            <span class="hud-value" style="color: var(--primary-color);">${unlocked} / 20</span>
          </div>
          <div class="hud-item" style="padding: 10px 18px;">
            <span class="hud-label">${I18n.t('puzzlesSolved')}</span>
            <span class="hud-value" style="color: #10B981;">${completed}</span>
          </div>
        </div>

        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-primary" id="details-play-btn" style="padding: 12px 28px; font-size: 15px;">
            ${Icons.play}
            <span>${I18n.t('play')} (Level ${unlocked})</span>
          </button>
          <button class="btn btn-secondary" id="details-levels-btn" style="padding: 12px 20px;">
            <span>${I18n.t('levelSelect')}</span>
          </button>
        </div>
      </div>

      <div class="card">
        <h3 style="font-size: 17px; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
          ${Icons.info}
          <span>${I18n.t('rules')}</span>
        </h3>
        <p style="font-size: 14px; line-height: 1.6; color: var(--text-main);">
          ${I18n.t(`game.${gameId}.desc`)}
        </p>
      </div>
    </div>
  `;
}

export function bindDetailsPageEvents(container: HTMLElement, gameId: GameId): void {
  container.querySelector('#details-back-btn')?.addEventListener('click', () => {
    AudioEngine.getInstance().playClick();
    Router.navigate('home');
  });

  container.querySelector('#details-play-btn')?.addEventListener('click', () => {
    AudioEngine.getInstance().playClick();
    const persistence = Persistence.getInstance();
    const unlocked = persistence.getUnlockedLevel(gameId);
    Router.navigate('play', { gameId, level: unlocked });
  });

  container.querySelector('#details-levels-btn')?.addEventListener('click', () => {
    AudioEngine.getInstance().playClick();
    Router.navigate('levelselect', { gameId });
  });
}
