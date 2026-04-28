import { test, expect } from '@playwright/test';

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('renders the form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('link navigates to register page', async ({ page }) => {
    await page.getByRole('link', { name: /create one/i }).click();
    await expect(page).toHaveURL(/\/register$/);
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.route('/api/auth/login', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: '1', email: 'test@example.com' }) })
    );
    await page.route('/api/auth/me', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: '1', email: 'test@example.com' }) })
    );

    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.route('/api/auth/login', route =>
      route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'Invalid credentials' }) })
    );

    await page.getByLabel('Email').fill('bad@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText('Invalid email or password.')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe('Register page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('renders the form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('link navigates to login page', async ({ page }) => {
    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('successful registration redirects to dashboard', async ({ page }) => {
    await page.route('/api/auth/register', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: '2', email: 'new@example.com' }) })
    );
    await page.route('/api/auth/me', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: '2', email: 'new@example.com' }) })
    );

    await page.getByLabel('Email').fill('new@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('shows error when email is already in use', async ({ page }) => {
    await page.route('/api/auth/register', route =>
      route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ error: 'Email already in use' }) })
    );

    await page.getByLabel('Email').fill('existing@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page.getByText('That email is already registered.')).toBeVisible();
    await expect(page).toHaveURL(/\/register$/);
  });

  test('shows generic error on unexpected failure', async ({ page }) => {
    await page.route('/api/auth/register', route =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Internal server error' }) })
    );

    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page.getByText('Something went wrong. Try again.')).toBeVisible();
  });
});
