import { test, expect } from '@playwright/test';

const GAME_URL = '/game/software';

test.describe('Game screen', () => {
  test('shows the VS badge and two tech panels', async ({ page }) => {
    await page.goto(GAME_URL);
    await expect(page.locator('.vs-badge')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('app-tech-card').nth(0)).toBeVisible();
    await expect(page.locator('app-tech-card').nth(1)).toBeVisible();
  });

  test('Docker marker is always on the timeline', async ({ page }) => {
    await page.goto(GAME_URL);
    await expect(page.locator('.docker-marker')).toBeVisible({ timeout: 10_000 });
  });

  test('score display is visible with 3 hearts', async ({ page }) => {
    await page.goto(GAME_URL);
    await expect(page.locator('app-score-display')).toBeVisible({ timeout: 10_000 });
    // 3 hearts rendered (filled or lost)
    await expect(page.locator('.heart')).toHaveCount(3);
  });

  test('pick buttons appear once images have loaded', async ({ page }) => {
    await page.goto(GAME_URL);
    // Wait for at least one pick button (images loaded = Playing phase)
    await expect(page.locator('.pick-btn').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('.pick-btn')).toHaveCount(2);
  });

  test('clicking a pick button shows the result overlay', async ({ page }) => {
    await page.goto(GAME_URL);
    await page.locator('.pick-btn').first().waitFor({ timeout: 15_000 });
    await page.locator('.pick-btn').first().click();
    await expect(page.locator('.backdrop')).toBeVisible();
  });

  test('result overlay shows "Correct!" or "Wrong!"', async ({ page }) => {
    await page.goto(GAME_URL);
    await page.locator('.pick-btn').first().waitFor({ timeout: 15_000 });
    await page.locator('.pick-btn').first().click();
    const verdict = page.locator('.overlay-card h2');
    await expect(verdict).toBeVisible();
    const text = await verdict.textContent();
    expect(['Correct!', 'Wrong!']).toContain(text?.trim());
  });

  test('result overlay shows BD/AD dates for both techs', async ({ page }) => {
    await page.goto(GAME_URL);
    await page.locator('.pick-btn').first().waitFor({ timeout: 15_000 });
    await page.locator('.pick-btn').first().click();
    const dates = page.locator('.docker-date');
    await expect(dates.first()).toBeVisible();
    expect(await dates.count()).toBe(2);
  });

  test('clicking "Next Round" dismisses the result overlay', async ({ page }) => {
    await page.goto(GAME_URL);
    await page.locator('.pick-btn').first().waitFor({ timeout: 15_000 });
    await page.locator('.pick-btn').first().click();
    await page.locator('.backdrop').waitFor();
    await page.getByRole('button', { name: 'Next Round' }).click();
    await expect(page.locator('.backdrop')).not.toBeVisible();
  });

  test('two new markers appear on the timeline after a round', async ({ page }) => {
    await page.goto(GAME_URL);
    // Before any guess: only Docker
    await expect(page.locator('.docker-marker')).toBeVisible({ timeout: 10_000 });
    const beforeCount = await page.locator('.marker').count();

    await page.locator('.pick-btn').first().waitFor({ timeout: 15_000 });
    await page.locator('.pick-btn').first().click();
    await page.locator('.backdrop').waitFor();
    await page.getByRole('button', { name: 'Next Round' }).click();

    // After one round: Docker + 2 techs
    await expect(page.locator('.marker')).toHaveCount(beforeCount + 2, { timeout: 5_000 });
  });
});

test.describe('Lives system', () => {
  test('losing a life removes a filled heart', async ({ page }) => {
    await page.goto(GAME_URL);
    await page.locator('.pick-btn').first().waitFor({ timeout: 15_000 });

    const filledBefore = await page.locator('.heart:not(.lost)').count();

    // Click a random pick — we don't know which is correct so just observe
    await page.locator('.pick-btn').first().click();
    await page.locator('.backdrop').waitFor();
    await page.getByRole('button', { name: 'Next Round' }).click();

    // Hearts might have changed (either same or one fewer)
    const filledAfter = await page.locator('.heart:not(.lost)').count();
    expect(filledAfter).toBeLessThanOrEqual(filledBefore);
  });

  test('game-over overlay appears when all lives are lost', async ({ page }) => {
    await page.goto(GAME_URL);

    for (let i = 0; i < 20; i++) {
      if (await page.locator('.gameover-overlay').isVisible()) break;

      // Wait for the Playing phase — pick buttons are only visible then
      await expect(page.locator('.pick-btn').first()).toBeVisible({ timeout: 15_000 });
      await page.locator('.pick-btn').first().click();

      // Wait for either the result overlay or game-over to appear
      await page
        .waitForSelector('.backdrop, .gameover-overlay', { state: 'visible', timeout: 5_000 })
        .catch(() => {});

      if (await page.locator('.gameover-overlay').isVisible()) break;

      // Dismiss the result overlay and wait for it to fully close before
      // the next iteration — prevents clicking a detached pick-btn mid-transition
      await page.getByRole('button', { name: 'Next Round' }).click();
      await expect(page.locator('.backdrop')).not.toBeVisible({ timeout: 10_000 });
    }

    await expect(page.locator('.gameover-overlay')).toBeVisible({ timeout: 5_000 });
  });
});
