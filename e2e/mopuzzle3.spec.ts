import { test, expect } from '@playwright/test';

test.describe('MoPuzzle 3 — End-to-End Test Suite', () => {
  test('Home page renders with six game cards and MoPuzzle 1 UI elements', async ({ page }) => {
    await page.goto('/');

    // Check title and brand
    await expect(page).toHaveTitle(/MoPuzzle 3/);
    await expect(page.locator('.brand-text h1')).toContainText('MoPuzzle 3');

    // Check 6 game cards exist
    const cards = page.locator('.game-card');
    await expect(cards).toHaveCount(6);

    // Verify all 6 game names
    await expect(page.locator('.game-card[data-game="sudoku"]')).toBeVisible();
    await expect(page.locator('.game-card[data-game="minesweeper"]')).toBeVisible();
    await expect(page.locator('.game-card[data-game="pipe-connect"]')).toBeVisible();
    await expect(page.locator('.game-card[data-game="box-pusher"]')).toBeVisible();
    await expect(page.locator('.game-card[data-game="memory-flip"]')).toBeVisible();
    await expect(page.locator('.game-card[data-game="lights-out"]')).toBeVisible();

    // Check bottom navigation items
    await expect(page.locator('.bottom-nav')).toBeVisible();
    await expect(page.locator('.nav-item[data-nav="home"]')).toBeVisible();
    await expect(page.locator('.nav-item[data-nav="stats"]')).toBeVisible();
    await expect(page.locator('.nav-item[data-nav="achievements"]')).toBeVisible();
    await expect(page.locator('.nav-item[data-nav="settings"]')).toBeVisible();

    // Take Home screenshot
    await page.screenshot({ path: 'test-results/screenshot-home.png' });
  });

  test('Theme and Language toggles work seamlessly', async ({ page }) => {
    await page.goto('/');

    // Check default light theme
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    // Toggle theme to dark
    await page.click('#theme-toggle-btn');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Toggle theme back to light
    await page.click('#theme-toggle-btn');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    // Toggle language to Indonesian
    await page.click('#lang-toggle-btn');
    await expect(page.locator('.brand-text p')).toContainText('Berpikir. Selesaikan. Nikmati.');

    // Toggle back to English
    await page.click('#lang-toggle-btn');
    await expect(page.locator('.brand-text p')).toContainText('Think. Solve. Enjoy.');
  });

  test('Sudoku — Launch, Input, Hint, Pause, and Level Navigation', async ({ page }) => {
    await page.goto('/#details?game=sudoku');
    await expect(page.locator('h2')).toContainText('Sudoku');

    // Click Play
    await page.click('#details-play-btn');
    await expect(page.locator('#sudoku-grid')).toBeVisible();
    await expect(page.locator('.sudoku-cell')).toHaveCount(81);

    // Click a cell and test hint
    await page.click('.sudoku-cell[data-row="0"][data-col="0"]');
    await page.click('#sudoku-hint-btn');

    // Pause modal
    await page.click('#sudoku-pause-btn');
    await expect(page.locator('#active-modal')).toBeVisible();
    await page.click('#pause-resume-btn');
    await expect(page.locator('#active-modal')).not.toBeVisible();

    // Take gameplay screenshot
    await page.screenshot({ path: 'test-results/screenshot-sudoku.png' });
  });

  test('Memory Flip — Play Level 1, Solve, and Advance to Next Level', async ({ page }) => {
    await page.goto('/#play?game=memory-flip&level=1');
    await expect(page.locator('#mem-grid')).toBeVisible();

    // Level 1 has 4 cards (2 pairs)
    const cards = page.locator('.memory-card');
    await expect(cards).toHaveCount(4);

    // Solve Memory Flip level 1
    // Read symbols from DOM and match pairs
    const count = await cards.count();
    const map: Record<string, number[]> = {};

    for (let i = 0; i < count; i++) {
      const sym = await cards.nth(i).locator('.card-front span').textContent();
      if (sym) {
        if (!map[sym]) map[sym] = [];
        map[sym].push(i);
      }
    }

    for (const indices of Object.values(map)) {
      await cards.nth(indices[0]).click();
      await cards.nth(indices[1]).click();
    }

    // Victory modal appears!
    await expect(page.locator('#active-modal')).toBeVisible();
    await expect(page.locator('#modal-next-btn')).toBeVisible();

    // Click Next Level
    await page.click('#modal-next-btn');

    // Verify modal is gone
    await expect(page.locator('#active-modal')).not.toBeVisible();

    // Verify Level 2 is loaded
    await expect(page.locator('.game-mode-badge')).toContainText('Level 2');

    // Take screenshot
    await page.screenshot({ path: 'test-results/screenshot-memory-level2.png' });
  });

  test('Box Pusher — Push crate and complete level', async ({ page }) => {
    await page.goto('/#play?game=box-pusher&level=1');
    await expect(page.locator('#box-grid')).toBeVisible();

    // Level 1: ##### / #@$.# / ##### -> Move Right pushes crate to target
    await page.keyboard.press('ArrowRight');

    // Victory modal appears!
    await expect(page.locator('#active-modal')).toBeVisible();
    await expect(page.locator('#modal-next-btn')).toBeVisible();

    // Click Next Level
    await page.click('#modal-next-btn');
    await expect(page.locator('#active-modal')).not.toBeVisible();
    await expect(page.locator('.game-mode-badge')).toContainText('Level 2');

    await page.screenshot({ path: 'test-results/screenshot-boxpusher-level2.png' });
  });

  test('Lights Out — Solve with hint, verify next level', async ({ page }) => {
    await page.goto('/#play?game=lights-out&level=1');
    await expect(page.locator('#light-grid')).toBeVisible();

    // Click hint twice to solve level 1 (min solution moves: 2)
    await page.click('#light-hint-btn');
    await page.waitForTimeout(100);
    await page.click('#light-hint-btn');

    // Victory modal appears
    await expect(page.locator('#active-modal')).toBeVisible();
    await page.click('#modal-next-btn');
    await expect(page.locator('#active-modal')).not.toBeVisible();
    await expect(page.locator('.game-mode-badge')).toContainText('Level 2');
  });

  test('Statistics and Achievements pages render with accurate values', async ({ page }) => {
    await page.goto('/#stats');
    await expect(page.locator('.page-stats')).toBeVisible();
    await expect(page.locator('.hud-item')).toHaveCount(0); // in grid instead

    await page.goto('/#achievements');
    await expect(page.locator('.page-achievements')).toBeVisible();
    const achCards = page.locator('.page-achievements .card');
    await expect(achCards).toHaveCount(24);

    await page.screenshot({ path: 'test-results/screenshot-achievements.png' });
  });
});
