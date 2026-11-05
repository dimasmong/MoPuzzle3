import { I18n } from '../core/i18n';
import { Persistence } from '../core/persistence';
import { AudioEngine } from '../core/audio';
import { Modal, Toast } from '../ui/components';
import { Router } from '../ui/router';

export function renderSettingsPage(): string {
  const settings = Persistence.getInstance().getSettings();

  return `
    <div class="page-settings">
      <div style="margin-bottom: 16px;">
        <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 4px;">${I18n.t('settings')}</h2>
        <p style="font-size: 13px; color: var(--text-muted);">${I18n.t('tagline')}</p>
      </div>

      <div class="card" style="margin-bottom: 16px;">
        <!-- Language -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--card-border);">
          <div>
            <div style="font-size: 15px; font-weight: 700;">${I18n.t('language')}</div>
            <div style="font-size: 12px; color: var(--text-muted);">English / Bahasa Indonesia</div>
          </div>
          <select id="setting-lang-select" class="action-btn" style="padding: 6px 12px; font-weight: 700;">
            <option value="en" ${settings.language === 'en' ? 'selected' : ''}>English</option>
            <option value="id" ${settings.language === 'id' ? 'selected' : ''}>Indonesia</option>
          </select>
        </div>

        <!-- Theme -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--card-border);">
          <div>
            <div style="font-size: 15px; font-weight: 700;">${I18n.t('theme')}</div>
            <div style="font-size: 12px; color: var(--text-muted);">${settings.theme === 'dark' ? I18n.t('darkTheme') : I18n.t('lightTheme')}</div>
          </div>
          <button class="action-btn" id="setting-theme-btn" style="min-width: 80px;">
            ${settings.theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>

        <!-- Sound Effects -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--card-border);">
          <div>
            <div style="font-size: 15px; font-weight: 700;">${I18n.t('soundEffects')}</div>
            <div style="font-size: 12px; color: var(--text-muted);">Interaction tones & fanfares</div>
          </div>
          <button class="action-btn ${settings.soundEnabled ? 'active' : ''}" id="setting-sfx-btn" style="min-width: 80px;">
            ${settings.soundEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <!-- Music -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--card-border);">
          <div>
            <div style="font-size: 15px; font-weight: 700;">${I18n.t('backgroundMusic')}</div>
            <div style="font-size: 12px; color: var(--text-muted);">Calm procedural ambient chords</div>
          </div>
          <button class="action-btn ${settings.musicEnabled ? 'active' : ''}" id="setting-bgm-btn" style="min-width: 80px;">
            ${settings.musicEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <!-- Reduced Motion -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
          <div>
            <div style="font-size: 15px; font-weight: 700;">${I18n.t('reducedMotion')}</div>
            <div style="font-size: 12px; color: var(--text-muted);">Disable animated transitions</div>
          </div>
          <button class="action-btn ${settings.reducedMotion ? 'active' : ''}" id="setting-motion-btn" style="min-width: 80px;">
            ${settings.reducedMotion ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="card" style="border-color: rgba(239, 68, 68, 0.3);">
        <h3 style="font-size: 16px; font-weight: 800; color: #EF4444; margin-bottom: 4px;">
          ${I18n.t('resetProgressTitle')}
        </h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
          ${I18n.t('resetProgressDesc')}
        </p>
        <button class="btn btn-danger" id="setting-reset-btn" style="width: 100%;">
          ${I18n.t('resetProgressTitle')}
        </button>
      </div>
    </div>
  `;
}

export function bindSettingsPageEvents(container: HTMLElement): void {
  // Language Select
  container.querySelector('#setting-lang-select')?.addEventListener('change', (e) => {
    const val = (e.target as HTMLSelectElement).value as any;
    AudioEngine.getInstance().playClick();
    I18n.setLanguage(val);
    Router.refreshCurrentPage();
  });

  // Theme Toggle
  container.querySelector('#setting-theme-btn')?.addEventListener('click', () => {
    AudioEngine.getInstance().playClick();
    const cur = Persistence.getInstance().getSettings().theme;
    const newTheme = cur === 'dark' ? 'light' : 'dark';
    Persistence.getInstance().updateSettings({ theme: newTheme });
    document.documentElement.setAttribute('data-theme', newTheme);
    Router.refreshCurrentPage();
  });

  // Sound SFX
  container.querySelector('#setting-sfx-btn')?.addEventListener('click', () => {
    const now = !AudioEngine.getInstance().isSFXEnabled();
    AudioEngine.getInstance().setSoundEnabled(now);
    AudioEngine.getInstance().playClick();
    Router.refreshCurrentPage();
  });

  // Music BGM
  container.querySelector('#setting-bgm-btn')?.addEventListener('click', () => {
    const now = !AudioEngine.getInstance().isBGMEnabled();
    AudioEngine.getInstance().setMusicEnabled(now);
    AudioEngine.getInstance().playClick();
    Router.refreshCurrentPage();
  });

  // Reduced Motion
  container.querySelector('#setting-motion-btn')?.addEventListener('click', () => {
    AudioEngine.getInstance().playClick();
    const cur = Persistence.getInstance().getSettings().reducedMotion;
    const next = !cur;
    Persistence.getInstance().updateSettings({ reducedMotion: next });
    if (next) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
    Router.refreshCurrentPage();
  });

  // Reset Progress
  container.querySelector('#setting-reset-btn')?.addEventListener('click', () => {
    AudioEngine.getInstance().playClick();
    Modal.open(
      I18n.t('resetProgressTitle'),
      `
      <div style="padding: 10px 0;">
        <p style="font-size: 14px; line-height: 1.5; color: var(--text-main); margin-bottom: 12px;">
          ${I18n.t('resetProgressWarning')}
        </p>
      </div>
      `,
      `
      <button class="btn btn-secondary" id="confirm-cancel-btn">${I18n.t('cancel')}</button>
      <button class="btn btn-danger" id="confirm-reset-btn">${I18n.t('confirm')}</button>
      `
    );

    document.getElementById('confirm-cancel-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      Modal.close();
    });

    document.getElementById('confirm-reset-btn')?.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      Persistence.getInstance().resetAllProgress();
      Modal.close();
      Toast.show('All progress has been reset.');
      Router.navigate('home');
    });
  });
}
