import './styles/main.css';
import './styles/game.css';

import { I18n } from './core/i18n';
import { Persistence } from './core/persistence';
import { Router } from './ui/router';
import { RouteName, RouteParams } from './core/types';
import {
  renderHeader,
  bindHeaderEvents,
  renderBottomNav,
  bindBottomNavEvents,
  renderFooter,
} from './ui/components';

// Pages
import { renderHomePage, bindHomePageEvents } from './pages/Home';
import { renderDetailsPage, bindDetailsPageEvents } from './pages/Details';
import { renderLevelSelectPage, bindLevelSelectPageEvents } from './pages/LevelSelect';
import { GameplayPage } from './pages/Gameplay';
import { renderStatsPage } from './pages/Stats';
import { renderAchievementsPage } from './pages/Achievements';
import { renderSettingsPage, bindSettingsPageEvents } from './pages/Settings';
import { renderAboutPage, bindAboutPageEvents } from './pages/About';
import { renderFAQPage, bindFAQPageEvents } from './pages/FAQ';

class App {
  private root: HTMLElement;
  private contentEl!: HTMLElement;
  private activeGameplayPage: GameplayPage | null = null;

  constructor() {
    this.root = document.getElementById('app')!;
    this.init();
  }

  private init(): void {
    // 1. Initialize Persistence & I18n
    const persistence = Persistence.getInstance();
    const settings = persistence.getSettings();

    I18n.init();

    // 2. Set theme
    document.documentElement.setAttribute('data-theme', settings.theme);
    if (settings.reducedMotion) {
      document.body.classList.add('reduced-motion');
    }

    // 3. Register Service Worker for offline PWA support
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch((err) => {
          console.warn('[SW] Registration failed:', err);
        });
      });
    }

    // 4. Render Layout Shell
    this.renderLayout();

    window.addEventListener('app-shell-refresh', () => {
      this.refreshShell();
    });

    // 5. Initialize Router
    Router.init((route, params) => {
      this.handleRouteChange(route, params);
    });
  }

  private renderLayout(): void {
    this.root.innerHTML = `
      ${renderHeader()}
      <main class="app-content" id="app-content"></main>
      ${renderBottomNav('home')}
      ${renderFooter()}
    `;

    this.contentEl = this.root.querySelector('#app-content')!;

    bindHeaderEvents(this.root);
    bindBottomNavEvents(this.root);
  }

  private refreshShell(): void {
    const curRoute = Router.getRoute();
    const headerEl = this.root.querySelector('.app-header');
    const bottomNavEl = this.root.querySelector('.bottom-nav');
    const footerEl = this.root.querySelector('.app-footer');

    if (headerEl) headerEl.outerHTML = renderHeader();
    if (bottomNavEl) bottomNavEl.outerHTML = renderBottomNav(curRoute);
    if (footerEl) footerEl.outerHTML = renderFooter();

    bindHeaderEvents(this.root);
    bindBottomNavEvents(this.root);
  }

  private handleRouteChange(route: RouteName, params: RouteParams): void {
    // 1. Dispose previous game page if leaving or switching
    if (this.activeGameplayPage) {
      this.activeGameplayPage.dispose();
      this.activeGameplayPage = null;
    }

    // 2. Adjust content layout classes
    this.contentEl.className = 'app-content';
    if (route === 'home') {
      this.contentEl.classList.add('home-view');
    } else if (route === 'play') {
      this.contentEl.classList.add('in-gameplay');
    }

    // 3. Update bottom nav active state
    this.updateBottomNav(route);

    // 4. Render route content
    switch (route) {
      case 'home':
        this.contentEl.innerHTML = renderHomePage();
        bindHomePageEvents(this.contentEl);
        break;

      case 'details': {
        const gameId = params.gameId || 'sudoku';
        this.contentEl.innerHTML = renderDetailsPage(gameId);
        bindDetailsPageEvents(this.contentEl, gameId);
        break;
      }

      case 'levelselect': {
        const gameId = params.gameId || 'sudoku';
        this.contentEl.innerHTML = renderLevelSelectPage(gameId);
        bindLevelSelectPageEvents(this.contentEl, gameId);
        break;
      }

      case 'play': {
        const gameId = params.gameId || 'sudoku';
        const level = params.level || 1;
        this.activeGameplayPage = new GameplayPage(this.contentEl, gameId, level);
        break;
      }

      case 'stats':
        this.contentEl.innerHTML = renderStatsPage();
        break;

      case 'achievements':
        this.contentEl.innerHTML = renderAchievementsPage();
        break;

      case 'settings':
        this.contentEl.innerHTML = renderSettingsPage();
        bindSettingsPageEvents(this.contentEl);
        break;

      case 'about':
        this.contentEl.innerHTML = renderAboutPage();
        bindAboutPageEvents(this.contentEl);
        break;

      case 'faq':
        this.contentEl.innerHTML = renderFAQPage();
        bindFAQPageEvents(this.contentEl);
        break;

      default:
        this.contentEl.innerHTML = renderHomePage();
        bindHomePageEvents(this.contentEl);
        break;
    }
  }

  private updateBottomNav(route: RouteName): void {
    const bottomNav = this.root.querySelector('.bottom-nav');
    if (!bottomNav) return;

    bottomNav.querySelectorAll('.nav-item').forEach((el) => {
      const navTarget = el.getAttribute('data-nav');
      if (navTarget === route) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }
}

// Instantiate application on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new App();
    });
  } else {
    new App();
  }
}
