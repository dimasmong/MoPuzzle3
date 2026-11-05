import { test } from '@playwright/test';

test.describe('MoPuzzle 3 — Documentation Screenshots', () => {
  test('Capture screenshots for all six games and key screens', async ({ page }) => {
    // 1. Home
    await page.goto('/');
    await page.screenshot({ path: 'docs/screenshots/home.png' });

    // 2. Sudoku
    await page.goto('/#play?game=sudoku&level=1');
    await page.waitForSelector('#sudoku-grid');
    await page.screenshot({ path: 'docs/screenshots/sudoku.png' });

    // 3. Minesweeper
    await page.goto('/#play?game=minesweeper&level=1');
    await page.waitForSelector('#mines-grid');
    await page.screenshot({ path: 'docs/screenshots/minesweeper.png' });

    // 4. Pipe Connect
    await page.goto('/#play?game=pipe-connect&level=1');
    await page.waitForSelector('#pipe-grid');
    await page.screenshot({ path: 'docs/screenshots/pipe-connect.png' });

    // 5. Box Pusher
    await page.goto('/#play?game=box-pusher&level=1');
    await page.waitForSelector('#box-grid');
    await page.screenshot({ path: 'docs/screenshots/box-pusher.png' });

    // 6. Memory Flip
    await page.goto('/#play?game=memory-flip&level=1');
    await page.waitForSelector('#mem-grid');
    await page.screenshot({ path: 'docs/screenshots/memory-flip.png' });

    // 7. Lights Out
    await page.goto('/#play?game=lights-out&level=1');
    await page.waitForSelector('#light-grid');
    await page.screenshot({ path: 'docs/screenshots/lights-out.png' });

    // 8. Stats
    await page.goto('/#stats');
    await page.waitForSelector('.page-stats');
    await page.screenshot({ path: 'docs/screenshots/stats.png' });

    // 9. Achievements
    await page.goto('/#achievements');
    await page.waitForSelector('.page-achievements');
    await page.screenshot({ path: 'docs/screenshots/achievements.png' });
  });
});
