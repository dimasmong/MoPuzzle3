import { test, expect } from '@playwright/test';

test.describe('MoPuzzle 3 — Sudoku Visibility & Theme Contrast Verification', () => {
  test('Light Mode — Clues, Player Digits, Highlights, and Errors have High Contrast', async ({ page }) => {
    await page.goto('/#play?game=sudoku&level=1');
    await expect(page.locator('#sudoku-grid')).toBeVisible();

    // Ensure Light Mode
    const themeAttr = await page.locator('html').getAttribute('data-theme');
    if (themeAttr === 'dark') {
      await page.click('#theme-toggle-btn');
    }
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    // 1. Verify 81 cells
    const cells = page.locator('.sudoku-cell');
    await expect(cells).toHaveCount(81);

    // 2. Verify all clue cells have opaque background #E8F0FB and text #243A73
    const clueCells = page.locator('.sudoku-cell.clue');
    const clueCount = await clueCells.count();
    expect(clueCount).toBeGreaterThan(15);

    for (let i = 0; i < clueCount; i++) {
      const clue = clueCells.nth(i);
      const text = (await clue.textContent())?.trim();
      expect(text).toMatch(/^[1-9]$/);
      expect(await clue.isVisible()).toBeTruthy();
    }

    // Inspect computed style of a non-selected clue cell
    // Row 0 Col 2 has clue '2' in Level 1
    const clueCell = page.locator('.sudoku-cell[data-row="0"][data-col="2"]');
    const clueBg = await clueCell.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const clueColor = await clueCell.evaluate((el) => window.getComputedStyle(el).color);
    expect(clueBg).toBe('rgb(232, 240, 251)'); // #E8F0FB
    expect(clueColor).toBe('rgb(36, 58, 115)'); // #243A73

    // 3. Inspect normal empty cell (Row 0 Col 0 is initially selected or highlighted)
    // Row 8 Col 8 is an empty cell not in row 0 or col 0 or box 0
    // In Level 1, Row 7 Col 0 has no clue and is not highlighted if we select Row 8 Col 8
    await page.click('.sudoku-cell[data-row="8"][data-col="8"]');
    const emptyCell = page.locator('.sudoku-cell[data-row="0"][data-col="5"]');
    const emptyBg = await emptyCell.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(emptyBg).toBe('rgb(255, 255, 255)'); // #FFFFFF

    // 4. Test Selected Cell Background
    const selectedCell = page.locator('.sudoku-cell.selected');
    const selectedBg = await selectedCell.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(selectedBg).toBe('rgb(203, 239, 250)'); // #CBEFFA

    // 5. Test Player-Entered Correct Number
    // Level 1: solution at Row 0 Col 0 is 1. (Clues in row 0: col 2 is 2, col 4 is 8, col 8 is 9)
    await page.click('.sudoku-cell[data-row="0"][data-col="0"]');
    await page.keyboard.press('1');
    const playerCell = page.locator('.sudoku-cell[data-row="0"][data-col="0"]');
    await expect(playerCell).toHaveClass(/player-entered/);
    await expect(playerCell).toContainText('1');

    // Deselect cell by selecting another to verify unselected player cell color
    await page.click('.sudoku-cell[data-row="8"][data-col="8"]');
    const playerColor = await playerCell.evaluate((el) => window.getComputedStyle(el).color);
    expect(playerColor).toBe('rgb(37, 99, 235)'); // #2563EB

    // 6. Test Error Cell (Incorrect Number)
    // Enter '9' at Row 0 Col 1 (Row 0 already contains 9 at col 8, so it's a conflict and wrong solution)
    await page.click('.sudoku-cell[data-row="0"][data-col="1"]');
    await page.keyboard.press('9');
    const errorCell = page.locator('.sudoku-cell[data-row="0"][data-col="1"]');
    await expect(errorCell).toHaveClass(/error/);

    const errorBg = await errorCell.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const errorColor = await errorCell.evaluate((el) => window.getComputedStyle(el).color);
    expect(errorBg).toBe('rgb(254, 226, 226)'); // #FEE2E2
    expect(errorColor).toBe('rgb(185, 28, 28)'); // #B91C1C

    // 7. Test Undo
    await page.click('#sudoku-undo-btn');
    await expect(errorCell).not.toHaveClass(/error/);
    await expect(errorCell).not.toContainText('9');

    // 8. Test Pencil Notes
    await page.click('#sudoku-notes-btn');
    await page.keyboard.press('3');
    await page.keyboard.press('5');
    await expect(errorCell.locator('.sudoku-note-cell')).toHaveCount(9);
    await expect(errorCell).toContainText('3');
    await expect(errorCell).toContainText('5');
    // Turn off notes
    await page.click('#sudoku-notes-btn');

    // 9. Test Hint
    await page.click('#sudoku-hint-btn');
    const toast = page.locator('.toast');
    await expect(toast).toBeVisible();

    // Capture Light Mode Screenshot
    await page.screenshot({ path: 'docs/screenshots/sudoku.png' });
  });

  test('Dark Mode — High Contrast and Proper Cell Backgrounds', async ({ page }) => {
    await page.goto('/#play?game=sudoku&level=1');
    await expect(page.locator('#sudoku-grid')).toBeVisible();

    // Switch to Dark Mode
    const themeAttr = await page.locator('html').getAttribute('data-theme');
    if (themeAttr !== 'dark') {
      await page.click('#theme-toggle-btn');
    }
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // 1. Clue cell computed styling
    const clueCell = page.locator('.sudoku-cell[data-row="0"][data-col="2"]');
    const clueBg = await clueCell.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const clueColor = await clueCell.evaluate((el) => window.getComputedStyle(el).color);
    expect(clueBg).toBe('rgb(42, 59, 85)'); // #2A3B55
    expect(clueColor).toBe('rgb(248, 250, 252)'); // #F8FAFC

    // 2. Normal cell computed styling
    await page.click('.sudoku-cell[data-row="8"][data-col="8"]');
    const normalCell = page.locator('.sudoku-cell[data-row="0"][data-col="5"]');
    const normalBg = await normalCell.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(normalBg).toBe('rgb(30, 42, 61)'); // #1E2A3D

    // 3. Selected cell styling
    const selectedCell = page.locator('.sudoku-cell.selected');
    const selectedBg = await selectedCell.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(selectedBg).toBe('rgb(50, 83, 106)'); // #32536A

    // 4. Enter player number
    await page.click('.sudoku-cell[data-row="0"][data-col="0"]');
    await page.keyboard.press('1');
    const playerCell = page.locator('.sudoku-cell[data-row="0"][data-col="0"]');
    await page.click('.sudoku-cell[data-row="8"][data-col="8"]');
    const playerColor = await playerCell.evaluate((el) => window.getComputedStyle(el).color);
    expect(playerColor).toBe('rgb(161, 227, 249)'); // #A1E3F9

    // 5. Enter error
    await page.click('.sudoku-cell[data-row="0"][data-col="1"]');
    await page.keyboard.press('9');
    const errorCell = page.locator('.sudoku-cell[data-row="0"][data-col="1"]');
    const errorBg = await errorCell.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const errorColor = await errorCell.evaluate((el) => window.getComputedStyle(el).color);
    expect(errorBg).toBe('rgb(87, 44, 57)'); // #572C39
    expect(errorColor).toBe('rgb(255, 155, 155)'); // #FF9B9B

    // Capture Dark Mode Screenshot
    await page.screenshot({ path: 'docs/screenshots/sudoku-dark.png' });

    // Switch back to Light Mode
    await page.click('#theme-toggle-btn');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    // Reload page to test persistence
    await page.reload();
    await expect(page.locator('#sudoku-grid')).toBeVisible();
    await expect(page.locator('.sudoku-cell[data-row="0"][data-col="0"]')).toContainText('1');
  });

  test('Verify Sudoku Across All Difficulties (Easy, Medium, Hard, Expert)', async ({ page }) => {
    const testLevels = [
      { num: 1, diff: 'easy' },
      { num: 6, diff: 'medium' },
      { num: 11, diff: 'hard' },
      { num: 16, diff: 'expert' },
    ];

    for (const lvl of testLevels) {
      await page.goto(`/#play?game=sudoku&level=${lvl.num}`);
      await expect(page.locator('#sudoku-grid')).toBeVisible();
      await expect(page.locator('.sudoku-cell')).toHaveCount(81);

      // Verify clue count
      const clues = page.locator('.sudoku-cell.clue');
      const count = await clues.count();
      expect(count).toBeGreaterThan(15);

      // Verify clue background is opaque in light mode
      const firstClue = clues.first();
      const bg = await firstClue.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(bg).toBe('rgb(232, 240, 251)'); // #E8F0FB
    }
  });

  test('Regression Check — Other 5 Games Render Correctly', async ({ page }) => {
    // 1. Minesweeper
    await page.goto('/#play?game=minesweeper&level=1');
    await expect(page.locator('#mines-grid')).toBeVisible();

    // 2. Pipe Connect
    await page.goto('/#play?game=pipe-connect&level=1');
    await expect(page.locator('#pipe-grid')).toBeVisible();

    // 3. Box Pusher
    await page.goto('/#play?game=box-pusher&level=1');
    await expect(page.locator('#box-grid')).toBeVisible();

    // 4. Memory Flip
    await page.goto('/#play?game=memory-flip&level=1');
    await expect(page.locator('#mem-grid')).toBeVisible();

    // 5. Lights Out
    await page.goto('/#play?game=lights-out&level=1');
    await expect(page.locator('#light-grid')).toBeVisible();
  });
});
