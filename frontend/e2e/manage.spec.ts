import { test, expect } from '@playwright/test';

test.describe('Manage page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/b/mock/manage');
  });

  test('shows bracket name and entries', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Best Programming Languages' })).toBeVisible();
    await expect(page.locator('ul li')).toHaveCount(8);
  });

  test('add a text entry', async ({ page }) => {
    await page.getByPlaceholder('Entry label').fill('Haskell');
    await page.getByRole('button', { name: /add entry/i }).click();
    await expect(page.getByText('Haskell')).toBeVisible();
    await expect(page.locator('ul li')).toHaveCount(9);
  });

  test('remove an entry', async ({ page }) => {
    const firstEntry = page.locator('ul li').first();
    const label = await firstEntry.locator('span').first().textContent();
    await firstEntry.getByRole('button', { name: /remove/i }).click();
    await expect(page.locator('ul li')).toHaveCount(7);
    if (label) await expect(page.getByText(label, { exact: true })).not.toBeVisible();
  });

  test('edit bracket name', async ({ page }) => {
    await page.getByRole('button', { name: /edit/i }).click();
    const input = page.locator('input').first();
    await input.fill('Updated Name');
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByRole('heading', { name: 'Updated Name' })).toBeVisible();
  });

  test('has vote and results nav links', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Vote' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Results' })).toBeVisible();
  });
});
