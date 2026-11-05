import { I18n } from '../core/i18n';
import { AchievementManager } from '../core/achievements';

export function renderAchievementsPage(): string {
  const achs = AchievementManager.getInstance().getAll();
  const unlockedCount = achs.filter((a) => a.unlocked).length;

  const cardsHtml = achs
    .map((a) => {
      const pct = Math.min(100, Math.round((a.progress / a.maxProgress) * 100));

      return `
      <div class="card" style="margin-bottom: 12px; display: flex; gap: 14px; align-items: center; opacity: ${a.unlocked ? '1' : '0.65'};">
        <div style="font-size: 32px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: rgba(36, 58, 115, 0.06); border-radius: var(--radius-md); flex-shrink: 0;">
          ${a.unlocked ? a.icon : '🔒'}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
            <span style="font-size: 15px; font-weight: 700; color: var(--text-main);">${I18n.t(a.nameKey)}</span>
            <span style="font-size: 12px; font-weight: 700; color: ${a.unlocked ? '#10B981' : 'var(--text-muted)'};">
              ${a.unlocked ? '✓ Unlocked' : `${a.progress}/${a.maxProgress}`}
            </span>
          </div>
          <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 6px; line-height: 1.3;">
            ${I18n.t(a.descKey)}
          </p>
          <div style="width: 100%; height: 6px; background: rgba(36, 58, 115, 0.08); border-radius: var(--radius-full); overflow: hidden;">
            <div style="width: ${pct}%; height: 100%; background: ${a.unlocked ? '#10B981' : 'var(--primary-color)'}; border-radius: var(--radius-full);"></div>
          </div>
        </div>
      </div>
    `;
    })
    .join('');

  return `
    <div class="page-achievements">
      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 4px;">${I18n.t('achievements')}</h2>
          <p style="font-size: 13px; color: var(--text-muted);">${I18n.t('tagline')}</p>
        </div>
        <span style="font-size: 14px; font-weight: 800; color: var(--primary-color);">
          ${unlockedCount} / ${achs.length}
        </span>
      </div>

      <div>
        ${cardsHtml}
      </div>
    </div>
  `;
}
