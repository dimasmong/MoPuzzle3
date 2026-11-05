import { I18n } from '../core/i18n';
import { Persistence } from '../core/persistence';
import { AudioEngine } from '../core/audio';
import { Icons } from './icons';
import { Router } from './router';

export class Toast {
  private static container: HTMLElement | null = null;

  public static show(message: string, duration = 3000): void {
    if (typeof document === 'undefined') return;

    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✨</span><span>${message}</span>`;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

export class Modal {
  public static open(title: string, contentHtml: string, actionsHtml: string): HTMLElement {
    this.close();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'active-modal';

    overlay.innerHTML = `
      <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title-text">
        <div class="modal-header">
          <h3 class="modal-title" id="modal-title-text">${title}</h3>
          <button class="icon-btn" id="modal-close-btn" aria-label="${I18n.t('close')}">
            ${Icons.close}
          </button>
        </div>
        <div class="modal-body">
          ${contentHtml}
        </div>
        <div class="modal-footer" style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;">
          ${actionsHtml}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener('pointerdown', (e) => e.stopPropagation());
    overlay.addEventListener('pointerup', (e) => e.stopPropagation());
    overlay.addEventListener('mousedown', (e) => e.stopPropagation());
    overlay.addEventListener('mouseup', (e) => e.stopPropagation());

    overlay.querySelector('#modal-close-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      AudioEngine.getInstance().playClick();
      this.close();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        e.stopPropagation();
        AudioEngine.getInstance().playClick();
        this.close();
      }
    });

    return overlay;
  }

  public static close(): void {
    if (typeof document === 'undefined') return;
    const existing = document.getElementById('active-modal');
    if (existing) {
      existing.remove();
    }
  }
}

export function renderHeader(): string {
  const currentLang = I18n.getLanguage();
  const currentTheme = Persistence.getInstance().getSettings().theme;

  return `
    <header class="app-header">
      <div class="brand" id="brand-nav" title="MoPuzzle 3">
        <div class="brand-logo" aria-label="MoPuzzle 3 Logo">
          ${Icons.logo}
        </div>
        <div class="brand-text">
          <h1>${I18n.t('appName')}</h1>
          <p>${I18n.t('tagline')}</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="icon-btn" id="lang-toggle-btn" title="Language" aria-label="Switch Language">
          <span style="font-size: 13px; font-weight: 700;">${currentLang.toUpperCase()}</span>
        </button>
        <button class="icon-btn" id="theme-toggle-btn" title="Theme" aria-label="Toggle Theme">
          <span style="font-size: 16px;">${currentTheme === 'dark' ? '🌙' : '☀️'}</span>
        </button>
        <button class="icon-btn" id="settings-nav-btn" title="${I18n.t('settings')}" aria-label="${I18n.t('settings')}">
          ${Icons.settings}
        </button>
      </div>
    </header>
  `;
}

export function bindHeaderEvents(container: HTMLElement): void {
  container.querySelector('#brand-nav')?.addEventListener('click', () => {
    AudioEngine.getInstance().playClick();
    Router.navigate('home');
  });

  container.querySelector('#lang-toggle-btn')?.addEventListener('click', () => {
    AudioEngine.getInstance().playClick();
    const newLang = I18n.getLanguage() === 'en' ? 'id' : 'en';
    I18n.setLanguage(newLang);
    window.dispatchEvent(new CustomEvent('app-shell-refresh'));
    Router.refreshCurrentPage();
  });

  container.querySelector('#theme-toggle-btn')?.addEventListener('click', () => {
    AudioEngine.getInstance().playClick();
    const current = Persistence.getInstance().getSettings().theme;
    const newTheme = current === 'dark' ? 'light' : 'dark';
    Persistence.getInstance().updateSettings({ theme: newTheme });
    document.documentElement.setAttribute('data-theme', newTheme);
    window.dispatchEvent(new CustomEvent('app-shell-refresh'));
    Router.refreshCurrentPage();
  });

  container.querySelector('#settings-nav-btn')?.addEventListener('click', () => {
    AudioEngine.getInstance().playClick();
    Router.navigate('settings');
  });
}

export function renderBottomNav(activeRoute: string): string {
  const routes = [
    { id: 'home', icon: Icons.home, label: I18n.t('home') },
    { id: 'stats', icon: Icons.stats, label: I18n.t('stats') },
    { id: 'achievements', icon: Icons.trophy, label: I18n.t('achievements') },
    { id: 'settings', icon: Icons.settings, label: I18n.t('settings') },
  ];

  const items = routes
    .map(
      (r) => `
      <button class="nav-item ${activeRoute === r.id ? 'active' : ''}" data-nav="${r.id}" aria-label="${r.label}">
        ${r.icon}
        <span>${r.label}</span>
      </button>
    `
    )
    .join('');

  return `<nav class="bottom-nav">${items}</nav>`;
}

export function bindBottomNavEvents(container: HTMLElement): void {
  container.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', () => {
      AudioEngine.getInstance().playClick();
      const target = el.getAttribute('data-nav');
      if (target) {
        Router.navigate(target as any);
      }
    });
  });
}

export function renderFooter(): string {
  return `
    <footer class="app-footer">
      <p style="margin-bottom: 6px;">${I18n.t('footerText')}</p>
      <p style="margin-bottom: 8px;">${I18n.t('craftedBy')}</p>
      <p>
        <a href="https://github.com/dimasmong/MoPuzzle3" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 4px;">
          ${Icons.github}
          <span>github.com/dimasmong/MoPuzzle3</span>
        </a>
      </p>
    </footer>
  `;
}
