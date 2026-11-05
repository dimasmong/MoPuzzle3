import { I18n } from '../core/i18n';
import { AudioEngine } from '../core/audio';
import { Router } from '../ui/router';
import { Icons } from '../ui/icons';

export function renderAboutPage(): string {
  return `
    <div class="page-about">
      <div style="margin-bottom: 16px;">
        <button class="action-btn" id="about-back-btn" title="Back">
          ${Icons.chevronLeft}
          <span>${I18n.t('home')}</span>
        </button>
      </div>

      <div class="card" style="text-align: center; padding: 28px 20px;">
        <div class="brand-logo" style="width: 64px; height: 64px; margin: 0 auto 16px auto; border-radius: 16px;">
          ${Icons.logo}
        </div>
        <h2 style="font-size: 24px; font-weight: 800; margin-bottom: 4px;">${I18n.t('appName')}</h2>
        <p style="font-size: 13px; color: var(--primary-color); font-weight: 700; margin-bottom: 16px;">v1.0.1 • ${I18n.t('tagline')}</p>
        <p style="font-size: 14px; line-height: 1.6; color: var(--text-main); margin-bottom: 16px; text-align: left;">
          ${I18n.t('aboutP1')}
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: var(--text-muted); text-align: left;">
          ${I18n.t('aboutP2')}
        </p>
      </div>

      <div class="card">
        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 10px;">Six Playable Games</h3>
        <ul style="padding-left: 20px; font-size: 14px; line-height: 1.8; color: var(--text-main);">
          <li><strong>Sudoku:</strong> 9×9 classic number deduction with pencil notes & hint engine.</li>
          <li><strong>Minesweeper:</strong> First-click safe minefield sweeper with chord reveals.</li>
          <li><strong>Pipe Connect:</strong> Rotating water pipe network simulator.</li>
          <li><strong>Box Pusher:</strong> Sokoban warehouse crate puzzles with deadlock awareness.</li>
          <li><strong>Memory Flip:</strong> Card-matching memory test with combo multipliers.</li>
          <li><strong>Lights Out:</strong> GF(2) linear algebra tile toggle logic game.</li>
        </ul>
      </div>

      <div class="card" style="text-align: center;">
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 10px;">${I18n.t('footerText')}</p>
        <p style="font-size: 13px; font-weight: 600; color: var(--text-main); margin-bottom: 14px;">${I18n.t('craftedBy')}</p>
        <a href="https://github.com/dimasmong/MoPuzzle3" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="display: inline-flex;">
          ${Icons.github}
          <span>GitHub Repository</span>
        </a>
      </div>
    </div>
  `;
}

export function bindAboutPageEvents(container: HTMLElement): void {
  container.querySelector('#about-back-btn')?.addEventListener('click', () => {
    AudioEngine.getInstance().playClick();
    Router.navigate('home');
  });
}
