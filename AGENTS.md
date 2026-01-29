# AGENTS.md

This file provides guidelines for agentic coding assistants working on this repository.

## Commands

### Development
```bash
pnpm dev              # Start development server (http://localhost:3000)
pnpm build            # Build for production (runs prisma generate && next build)
pnpm start            # Start production server
pnpm lint             # Run ESLint
```

### Database
```bash
pnpm prisma generate  # Generate Prisma client (auto-runs after install)
pnpm prisma migrate dev     # Create and apply migrations
pnpm prisma studio          # Open Prisma Studio GUI
pnpm prisma migrate reset   # Reset database (WARNING: deletes data)
```

### Testing
No test framework is currently configured. When adding tests, check with the user for preferred framework (Jest, Vitest, Playwright, etc.).

To run a single test file (once framework is configured):
```bash
# Jest example
pnpm test -- path/to/test.test.ts

# Vitest example
pnpm test path/to/test.test.ts

# Playwright example
pnpm test path/to/test.spec.ts
```

## Code Style Guidelines

### Imports
- Use `@/` alias for absolute imports from project root
- Import specific components from shadcn/ui: `import { Button } from '@/components/ui/button'`
- Group imports: React/hooks → external packages → internal modules
- Always import from `lucide-react` for icons

### TypeScript
- Strict mode enabled - all code must be type-safe
- Define types explicitly using `interface` or `type`
- Export inferred types from Zod schemas: `export type CreateProductInput = z.infer<typeof createProductSchema>`
- Use generics for reusable functions/hooks
- Avoid `any` - use `unknown` or proper types instead

### Naming Conventions
- **Components**: PascalCase (e.g., `ProductsTable`, `ProductFormDialog`)
- **Functions/Methods**: camelCase (e.g., `getProducts`, `fetchData`)
- **React Hooks**: camelCase starting with `use` (e.g., `useProducts`, `useDebounce`)
- **Constants**: SCREAMING_SNAKE_CASE for truly constant values
- **Types/Interfaces**: PascalCase (e.g., `Product`, `ProductsResponse`)
- **Files**: kebab-case (e.g., `product-form-dialog.tsx`)
- **Zod Schemas**: descriptive names ending in `Schema` (e.g., `createProductSchema`)

### Component Structure
```tsx
'use client'  // Only for client components

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ComponentProps {
  prop1: string
  prop2?: number
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  const [state, setState] = useState()
  const handleClick = () => { }

  return <div className="...">{/* JSX */}</div>
}
```

### API Routes
```ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams
    const validated = schema.parse(params)
    const result = await Service.method(validated)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error message' },
      { status: 400 }
    )
  }
}
```

### State Management
- Server Components: Use when possible (default in Next.js App Router)
- Client Components: Add `'use client'` directive at top when interactivity needed
- TanStack Query: For server state, mutations, and caching
- React Hook Form + Zod: For form state and validation
- Local state: useState/useEffect for component-specific state

### Error Handling
- Use try-catch for async operations
- Return meaningful error messages
- Log errors with context: `console.error('Context:', error)`
- Use toast notifications for user feedback (Sonner library)

### Database (Prisma)
- Use Prisma client from `@/lib/prisma`
- Create service functions in `src/features/*/lib/*.service.ts`
- Use `cache` from `react` for deduplication: `export const getProducts = cache(async (...) => ...)`
- Handle cascade deletes properly
- Add indexes for frequently queried fields: `@@index([...])`

### Styling (Tailwind CSS)
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Prefer shadcn/ui components over custom implementations
- Follow Tailwind class order: layout → spacing → typography → colors → effects

### File Organization (Feature-Sliced Design)
```
src/features/{feature-name}/
├── components/       # Feature-specific UI components
├── lib/             # Business logic and services
├── schemas/         # Zod validation schemas
└── hooks/           # Custom React hooks
```

### React Best Practices
- Add explicit type annotations for generic values
- Destructure props for better readability
- Use proper dependency arrays in useEffect
- Clean up side effects in useEffect cleanup functions
- Prefer functional state updates: `setPrev(prev => ...)`
- Use `React.memo()` for table rows to prevent re-renders
- Use `React.lazy()` for code splitting large components
- Use `Set` for O(1) lookups instead of array.find()

### Performance
- Debounce search inputs (use `useDebounce` hook from `@/src/hooks/useDebounce`)
- Implement pagination for large datasets
- Use Next.js Image component for images
- Leverage TanStack Query caching (staleTime, gcTime)
- Derive state in render instead of useEffect when possible

### Comments
- Spanish comments are allowed (this is a Spanish-language project)
- Add comments explaining complex logic, not obvious code
- Keep comments concise and up-to-date

## Architecture Notes

This is a Next.js 16 App Router application with:
- **TypeScript** for type safety
- **Prisma** ORM with PostgreSQL
- **TanStack Query** for server state
- **React Hook Form + Zod** for forms
- **shadcn/ui + Radix UI** for components
- **Tailwind CSS 4** for styling
- **Feature-Sliced Design** architecture

All features are organized under `src/features/` with their own components, services, schemas, and hooks. API routes are in `app/api/`.

When adding new features, follow the existing structure and patterns found in `src/features/products/` as a reference.
