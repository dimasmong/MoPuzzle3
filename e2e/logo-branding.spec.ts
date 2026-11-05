import { test, expect } from '@playwright/test';

test.describe('MoPuzzle 3 — Puzzle Six Logo Branding Verification', () => {
  test('Navbar and About page display the new Puzzle Six Emblem', async ({ page }) => {
    await page.goto('/');

    // 1. Navbar Logo
    const headerLogo = page.locator('.app-header .brand-logo svg');
    await expect(headerLogo).toBeVisible();

    // Verify it contains the 6 puzzle sectors and central core
    await expect(headerLogo.locator('#emblem-sectors path')).toHaveCount(6);
    await expect(headerLogo.locator('#p6Core')).toHaveCount(1);

    // Verify it does NOT contain the old generic M3 path or text
    const oldMText = await headerLogo.locator('text').count();
    expect(oldMText).toBe(0);

    // 2. About page logo
    await page.goto('/#about');
    const aboutLogo = page.locator('.page-about .brand-logo svg');
    await expect(aboutLogo).toBeVisible();
    await expect(aboutLogo.locator('#emblem-sectors path')).toHaveCount(6);

    // Verify version text
    await expect(page.locator('.page-about')).toContainText('v1.0.1');
  });

  test('Static Brand Assets (Favicon, Icons, Social Preview) are valid and accessible', async ({ page }) => {
    const assets = [
      '/favicon.svg',
      '/favicon.ico',
      '/apple-touch-icon.png',
      '/icons/logo.svg',
      '/icons/logo-dark.svg',
      '/icons/logo-light.svg',
      '/icons/icon-16.png',
      '/icons/icon-32.png',
      '/icons/icon-64.png',
      '/icons/icon-192.png',
      '/icons/icon-512.png',
      '/icons/icon-512-maskable.png',
      '/social-preview.png',
      '/manifest.webmanifest',
    ];

    for (const asset of assets) {
      const response = await page.goto(asset);
      expect(response?.status()).toBe(200);
    }
  });

  test('Web App Manifest contains correct PWA icon metadata', async ({ page }) => {
    const response = await page.goto('/manifest.webmanifest');
    expect(response?.status()).toBe(200);
    const manifest = await response?.json();

    expect(manifest.name).toBe('MoPuzzle 3');
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4);

    const has192 = manifest.icons.some((i: any) => i.sizes === '192x192' && i.src.includes('icon-192.png'));
    const has512 = manifest.icons.some((i: any) => i.sizes === '512x512' && i.src.includes('icon-512.png'));
    const hasMaskable = manifest.icons.some((i: any) => i.purpose === 'maskable');

    expect(has192).toBeTruthy();
    expect(has512).toBeTruthy();
    expect(hasMaskable).toBeTruthy();
  });
});
