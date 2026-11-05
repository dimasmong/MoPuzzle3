import { I18n } from '../core/i18n';
import { Persistence } from '../core/persistence';
import { AudioEngine } from '../core/audio';
import { Router } from '../ui/router';
import { Icons } from '../ui/icons';
import { ALL_GAMES, GameId } from '../core/types';

export function renderHomePage(): string {
  const persistence = Persistence.getInstance();
  const stats = persistence.getStats();

  // Check if any game has an unfinished active session
  let continueGame: GameId | null = null;
  let continueLevel: number = 1;

  for (const g of ALL_GAMES) {
    const act = persistence.getActiveGame(g);
    if (act) {
      continueGame = g;
      continueLevel = act.level;
      break;
    }
  }

  // If no active unfinished session, use last played
  if (!continueGame && persistence.getLastPlayedGame()) {
    continueGame = persistence.getLastPlayedGame();
    continueLevel = persistence.getLastPlayedLevel(continueGame!);
  }

  const continueBanner = continueGame
    ? `
    <div class="card" style="background: linear-gradient(135deg, rgba(36, 58, 115, 0.95), rgba(58, 134, 255, 0.9)); color: #FFFFFF; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <div>
        <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; opacity: 0.85;">
          ${I18n.t('continue')}
        </div>
        <div style="font-size: 18px; font-weight: 800; margin-top: 2px;">
          ${I18n.t(`game.${continueGame}.title`)} • ${I18n.t('level')} ${continueLevel}
        </div>
      </div>
      <button class="btn btn-accent" id="continue-game-btn" style="box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
        ${Icons.play}
        <span>${I18n.t('resume')}</span>
      </button>
    </div>
  `
    : '';

  // Game card config
  const gameCards = [
    {
      id: 'sudoku',
      icon: '🔢',
      bg: '#EBF8FF',
      fg: '#2B6CB0',
      titleKey: 'game.sudoku.title',
      subKey: 'game.sudoku.subtitle',
    },
    {
      id: 'minesweeper',
      icon: '💣',
      bg: '#FEEBC8',
      fg: '#DD6B20',
      titleKey: 'game.minesweeper.title',
      subKey: 'game.minesweeper.subtitle',
    },
    {
      id: 'pipe-connect',
      icon: '🚰',
      bg: '#E6FFFA',
      fg: '#319795',
      titleKey: 'game.pipe-connect.title',
      subKey: 'game.pipe-connect.subtitle',
    },
    {
      id: 'box-pusher',
      icon: '📦',
      bg: '#FEFCBF',
      fg: '#D69E2E',
      titleKey: 'game.box-pusher.title',
      subKey: 'game.box-pusher.subtitle',
    },
    {
      id: 'memory-flip',
      icon: '🃏',
      bg: '#FAF5FF',
      fg: '#805AD5',
      titleKey: 'game.memory-flip.title',
      subKey: 'game.memory-flip.subtitle',
    },
    {
      id: 'lights-out',
      icon: '💡',
      bg: '#FFF5F5',
      fg: '#E53E3E',
      titleKey: 'game.lights-out.title',
      subKey: 'game.lights-out.subtitle',
    },
  ];

  const cardsHtml = gameCards
    .map((g) => {
      const unlocked = persistence.getUnlockedLevel(g.id as GameId);
      const completed = stats.gamesCompleted[g.id as GameId] || 0;

      return `
      <div class="game-card" data-game="${g.id}">
        <div>
          <div class="game-card-icon" style="background: ${g.bg}; color: ${g.fg};">
            ${g.icon}
          </div>
          <div class="game-card-title">${I18n.t(g.titleKey)}</div>
          <div class="game-card-sub">${I18n.t(g.subKey)}</div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--card-border);">
          <span style="font-size: 12px; font-weight: 600; color: var(--text-muted);">
            ${I18n.t('level')} ${unlocked} • ${completed}/20
          </span>
          <button class="btn btn-primary" style="padding: 6px 14px; font-size: 13px;" data-play="${g.id}" aria-label="Play ${I18n.t(g.titleKey)}">
            ${Icons.play}
            <span>${I18n.t('play')}</span>
          </button>
        </div>
      </div>
    `;
    })
    .join('');

  return `
    <div class="page-home">
      ${continueBanner}

      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 8px;">
        <div>
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 4px;">${I18n.t('games')}</h2>
          <p style="font-size: 13px; color: var(--text-muted);">${I18n.t('tagline')}</p>
        </div>
        <div style="font-size: 13px; font-weight: 700; color: var(--primary-color);">
          ${stats.puzzlesCompleted} / 120 ${I18n.t('puzzlesSolved')}
        </div>
      </div>

      <div class="game-grid">
        ${cardsHtml}
      </div>

      <!-- Quick links banner -->
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 24px;">
        <button class="btn btn-secondary" id="faq-quick-btn" style="justify-content: flex-start; padding: 12px;">
          ${Icons.help}
          <span>${I18n.t('faq')}</span>
        </button>
        <button class="btn btn-secondary" id="about-quick-btn" style="justify-content: flex-start; padding: 12px;">
          ${Icons.info}
          <span>${I18n.t('about')}</span>
        </button>
      </div>
    </div>
  `;
}

export function bindHomePageEvents(container: HTMLElement): void {
  // Continue button
  container.querySelector('#continue-game-btn')?.addEventListener('click', () => {
    AudioEngine.getInstance().playClick();
    const persistence = Persistence.getInstance();
    let continueGame: GameId | null = null;
    let continueLevel: number = 1;

    for (const g of ALL_GAMES) {
      const act = persistence.getActiveGame(g);
      if (act) {
        continueGame = g;
        continueLevel = act.level;
        break;
      }
    }
    if (!continueGame && persistence.getLastPlayedGame()) {
      continueGame = persistence.getLastPlayedGame();
      continueLevel = persistence.getLastPlayedLevel(continueGame!);
    }

    if (continueGame) {
      Router.navigate('play', { gameId: continueGame, level: continueLevel });
    }
  });

  // Card click -> details or play
  container.querySelectorAll('[data-game]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const gameId = el.getAttribute('data-game') as GameId;
      if (!gameId) return;

      AudioEngine.getInstance().playClick();
      if (target.closest('[data-play]')) {
        const persistence = Persistence.getInstance();
        const unlocked = persistence.getUnlockedLevel(gameId);
        Router.navigate('play', { gameId, level: unlocked });
      } else {
        Router.navigate('details', { gameId });
      }
    });
  });

  // Quick buttons
  container.querySelector('#faq-quick-btn')?.addEventListener('click', () => {
    AudioEngine.getInstance().playClick();
    Router.navigate('faq');
  });

  container.querySelector('#about-quick-btn')?.addEventListener('click', () => {
    AudioEngine.getInstance().playClick();
    Router.navigate('about');
  });
}
