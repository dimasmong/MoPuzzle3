import { I18n } from '../core/i18n';
import { Persistence } from '../core/persistence';
import { AudioEngine } from '../core/audio';
import { Router } from '../ui/router';
import { Icons } from '../ui/icons';
import { GameId } from '../core/types';

export function renderLevelSelectPage(gameId: GameId): string {
  const persistence = Persistence.getInstance();
  const unlocked = persistence.getUnlockedLevel(gameId);

  let gridHtml = '';
  for (let lvl = 1; lvl <= 20; lvl++) {
    const isUnlocked = lvl <= unlocked;
    const progress = persistence.getLevelProgress(gameId, lvl);
    const isCompleted = !!progress;
    const stars = progress?.stars ?? 0;

    let starsHtml = '';
    if (isCompleted) {
      for (let s = 1; s <= 3; s++) {
        starsHtml += `<span style="font-size: 11px; color: ${s <= stars ? '#F59E0B' : 'rgba(0,0,0,0.15)'};">★</span>`;
      }
    }

    gridHtml += `
      <div 
        class="card level-tile ${isUnlocked ? 'unlocked' : 'locked'} ${isCompleted ? 'completed' : ''}" 
        data-level="${lvl}"
        style="
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          aspect-ratio: 1 / 1; 
          padding: 8px; 
          margin-bottom: 0;
          cursor: ${isUnlocked ? 'pointer' : 'not-allowed'};
          opacity: ${isUnlocked ? '1' : '0.55'};
          border: 2px solid ${isCompleted ? '#10B981' : isUnlocked ? 'var(--primary-color)' : 'var(--card-border)'};
          position: relative;
        "
      >
        <span style="font-size: 20px; font-weight: 800; color: var(--text-main);">
          ${isUnlocked ? lvl : '🔒'}
        </span>
        <div style="margin-top: 4px; display: flex; gap: 2px;">
          ${starsHtml}
        </div>
      </div>
    `;
  }

  return `
    <div class="page-levelselect">
      <div style="margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
        <button class="action-btn" id="levelselect-back-btn" title="Back">
          ${Icons.chevronLeft}
          <span>${I18n.t(`game.${gameId}.title`)}</span>
        </button>
        <span style="font-size: 15px; font-weight: 700; color: var(--text-muted);">
          ${unlocked} / 20 ${I18n.t('level')}
        </span>
      </div>

      <div class="card">
        <h2 style="font-size: 19px; font-weight: 800; margin-bottom: 4px;">${I18n.t('levelSelect')}</h2>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
          ${I18n.t(`game.${gameId}.title`)} — ${I18n.t('tagline')}
        </p>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
          ${gridHtml}
        </div>
      </div>
    </div>
  `;
}

export function bindLevelSelectPageEvents(container: HTMLElement, gameId: GameId): void {
  container.querySelector('#levelselect-back-btn')?.addEventListener('click', () => {
    AudioEngine.getInstance().playClick();
    Router.navigate('details', { gameId });
  });

  container.querySelectorAll('.level-tile.unlocked').forEach((tile) => {
    tile.addEventListener('click', () => {
      const lvl = parseInt(tile.getAttribute('data-level')!, 10);
      if (lvl) {
        AudioEngine.getInstance().playClick();
        Router.navigate('play', { gameId, level: lvl });
      }
    });
  });
}
