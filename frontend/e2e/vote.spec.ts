import { test, expect } from '@playwright/test';


test.describe('Vote page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/b/mock');
  });

  test('shows bracket title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Best Programming Languages' })).toBeVisible();
  });

  test('shows two entry cards', async ({ page }) => {
    const cards = page.getByRole('button').filter({ hasNot: page.locator('a') });
    await expect(cards).toHaveCount(2);
  });

  test('voting shows winner badge and loads next matchup', async ({ page }) => {
    const buttons = page.getByRole('button');
    await expect(buttons).toHaveCount(2);

    await buttons.first().click();

    // Winner badge appears
    await expect(page.getByText('✓')).toBeVisible();

    // After animation (700ms + buffer), new matchup loads and badge is gone
    await expect(page.getByText('✓')).not.toBeVisible({ timeout: 2000 });
  });

  test('has link to results page', async ({ page }) => {
    await expect(page.getByRole('link', { name: /rankings/i })).toBeVisible();
  });
});
