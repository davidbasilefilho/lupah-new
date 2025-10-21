# AGENTS.md - AI Agent Guidelines for LUPAH Project

This document provides essential context and guidelines for AI agents working on the LUPAH (Lúdico Universo da Pessoa com Altas Habilidades) project.

## Project Overview

**LUPAH** is a guidance program for gifted people in Itu, SP, Brazil. This web platform enables parents to monitor their children's progress in the program.

### Core Functionality

- Parents receive a **static 8-character alphanumeric code** (never resets)
- Parents enter this code on the home page via an OTP input field
- The code is encrypted and stored securely in the database
- Parents can view their children's progress and reports

## Technology Stack

### Frontend Framework
- **TanStack Start** (Release Candidate) - Full-stack React framework
- **React 19.2** - UI library
- **TanStack Router** - Type-safe routing
- **TanStack Query** - Data fetching and caching
- **TanStack Form** - Form management
- **TanStack Table** - Table components

### Styling & UI
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library
- Custom theme system with light/dark mode support

### Backend & Data
- **Convex** - Backend-as-a-Service (real-time database, serverless functions)
- **Clerk** - Authentication and user management
- **Zod v4** - Schema validation and type safety

### Development Tools
- **Bun 1.3** - JavaScript runtime and package manager
- **Biome.js** - Linter and formatter
- **TypeScript** - Type safety

## Project Structure

### Important Files

```
src/
├── env.ts                    # Environment variable definitions (type-safe with @t3-oss/env-core)
├── client.tsx                # Client entry point
├── router.tsx                # Router configuration with SSR query integration
├── styles.css                # Global styles with Tailwind v4 and theme variables
│
├── routes/
│   ├── __root.tsx            # Root layout with providers and devtools
│   └── index.tsx             # Home page (/)
│
├── hooks/                    # Custom React hooks
│
├── components/
│   ├── Header.tsx            # Main header component
│   └── theme-provider.tsx    # Theme context provider
│
└── integrations/
    ├── clerk/                # Clerk authentication integration
    │   └── provider.tsx
    ├── convex/               # Convex backend integration
    │   └── provider.tsx
    └── tanstack-query/       # TanStack Query configuration
        ├── root-provider.tsx
        └── devtools.tsx
```

### Convex Backend

The `convex/` directory (at project root) contains:
- **Schema definitions** - Database table schemas
- **Queries** - Read operations
- **Mutations** - Write operations
- **Actions** - Server-side functions

## Agent Guidelines

### When Uncertain

1. **Use Context7 for Documentation**: If you're unsure about how a specific technology works, search for official documentation using the context7 tool.

2. **Examples to search for**:
   - TanStack Start documentation
   - TanStack Query/Router/Form/Table APIs
   - Convex schema patterns and best practices
   - Clerk authentication flows
   - Tailwind CSS v4 features
   - Zod v4 validation patterns
   - shadcn/ui component usage

### Using Available Tools

1. **TODO Tool**: If a TODO tool is available, use it to track:
   - Incomplete features
   - Code that needs refactoring
   - Known issues or bugs
   - Future enhancements

### Code Standards

#### Environment Variables

All environment variables must be defined in `src/env.ts` with Zod validation:

```typescript
// Server-side only
server: {
  VARIABLE_NAME: z.string().min(1),
}

// Client-side (must have VITE_ prefix)
client: {
  VITE_VARIABLE_NAME: z.string().min(1),
}
```

#### Convex Schema Patterns

**System Fields** (automatically included, don't add these):
- `_id`: Document ID
- `_creationTime`: Creation timestamp in milliseconds

**Common Patterns**:
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tableName: defineTable({
    // String fields
    name: v.string(),

    // Optional fields
    description: v.optional(v.string()),

    // References to other tables
    userId: v.id("users"),

    // Union types for roles/states
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("archived")
    ),

    // Arrays
    tags: v.array(v.string()),

    // Objects with specific shape
    metadata: v.object({
      key: v.string(),
      value: v.string(),
    }),
  })
  // Add indices for efficient queries
  .index("userId", ["userId"])
  .index("status", ["status"]),
});
```

#### Parent Access Code Implementation

For the parent access code feature:

1. **Code Generation**:
   - 8 alphanumeric characters
   - Must be unique
   - Should be cryptographically secure

2. **Storage**:
   - Encrypt before saving to database
   - Store in Convex with proper schema
   - Associate with student/family record

3. **Validation**:
   - Use Zod for input validation
   - Verify code format before authentication
   - Handle incorrect codes gracefully

#### Component Patterns

**shadcn/ui Installation**:
```bash
pnpx shadcn@latest add [component-name]
```

**Styling with Tailwind v4**:
- Use CSS custom properties from `styles.css`
- Leverage dark mode with `.dark` variant
- Use semantic color tokens (e.g., `bg-background`, `text-foreground`)

#### TanStack Router

**File-based routing**:
- Create files in `src/routes/`
- Use `createFileRoute` for route components
- Use `createRootRouteWithContext` for root layout

**Route with data loading**:
```typescript
export const Route = createFileRoute("/path")({
  component: Component,
  loader: async ({ context }) => {
    // Load data here
  },
});
```

### Security Considerations

1. **Never hardcode secrets** - Always use environment variables
2. **Validate all inputs** - Use Zod schemas for runtime validation
3. **Encrypt sensitive data** - Parent codes and personal information
4. **Use Clerk for auth** - Don't implement custom authentication
5. **Follow least privilege** - Only query/mutate necessary data in Convex

### Testing Approach

1. Test parent code flow end-to-end
2. Verify encryption/decryption of codes
3. Test with multiple user roles (parent, admin, etc.)
4. Validate responsive design on mobile devices
5. Test dark mode compatibility

### Debugging Guidelines

1. **Use available devtools**:
   - TanStack Router Devtools (embedded in page)
   - TanStack Query Devtools (embedded in page)
   - React Devtools (browser extension)
   - Convex Dashboard (web interface)

2. **Logging**:
   - Use `console.log` for development
   - Add descriptive error messages
   - Log state changes in complex flows

3. **Common Issues**:
   - Check environment variables are properly set
   - Verify Convex schema matches queries/mutations
   - Ensure Clerk is properly initialized
   - Check network requests in browser DevTools

### Best Practices

1. **Type Safety**: Leverage TypeScript and Zod for maximum type safety
2. **Error Handling**: Always handle errors gracefully with user-friendly messages
3. **Accessibility**: Follow WCAG guidelines, use semantic HTML
4. **Performance**: Use TanStack Query for efficient data fetching and caching
5. **Code Organization**: Keep components small and focused
6. **Documentation**: Add JSDoc comments for complex functions
7. **Internationalization**: Keep text in Portuguese (pt-BR) as it's for Brazilian users

### Language & Localization

- **Primary Language**: Portuguese (Brazil) - `pt-BR`
- All user-facing text should be in Portuguese
- Date/time formatting should use Brazilian conventions
- Keep technical documentation (like this file) in English for broader accessibility

## Getting Started (for Agents)

When starting work on this project:

1. Read `src/env.ts` to understand environment setup
2. Review `src/routes/__root.tsx` to understand provider structure
3. Check existing schemas in `convex/schema.ts`
4. Familiarize yourself with the component library in `src/components/`
5. Use context7 to search for documentation when needed

## Common Commands

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build for production
bun run build

# Run linter
bun run lint

# Format code
bun run format

# Add shadcn component
pnpx shadcn@latest add [component]
```

## Questions to Ask User

If you need clarification on:
- Specific business logic for the gifted program
- Data relationships between students, parents, and progress
- Authentication flow details
- Required reports or progress metrics
- UI/UX preferences beyond the basic requirements

Don't hesitate to ask the user for clarification rather than making assumptions.

---

**Last Updated**: 2025
**Project**: LUPAH Platform
**Location**: Itu, SP, Brazil
