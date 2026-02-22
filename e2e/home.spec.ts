import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the "Before Docker" title', async ({ page }) => {
    await expect(page.locator('.title')).toHaveText('Before Docker');
  });

  test('shows BD and AD legend pills', async ({ page }) => {
    await expect(page.locator('.legend-pill.bd')).toBeVisible();
    await expect(page.locator('.legend-pill.ad')).toBeVisible();
  });

  test('shows at least one category tile', async ({ page }) => {
    const tiles = page.locator('.category-tile');
    await expect(tiles.first()).toBeVisible();
    expect(await tiles.count()).toBeGreaterThan(0);
  });

  test('clicking a category tile navigates to the game', async ({ page }) => {
    await page.locator('.category-tile').first().click();
    await expect(page).toHaveURL(/\/game\//);
  });
});
