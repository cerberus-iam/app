# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cerberus IAM Admin Web Portal - A Next.js 16 (Pages Router) application for Identity and Access Management operations. Built with TypeScript, Tailwind CSS 4, Shadcn/ui components, and React 19.

## Key Technologies

- **Framework**: Next.js 16 with Pages Router (not App Router)
- **React 19.2** with React Compiler enabled (`reactCompiler: true` in next.config.ts)
- **TypeScript 5** with strict mode
- **Styling**: Tailwind CSS 4 with Shadcn/ui (New York style)
- **Forms**: React Hook Form + Zod validation
- **Testing**: Jest + React Testing Library (unit/integration), Playwright (e2e)

## Essential Commands

### Development

```bash
npm run dev              # Start dev server on localhost:3000
npm run build            # Production build (checks types and builds)
npm run lint             # Run ESLint with --max-warnings=0
npm run format:fix       # Auto-fix formatting issues
```

### Testing

```bash
# Unit & Integration Tests (Jest)
npm test                 # Run all Jest tests
npm run test:watch       # Watch mode for TDD
jest path/to/file.test.ts  # Run specific test file
jest -t "test name"      # Run specific test by name

# E2E Tests (Playwright)
npm run test:e2e         # Run all e2e tests (headless)
npm run test:e2e:ui      # Interactive UI mode (recommended for development)
npx playwright test login.spec.ts  # Run specific e2e test file
npx playwright install   # Install browsers (first-time setup)

# Coverage
npm run test:coverage    # Generate coverage report
```

### Pre-commit Hooks

Husky runs `lint-staged` on commit which:

1. Runs `eslint --fix` on .ts/.tsx/.js/.jsx files
2. Runs `prettier --write` on all staged files
3. Blocks commit if ESLint fails

## Architecture Patterns

### Page Layout Pattern

This project uses a custom layout pattern where pages can define their own layout via `getLayout`:

```typescript
// Import the shared type
import type { NextPageWithLayout } from "@/types/page";

// Define page component with the type
const MyPage: NextPageWithLayout = () => {
  return <div>Page content</div>;
};

// Attach the layout
MyPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <AppLayout
      title="Page Title"
      description="Page description"
      breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Current" }]}
    >
      {page}
    </AppLayout>
  );
};

export default MyPage;
```

**Important**: All pages using `getLayout` must:

1. Import `NextPageWithLayout` from `@/types/page` (not define inline)
2. Use `NextPageWithLayout` as the type, not `NextPage`
3. Return `ReactElement` from `getLayout`, not `ReactNode`

The `_app.tsx` handles layout extraction and wraps everything in `ThemeProvider`.

### IAM Permission System

The codebase has a sophisticated IAM type system in `src/types/iam.ts`:

- **Permission Keys**: Template literal type `${IAMPermissionResource}:${IAMPermissionAction}`
  - Resources: users, roles, policies, tenants, api-tokens, audit
  - Actions: read, create, update, delete, assign, review
  - Example: `"users:create"`, `"audit:review"`

- **Utilities** in `src/lib/iam/utils.ts`:
  - `buildPermissionKey(resource, action)` - Type-safe permission key builder
  - `resolveUserPermissions(user, roles)` - Aggregate permissions from user's roles
  - `hasPermission(permissions, required)` - Check if permission set includes required permission(s)
  - All utilities are fully tested in `utils.test.ts`

### Component Organization

- **Layout Components**: `src/components/layout/` - AppLayout, AppHeader, AppSidebar
  - `AppLayout` wraps pages with sidebar navigation
  - Uses Shadcn/ui `SidebarProvider` and `SidebarInset`

- **UI Components**: `src/components/ui/` - Shadcn/ui components
  - Never modify these directly; regenerate with `npx shadcn@latest add <component>`
  - Styled with Tailwind and class-variance-authority

- **Feature Components**: Organized by feature (e.g., `src/components/onboarding/`)

### Path Aliases

All imports use `@/` alias which maps to `src/`:

```typescript
import { Button } from '@/components/ui/button';
import type { IAMUser } from '@/types/iam';
import { buildPermissionKey } from '@/lib/iam';
```

## Testing Guidelines

### Test File Locations

- **Unit tests**: Colocated with source files (e.g., `utils.test.ts` next to `utils.ts`)
- **Component tests**: Next to components (e.g., `Button.test.tsx` next to `Button.tsx`)
- **E2E tests**: In `e2e/` directory (e.g., `e2e/login.spec.ts`)

### Jest Configuration Notes

- Tests run in jsdom environment
- E2E directory (`e2e/`) is excluded from Jest via `testPathIgnorePatterns`
- Path aliases work automatically via `next/jest` integration
- Setup file: `jest.setup.ts` imports `@testing-library/jest-dom`

### Playwright Configuration Notes

- Tests automatically start dev server (`npm run dev`) if not running
- Default baseURL: `http://localhost:3000`
- Runs on Chrome, Firefox, and WebKit by default
- Use relative URLs in tests: `await page.goto('/login')`

### React Hook Form with React Compiler

React Hook Form's `watch()` API triggers a React Compiler warning. Suppress with:

```typescript
// eslint-disable-next-line react-hooks/incompatible-library
const password = form.watch('password');
```

## Common Patterns

### Form Validation with Zod

```typescript
const schema = z.object({
  email: z.string().email({ message: 'Custom error message' }),
  password: z.string().min(8),
  // Don't use .default() as it makes fields optional - causes type mismatches
  rememberMe: z.boolean(), // ✓ Correct
  // rememberMe: z.boolean().default(false), // ✗ Causes resolver type errors
});

type FormValues = z.infer<typeof schema>;

const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: { email: '', password: '', rememberMe: false },
});
```

### Conditional Rendering with TypeScript

When rendering optional/unknown values from metadata:

```typescript
// Use ternary, not && operator (avoids 'unknown' type issues)
{event.metadata?.tenantId ? (
  <span>{String(event.metadata.tenantId)}</span>
) : null}
```

### Theme Support

- Uses `next-themes` with system/light/dark modes
- Theme switching in `ThemeToggle` component
- Wrapped via `ThemeProvider` in `_app.tsx`

## Type Safety Notes

- **Strict Mode**: TypeScript strict mode is enabled
- **No Implicit Any**: All functions must have explicit return types where ambiguous
- **ESLint**: Configured with `--max-warnings=0` - all warnings are errors in CI

## Development Workflow

1. Run `npm run dev` to start development server
2. Make changes - HMR will update automatically
3. Run `npm run lint` before committing (or rely on pre-commit hook)
4. Run `npm test` for unit tests, `npm run test:e2e:ui` for e2e tests
5. Commit triggers automatic linting and formatting via husky/lint-staged

## Reference Documentation

- **Testing Guide**: See `TESTING.md` for comprehensive testing patterns and examples
- **README**: See `README.md` for project setup and overview
