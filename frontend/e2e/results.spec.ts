import { test, expect } from '@playwright/test';

test.describe('Results page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/b/mock/results');
  });

  test('shows bracket title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Best Programming Languages' })).toBeVisible();
  });

  test('lists all 8 entries', async ({ page }) => {
    await expect(page.locator('ol > li')).toHaveCount(8);
  });

  test('each entry shows stats', async ({ page }) => {
    const firstRow = page.locator('ol > li').first();
    await expect(firstRow).toContainText('#1');
    await expect(firstRow).toContainText('pts');
    await expect(firstRow).toContainText('votes');
  });

  test('vote link navigates back to vote page', async ({ page }) => {
    await page.getByRole('link', { name: /vote/i }).click();
    await expect(page).toHaveURL(/\/b\/mock$/);
  });
});
