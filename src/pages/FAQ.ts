import { I18n } from '../core/i18n';
import { AudioEngine } from '../core/audio';
import { Router } from '../ui/router';
import { Icons } from '../ui/icons';

export function renderFAQPage(): string {
  const faqs = [
    { qKey: 'faqQ1', aKey: 'faqA1' },
    { qKey: 'faqQ2', aKey: 'faqA2' },
    { qKey: 'faqQ3', aKey: 'faqA3' },
    { qKey: 'faqQ4', aKey: 'faqA4' },
  ];

  const itemsHtml = faqs
    .map(
      (item) => `
    <div class="card" style="margin-bottom: 12px;">
      <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 6px; color: var(--primary-color);">
        ${I18n.t(item.qKey)}
      </h3>
      <p style="font-size: 14px; line-height: 1.6; color: var(--text-main);">
        ${I18n.t(item.aKey)}
      </p>
    </div>
  `
    )
    .join('');

  return `
    <div class="page-faq">
      <div style="margin-bottom: 16px;">
        <button class="action-btn" id="faq-back-btn" title="Back">
          ${Icons.chevronLeft}
          <span>${I18n.t('home')}</span>
        </button>
      </div>

      <div style="margin-bottom: 16px;">
        <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 4px;">${I18n.t('faqTitle')}</h2>
        <p style="font-size: 13px; color: var(--text-muted);">${I18n.t('tagline')}</p>
      </div>

      <div>
        ${itemsHtml}
      </div>
    </div>
  `;
}

export function bindFAQPageEvents(container: HTMLElement): void {
  container.querySelector('#faq-back-btn')?.addEventListener('click', () => {
    AudioEngine.getInstance().playClick();
    Router.navigate('home');
  });
}
