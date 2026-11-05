import { I18n } from '../core/i18n';
import { Persistence } from '../core/persistence';
import { ALL_GAMES } from '../core/types';

export function renderStatsPage(): string {
  const persistence = Persistence.getInstance();
  const stats = persistence.getStats();

  const totalPossible = 120;
  const overallPercentage = Math.round((stats.puzzlesCompleted / totalPossible) * 100);

  const hours = Math.floor(stats.totalTimePlayed / 3600);
  const mins = Math.floor((stats.totalTimePlayed % 3600) / 60);
  const timeFormatted = `${hours}h ${mins}m`;

  const gameRows = ALL_GAMES.map((g) => {
    const solved = stats.gamesCompleted[g] || 0;
    const unlocked = persistence.getUnlockedLevel(g);
    const pct = Math.round((solved / 20) * 100);

    return `
      <div style="margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 14px; font-weight: 700;">${I18n.t(`game.${g}.title`)}</span>
          <span style="font-size: 13px; font-weight: 600; color: var(--text-muted);">
            ${solved}/20 (${pct}%) • ${I18n.t('level')} ${unlocked}
          </span>
        </div>
        <div style="width: 100%; height: 8px; background: rgba(36, 58, 115, 0.08); border-radius: var(--radius-full); overflow: hidden;">
          <div style="width: ${pct}%; height: 100%; background: var(--primary-color); border-radius: var(--radius-full); transition: width 0.3s ease;"></div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="page-stats">
      <div style="margin-bottom: 16px;">
        <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 4px;">${I18n.t('stats')}</h2>
        <p style="font-size: 13px; color: var(--text-muted);">${I18n.t('tagline')}</p>
      </div>

      <div class="card" style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 14px; font-weight: 700;">${I18n.t('overallProgress')}</span>
          <span style="font-size: 16px; font-weight: 800; color: var(--primary-color);">${overallPercentage}%</span>
        </div>
        <div style="width: 100%; height: 12px; background: rgba(36, 58, 115, 0.08); border-radius: var(--radius-full); overflow: hidden; margin-bottom: 8px;">
          <div style="width: ${overallPercentage}%; height: 100%; background: linear-gradient(90deg, #3B82F6, #10B981); border-radius: var(--radius-full);"></div>
        </div>
        <div style="font-size: 12px; color: var(--text-muted); text-align: right;">
          ${stats.puzzlesCompleted} / ${totalPossible} ${I18n.t('puzzlesSolved')}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
        <div class="card" style="margin-bottom: 0; text-align: center; padding: 14px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">${I18n.t('statsTotalPuzzles')}</div>
          <div style="font-size: 22px; font-weight: 800; color: var(--primary-color); margin-top: 4px;">${stats.puzzlesCompleted}</div>
        </div>
        <div class="card" style="margin-bottom: 0; text-align: center; padding: 14px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">${I18n.t('statsTotalTime')}</div>
          <div style="font-size: 22px; font-weight: 800; color: #10B981; margin-top: 4px;">${timeFormatted}</div>
        </div>
        <div class="card" style="margin-bottom: 0; text-align: center; padding: 14px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">${I18n.t('statsTotalMoves')}</div>
          <div style="font-size: 22px; font-weight: 800; color: #F59E0B; margin-top: 4px;">${stats.movesMade}</div>
        </div>
        <div class="card" style="margin-bottom: 0; text-align: center; padding: 14px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">${I18n.t('statsTotalHints')}</div>
          <div style="font-size: 22px; font-weight: 800; color: #8B5CF6; margin-top: 4px;">${stats.hintsUsed}</div>
        </div>
      </div>

      <div class="card">
        <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 14px;">${I18n.t('statsGameProgress')}</h3>
        ${gameRows}
      </div>
    </div>
  `;
}
