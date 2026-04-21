import { test, expect } from '@playwright/test';

test('root redirects to dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'My Brackets' })).toBeVisible();
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

    page.once('dialog', d => d.accept());
    const row = page.locator('li').filter({ hasText: 'Temp Bracket' });
    await row.getByRole('button', { name: /delete/i }).click();
    await expect(page.getByText('Temp Bracket')).not.toBeVisible();
  });
});
