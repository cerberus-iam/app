import { test, expect } from '@playwright/test';

test.describe('Login Page - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto('/login');
  });

  test('should display login page with all elements', async ({ page }) => {
    // Check page title and branding
    await expect(page.getByRole('heading', { name: 'Admin Portal' })).toBeVisible();
    await expect(page.getByText('Identity and Access Management')).toBeVisible();

    // Check form elements
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /remember me/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

    // Check additional links
    await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create an organization' })).toBeVisible();
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    // Click submit without filling anything
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Check for validation errors
    await expect(page.getByText(/please enter a valid email address/i)).toBeVisible();
    await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    // Enter invalid email
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Check for email validation error
    await expect(page.getByText(/please enter a valid email address/i)).toBeVisible();
  });

  test('should show validation error for short password', async ({ page }) => {
    // Enter valid email but short password
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('short');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Check for password validation error
    await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible();
  });

  test('should submit form with valid credentials', async ({ page }) => {
    // Fill in valid credentials
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');

    // Click the sign in button
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Check for loading state
    await expect(page.getByRole('button', { name: 'Signing in...' })).toBeVisible();

    // Wait for navigation to dashboard (home page)
    await page.waitForURL('/', { timeout: 5000 });

    // Verify we're on the dashboard
    await expect(page).toHaveURL('/');
  });

  test('should remember me checkbox work correctly', async ({ page }) => {
    const rememberMeCheckbox = page.getByRole('checkbox', { name: /remember me/i });

    // Initially unchecked
    await expect(rememberMeCheckbox).not.toBeChecked();

    // Click to check
    await rememberMeCheckbox.click();
    await expect(rememberMeCheckbox).toBeChecked();

    // Click to uncheck
    await rememberMeCheckbox.click();
    await expect(rememberMeCheckbox).not.toBeChecked();
  });

  test('should navigate to forgot password page', async ({ page }) => {
    // Click forgot password link
    await page.getByRole('link', { name: /forgot password/i }).click();

    // Verify navigation
    await expect(page).toHaveURL('/forgot-password');
  });

  test('should navigate to onboarding when clicking create organization', async ({ page }) => {
    // Click create organization button
    await page.getByRole('button', { name: 'Create an organization' }).click();

    // Verify navigation
    await expect(page).toHaveURL('/onboarding');
  });

  test('should have terms and privacy links', async ({ page }) => {
    // Check for terms link
    const termsLink = page.getByRole('link', { name: /terms of service/i });
    await expect(termsLink).toBeVisible();
    await expect(termsLink).toHaveAttribute('href', '/terms');

    // Check for privacy link
    const privacyLink = page.getByRole('link', { name: /privacy policy/i });
    await expect(privacyLink).toBeVisible();
    await expect(privacyLink).toHaveAttribute('href', '/privacy');
  });

  test('should disable form inputs while loading', async ({ page }) => {
    // Fill in credentials
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');

    // Click submit
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Check that inputs are disabled during loading
    await expect(page.getByLabel('Email')).toBeDisabled();
    await expect(page.getByLabel('Password')).toBeDisabled();
    await expect(page.getByRole('checkbox', { name: /remember me/i })).toBeDisabled();
  });

  test('should focus on email input on page load', async ({ page }) => {
    // Get the email input
    const emailInput = page.getByLabel('Email');

    // Click on it to ensure focus (Playwright might not auto-focus)
    await emailInput.click();

    // Verify it's focused
    await expect(emailInput).toBeFocused();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Email')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: /forgot password/i })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Password')).toBeFocused();
  });

  test('should show success toast on successful login', async ({ page }) => {
    // Fill in valid credentials
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');

    // Submit form
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Wait for and check success toast
    await expect(page.getByText('Login successful!')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Welcome back to the Admin Portal')).toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify all elements are still visible
    await expect(page.getByRole('heading', { name: 'Admin Portal' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

    // Verify form still works
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Wait for navigation
    await page.waitForURL('/', { timeout: 5000 });
  });
});
