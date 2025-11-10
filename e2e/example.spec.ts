import { test, expect } from '@playwright/test';

/**
 * Example E2E Test Suite
 * This demonstrates basic Playwright patterns and best practices
 */

test.describe('Example E2E Tests', () => {
  test('should load the homepage', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');

    // Check that the page loaded by verifying the title or a heading
    await expect(page).toHaveTitle(/Admin Portal|Cerberus IAM/i);
  });

  test('should navigate between pages', async ({ page }) => {
    // Start at homepage
    await page.goto('/');

    // Navigate to login
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Admin Portal' })).toBeVisible();

    // Navigate to onboarding
    await page.goto('/onboarding');
    // Wait for page to load (adjust selector based on actual page)
    await expect(page).toHaveURL('/onboarding');
  });

  test('should verify page responsiveness', async ({ page }) => {
    await page.goto('/login');

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByRole('heading', { name: 'Admin Portal' })).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { name: 'Admin Portal' })).toBeVisible();

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { name: 'Admin Portal' })).toBeVisible();
  });

  test('should handle form input and validation', async ({ page }) => {
    await page.goto('/login');

    // Test form validation by submitting empty form
    const submitButton = page.getByRole('button', { name: 'Sign in' });
    await submitButton.click();

    // Verify validation messages appear
    await expect(page.getByText(/email/i)).toBeVisible();
  });

  test('should take a screenshot', async ({ page }) => {
    await page.goto('/login');

    // Take a full page screenshot
    await page.screenshot({ path: 'screenshots/login-page.png', fullPage: true });

    // Take a screenshot of a specific element
    const loginCard = page.locator('form').first();
    await loginCard.screenshot({ path: 'screenshots/login-form.png' });
  });

  test('should test keyboard navigation', async ({ page }) => {
    await page.goto('/login');

    // Use keyboard to navigate
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verify focus management
    const emailInput = page.getByLabel('Email');
    await emailInput.click();
    await expect(emailInput).toBeFocused();
  });

  test('should test API requests', async ({ page }) => {
    // Listen for API requests
    page.on('request', (request) => {
      console.log('>>', request.method(), request.url());
    });

    page.on('response', (response) => {
      console.log('<<', response.status(), response.url());
    });

    await page.goto('/login');

    // You can also intercept and mock API responses
    await page.route('**/api/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });
  });

  test('should verify meta tags and SEO', async ({ page }) => {
    await page.goto('/login');

    // Check for meta tags
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();

    // Check for viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toBeTruthy();
  });

  test('should test localStorage and sessionStorage', async ({ page }) => {
    await page.goto('/login');

    // Set localStorage
    await page.evaluate(() => {
      localStorage.setItem('test', 'value');
    });

    // Verify localStorage
    const value = await page.evaluate(() => localStorage.getItem('test'));
    expect(value).toBe('value');

    // Clear storage
    await page.evaluate(() => localStorage.clear());
  });

  test('should handle multiple tabs', async ({ context }) => {
    // Create first tab
    const page1 = await context.newPage();
    await page1.goto('/login');

    // Create second tab
    const page2 = await context.newPage();
    await page2.goto('/onboarding');

    // Verify both tabs
    await expect(page1.getByRole('heading', { name: 'Admin Portal' })).toBeVisible();
    await expect(page2).toHaveURL('/onboarding');

    // Close tabs
    await page1.close();
    await page2.close();
  });

  test('should wait for elements to be visible', async ({ page }) => {
    await page.goto('/login');

    // Wait for specific element
    await page.waitForSelector('button[type="submit"]', { state: 'visible' });

    // Wait with custom timeout
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible({
      timeout: 10000,
    });
  });

  test('should verify external links', async ({ page }) => {
    await page.goto('/login');

    // Check for external links (if any)
    const links = await page.locator('a').all();

    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href) {
        console.log('Found link:', href);
      }
    }
  });
});

/**
 * Example test for authenticated routes
 * You would typically set up authentication state before these tests
 */
test.describe('Authenticated User Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Example: Set authentication cookie or token
    // await page.context().addCookies([{
    //   name: 'auth-token',
    //   value: 'your-token-here',
    //   domain: 'localhost',
    //   path: '/'
    // }]);

    // Or use localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token');
    });
  });

  test.skip('should access protected dashboard', async ({ page }) => {
    // This is skipped because we don't have real authentication yet
    await page.goto('/');
    // Add assertions for authenticated state
  });
});
