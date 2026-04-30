import { test, expect } from '@playwright/test';

test('root shows landing page', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: /rank anything/i })).toBeVisible();
});

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('shows the seeded mock bracket', async ({ page }) => {
    await expect(page.getByText('Best Programming Languages')).toBeVisible();
  });

  test('new bracket button navigates to /brackets/new', async ({ page }) => {
    await page.getByRole('button', { name: /new bracket/i }).click();
    await expect(page).toHaveURL(/\/brackets\/new$/);
  });

  test('delete removes bracket from list', async ({ page }) => {
    // Create a bracket then navigate back via the link (keeps mock store alive)
    await page.getByRole('button', { name: /new bracket/i }).click();
    await page.getByLabel('Bracket name').fill('Temp Bracket');
    await page.getByRole('button', { name: /create bracket/i }).click();
    await expect(page).toHaveURL(/\/manage$/);

    await page.getByRole('link', { name: /my brackets/i }).click();
    await expect(page.getByText('Temp Bracket')).toBeVisible();

    const row = page.locator('li').filter({ hasText: 'Temp Bracket' });
    await row.getByRole('button', { name: /delete/i }).click();

    // Confirm in the modal
    const modal = page.locator('[class*="dialog"]');
    await expect(modal).toBeVisible();
    await modal.getByRole('button', { name: /^delete$/i }).click();

    await expect(page.locator('li').filter({ hasText: 'Temp Bracket' })).not.toBeVisible();
  });
});
