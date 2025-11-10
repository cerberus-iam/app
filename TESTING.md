# Testing Guide

This project uses Jest for unit and integration tests, and Playwright for end-to-end (e2e) tests.

## Test Structure

```
admin-web/
├── src/
│   ├── lib/
│   │   └── iam/
│   │       ├── utils.ts
│   │       └── utils.test.ts          # Unit tests
│   └── components/
│       └── ui/
│           ├── button.tsx
│           └── button.test.tsx        # Integration tests
├── e2e/
│   ├── example.spec.ts                # Example e2e tests
│   └── login.spec.ts                  # Login page e2e tests
├── jest.config.ts
├── jest.setup.ts
└── playwright.config.ts
```

## Running Tests

### Unit & Integration Tests (Jest)

```bash
# Run all Jest tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### End-to-End Tests (Playwright)

```bash
# Run all e2e tests (headless)
npm run test:e2e

# Run e2e tests with UI (interactive mode)
npm run test:e2e:ui

# Run e2e tests in headed mode (see the browser)
npm run test:e2e:headed

# Debug e2e tests
npm run test:e2e:debug

# View the last test report
npm run test:e2e:report
```

### Run All Tests

```bash
# Run both Jest and Playwright tests
npm run test:all
```

## Test Types

### 1. Unit Tests

Unit tests focus on testing individual functions and utilities in isolation. They are fast and don't require rendering components.

**Example:** [src/lib/iam/utils.test.ts](src/lib/iam/utils.test.ts)

```typescript
describe('buildPermissionKey', () => {
  it('should build a permission key from resource and action', () => {
    const key = buildPermissionKey('users', 'read');
    expect(key).toBe('users:read');
  });
});
```

**Best Practices:**

- Test pure functions
- Mock external dependencies
- Test edge cases and error conditions
- Keep tests fast and isolated

### 2. Integration Tests

Integration tests verify that React components work correctly when rendered with all their dependencies.

**Example:** [src/components/ui/button.test.tsx](src/components/ui/button.test.tsx)

```typescript
describe("Button Component", () => {
  it("should render button with default variant", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it("should handle click events", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Click Me</Button>);
    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**Best Practices:**

- Use React Testing Library
- Test user interactions
- Test accessibility
- Avoid testing implementation details

### 3. End-to-End Tests

E2E tests verify complete user flows in a real browser environment.

**Example:** [e2e/login.spec.ts](e2e/login.spec.ts)

```typescript
test('should submit form with valid credentials', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
  await expect(page).toHaveURL('/');
});
```

**Best Practices:**

- Test critical user journeys
- Use semantic selectors (roles, labels)
- Test across different viewports
- Keep tests independent

## Writing New Tests

### Adding a Unit Test

1. Create a test file next to your source file: `myFunction.test.ts`
2. Import the function to test
3. Write test cases using `describe` and `it`
4. Run `npm test` to verify

### Adding an Integration Test

1. Create a test file next to your component: `MyComponent.test.tsx`
2. Use `render()` from `@testing-library/react`
3. Query elements using accessible queries (getByRole, getByLabel, etc.)
4. Simulate user interactions with `userEvent`
5. Assert on the results

### Adding an E2E Test

1. Create a `.spec.ts` file in the `e2e/` directory
2. Import `test` and `expect` from `@playwright/test`
3. Use `page.goto()` to navigate
4. Use semantic selectors to interact with the page
5. Add assertions with `expect()`

## Test Configuration

### Jest Configuration

The Jest configuration is in [jest.config.ts](jest.config.ts). Key features:

- Uses `next/jest` for Next.js compatibility
- Configured for jsdom environment
- Path aliases (`@/`) are mapped correctly
- Coverage reporting enabled
- E2E tests are excluded from Jest runs

### Playwright Configuration

The Playwright configuration is in [playwright.config.ts](playwright.config.ts). Key features:

- Tests run against `localhost:3000`
- Configured for Chromium, Firefox, and WebKit
- Automatically starts dev server before tests
- HTML reporter for test results
- Retries on CI
- Screenshots and traces on failure

## Continuous Integration

When running tests in CI:

```bash
# Install browsers for Playwright
npx playwright install --with-deps

# Run all tests
npm run test:all
```

## Code Coverage

To generate a code coverage report:

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory. You can view the HTML report:

```bash
open coverage/lcov-report/index.html
```

## Debugging Tests

### Debugging Jest Tests

```bash
# Run tests in watch mode
npm run test:watch

# Focus on a specific test file
npm test -- utils.test.ts

# Run only one test (add .only)
it.only("should test something", () => {
  // test code
});
```

### Debugging Playwright Tests

```bash
# Run with Playwright Inspector
npm run test:e2e:debug

# Run specific test file
npm run test:e2e -- login.spec.ts

# Focus on one test (add .only)
test.only("should test something", async ({ page }) => {
  // test code
});
```

## Common Testing Patterns

### Mocking API Calls (Jest)

```typescript
jest.mock('@/lib/api', () => ({
  fetchUsers: jest.fn(() => Promise.resolve([{ id: 1, name: 'Test' }])),
}));
```

### Intercepting Network Requests (Playwright)

```typescript
await page.route('**/api/login', (route) => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ success: true }),
  });
});
```

### Testing Loading States

```typescript
// Jest
it("shows loading state", () => {
  render(<MyComponent isLoading={true} />);
  expect(screen.getByText("Loading...")).toBeInTheDocument();
});

// Playwright
test("shows loading state", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Loading...")).toBeVisible();
});
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
